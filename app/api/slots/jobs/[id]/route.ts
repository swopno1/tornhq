import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { inngest } from "@/inngest/client";

const patchSchema = z.object({
  status: z.enum(["RUNNING", "PAUSED", "CANCELLED"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!session.user.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const job = await prisma.slotsJob.findUnique({
    where: { id, userId: session.user.userId },
  });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.slotsJob.update({
    where: { id },
    data: { status: parsed.data.status },
  });

  if (parsed.data.status === "RUNNING" && job.status === "PAUSED") {
    await inngest.send({ name: "slots/job.tick", data: { jobId: id } });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!session.user.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  const job = await prisma.slotsJob.findUnique({
    where: { id, userId: session.user.userId },
  });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.slotsJob.delete({ where: { id } });

  return NextResponse.json({ deleted: true });
}
