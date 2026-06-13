import { inngest } from "./client";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import { callTornApi, fetchSlotsBalance, playSlots } from "@/lib/torn-api";
import type { TornBattleStats, TornItemMarketResponse } from "@/lib/torn-api";

export const takeStatSnapshot = inngest.createFunction(
  {
    id: "take-stat-snapshot",
    name: "Take Stat Snapshot (all users)",
    triggers: [{ cron: "0 */6 * * *" }],
  },
  async ({ step }) => {
    const users = await step.run("fetch-users", () =>
      prisma.user.findMany({ select: { id: true, apiKeyEnc: true } }),
    );

    const results = await Promise.allSettled(
      users
        .filter((u) => u.apiKeyEnc != null)
        .map((user) =>
        step.run(`snapshot-${user.id}`, async () => {
          const apiKey = decrypt(user.apiKeyEnc!);
          const data = await callTornApi<TornBattleStats>(
            "/user?selections=battlestats,profile",
            apiKey,
          );

          if (data.error) return { skipped: true, userId: user.id };

          await prisma.statSnapshot.create({
            data: {
              userId: user.id,
              strength: data.strength ?? 0,
              defense: data.defense ?? 0,
              speed: data.speed ?? 0,
              dexterity: data.dexterity ?? 0,
              total: data.total ?? 0,
              level: data.level ?? 0,
              xp: data.xp ?? 0,
            },
          });
          return { ok: true, userId: user.id };
        }),
      ),
    );

    return { processed: users.length, results: results.length };
  },
);

export const pollMarketPrices = inngest.createFunction(
  {
    id: "poll-market-prices",
    name: "Poll Market Prices (all watched items)",
    triggers: [{ cron: "*/15 * * * *" }],
  },
  async ({ step }) => {
    const apiUser = await step.run("get-api-user", () =>
      prisma.user.findFirst({ select: { id: true, apiKeyEnc: true } }),
    );
    if (!apiUser || !apiUser.apiKeyEnc) return { skipped: "no users" };

    const watchedItems = await step.run("get-watched-items", () =>
      prisma.marketItem.findMany({
        where: { watchers: { some: {} } },
        include: {
          watchers: {
            select: { userId: true, alertBelow: true, alertAbove: true },
          },
        },
      }),
    );
    if (!watchedItems.length) return { processed: 0 };

    const apiKey = decrypt(apiUser.apiKeyEnc!);

    const results = await Promise.allSettled(
      watchedItems.map(
        (item: {
          id: string;
          tornItemId: number;
          name: string;
          watchers: { userId: string; alertBelow: number | null; alertAbove: number | null }[];
        }) =>
          step.run(`poll-${item.tornItemId}`, async () => {
            const data = await callTornApi<TornItemMarketResponse>(
              `/market/${item.tornItemId}?selections=itemmarket`,
              apiKey,
            );
            if (data.error || !data.itemmarket?.length) return { skipped: true };

            const listings = data.itemmarket;
            const lowestPrice = listings[0].cost;
            const totalVolume = listings.reduce((s, l) => s + l.amount, 0);
            const totalValue = listings.reduce((s, l) => s + l.cost * l.amount, 0);
            const averagePrice = Math.round(totalValue / Math.max(totalVolume, 1));

            await prisma.pricePoint.create({
              data: { itemId: item.id, lowestPrice, averagePrice, volume: totalVolume },
            });

            const alertTargets = item.watchers.filter(
              (w) =>
                (w.alertBelow !== null && lowestPrice <= w.alertBelow) ||
                (w.alertAbove !== null && lowestPrice >= w.alertAbove),
            );

            await Promise.allSettled(
              alertTargets.map((w) =>
                prisma.alert.create({
                  data: {
                    userId: w.userId,
                    type: "price_alert",
                    payload: {
                      itemId: item.id,
                      itemName: item.name,
                      tornItemId: item.tornItemId,
                      lowestPrice,
                      alertBelow: w.alertBelow,
                      alertAbove: w.alertAbove,
                    },
                  },
                }),
              ),
            );

            return { ok: true, itemId: item.id, lowestPrice };
          }),
      ),
    );

    return { processed: watchedItems.length, results: results.length };
  },
);

export const runSlotsJob = inngest.createFunction(
  { id: "run-slots-job", name: "Run Slots Spin", triggers: [{ event: "slots/job.tick" }] },
  async ({ event, step }) => {
    const { jobId } = event.data as { jobId: string };

    const job = await step.run("fetch-job", () =>
      prisma.slotsJob.findUnique({
        where: { id: jobId },
        include: { user: { select: { apiKeyEnc: true } } },
      }),
    );

    if (!job || job.status !== "RUNNING" || !job.user.apiKeyEnc) {
      return { skipped: true, reason: "not running or no api key" };
    }

    if (job.completedRuns >= job.totalRuns) {
      await step.run("mark-complete", () =>
        prisma.slotsJob.update({ where: { id: jobId }, data: { status: "COMPLETED" } }),
      );
      return { completed: true };
    }

    const spinResult = await step.run("play-spin", async () => {
      const apiKey = decrypt(job.user.apiKeyEnc!);

      // Balance check before every spin
      const balance = await fetchSlotsBalance(apiKey);
      const stopThreshold = job.minBalance > 0 ? job.minBalance : job.betAmount;

      if (balance !== null && balance < stopThreshold) {
        await prisma.slotsJob.update({
          where: { id: jobId },
          data: { status: "PAUSED", lastBalance: balance },
        });
        return { paused: true, reason: "balance_low", balance, newStatus: "PAUSED" as const };
      }

      // Record starting balance on first spin
      if (job.completedRuns === 0 && balance !== null) {
        await prisma.slotsJob.update({
          where: { id: jobId },
          data: { startingBalance: balance },
        });
      }

      let apiResult;
      try {
        apiResult = await playSlots(apiKey, job.betAmount);
      } catch (err) {
        await prisma.slotsJob.update({ where: { id: jobId }, data: { status: "FAILED" } });
        throw err;
      }

      if (apiResult.error) {
        await prisma.slotsJob.update({ where: { id: jobId }, data: { status: "FAILED" } });
        throw new Error(`Torn API error: ${apiResult.error.error}`);
      }

      const won = typeof apiResult.winnings === "number" ? apiResult.winnings : 0;
      const newCompleted = job.completedRuns + 1;
      const newStatus = newCompleted >= job.totalRuns ? "COMPLETED" : "RUNNING";
      const estimatedBalance = balance !== null ? balance - job.betAmount + won : null;

      await prisma.slotsSpinLog.create({
        data: {
          jobId,
          betAmount: job.betAmount,
          won,
          balanceBefore: balance,
          result: apiResult as object,
        },
      });

      await prisma.slotsJob.update({
        where: { id: jobId },
        data: {
          completedRuns: { increment: 1 },
          totalWon: { increment: won },
          lastBalance: estimatedBalance,
          lastRunAt: new Date(),
          status: newStatus,
        },
      });

      return { won, paused: false, newCompleted, newStatus, balance: estimatedBalance };
    });

    if (spinResult.paused || spinResult.newStatus === "COMPLETED") {
      return spinResult;
    }

    // Sleep the interval then verify job is still running before queuing next spin
    await step.sleep("wait-interval", `${job.intervalSecs}s`);

    const statusCheck = await step.run("check-after-sleep", () =>
      prisma.slotsJob.findUnique({ where: { id: jobId }, select: { status: true } }),
    );

    if (statusCheck?.status === "RUNNING") {
      await step.sendEvent("queue-next-spin", {
        name: "slots/job.tick",
        data: { jobId },
      });
    }

    return spinResult;
  },
);

export const triggerDailySlotsJobs = inngest.createFunction(
  {
    id: "trigger-daily-slots",
    name: "Trigger Daily Slots Jobs",
    triggers: [{ cron: "0 * * * *" }], // Runs every hour — checks if any recurring job is due this UTC hour
  },
  async ({ step }) => {
    const currentHour = new Date().getUTCHours();
    const twentyThreeHoursAgo = new Date(Date.now() - 23 * 60 * 60 * 1000);

    const dueJobs = await step.run("find-due-jobs", () =>
      prisma.slotsJob.findMany({
        where: {
          isRecurring: true,
          runHourUtc: currentHour,
          status: { notIn: ["CANCELLED"] },
          OR: [{ lastScheduledAt: null }, { lastScheduledAt: { lt: twentyThreeHoursAgo } }],
        },
        select: { id: true },
      }),
    );

    if (!dueJobs.length) return { triggered: 0, hour: currentHour };

    for (const job of dueJobs) {
      await step.run(`reset-${job.id}`, () =>
        prisma.slotsJob.update({
          where: { id: job.id },
          data: {
            completedRuns: 0,
            totalWon: 0,
            startingBalance: null,
            lastBalance: null,
            status: "RUNNING",
            lastScheduledAt: new Date(),
          },
        }),
      );

      await step.sendEvent(`start-${job.id}`, {
        name: "slots/job.tick",
        data: { jobId: job.id },
      });
    }

    return { triggered: dueJobs.length, hour: currentHour };
  },
);
