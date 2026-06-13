import { inngest } from "./client";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import { callTornApi } from "@/lib/torn-api";
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
      users.map((user: { id: string; apiKeyEnc: string }) =>
        step.run(`snapshot-${user.id}`, async () => {
          const apiKey = decrypt(user.apiKeyEnc);
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
    if (!apiUser) return { skipped: "no users" };

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

    const apiKey = decrypt(apiUser.apiKeyEnc);

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
