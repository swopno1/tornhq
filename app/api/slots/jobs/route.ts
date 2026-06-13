import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { inngest } from "@/inngest/client";

const createSchema = z.object({
  betAmount: z.number().int().positive(),
  intervalSecs: z.number().int().min(5).max(86400),
  totalRuns: z.number().int().min(1).max(1000),
  minBalance: z.number().int().min(0).default(0),
  isRecurring: z.boolean().default(false),
  runHourUtc: z.number().int().min(0).max(23).nullable().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!session.user.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const jobs = await prisma.slotsJob.findMany({
    where: { userId: session.user.userId },
    orderBy: { createdAt: "desc" },
    include: {
      logs: {
        orderBy: { spunAt: "desc" },
        take: 10,
        select: { id: true, betAmount: true, won: true, balanceBefore: true, spunAt: true },
      },
    },
  });

  return NextResponse.json(jobs);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!session.user.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.userId },
    select: { apiKeyEnc: true },
  });
  if (!user?.apiKeyEnc) {
    return NextResponse.json(
      { error: "Set your Torn API key in Settings first." },
      { status: 400 },
    );
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const { betAmount, intervalSecs, totalRuns, minBalance, isRecurring, runHourUtc } = parsed.data;

  const job = await prisma.slotsJob.create({
    data: {
      userId: session.user.userId,
      betAmount,
      intervalSecs,
      totalRuns,
      minBalance,
      isRecurring,
      runHourUtc: isRecurring ? (runHourUtc ?? 0) : null,
      status: "RUNNING",
    },
  });

  await inngest.send({ name: "slots/job.tick", data: { jobId: job.id } });

  return NextResponse.json(job, { status: 201 });
}
