import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { encrypt } from "@/lib/crypto";
import { validateApiKey } from "@/lib/torn-api";

function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isSuperAdmin(session?.user?.email)) return forbidden();

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      tornId: true,
      emailVerified: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(users);
}

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  tornApiKey: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!isSuperAdmin(session?.user?.email)) return forbidden();

  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { email, password, tornApiKey } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    let tornId: number | undefined;
    let apiKeyEnc: string | undefined;

    if (tornApiKey?.trim()) {
      const tornResult = await validateApiKey(tornApiKey.trim());
      if (!tornResult) {
        return NextResponse.json(
          { error: "Could not validate Torn API key." },
          { status: 400 },
        );
      }
      const tornConflict = await prisma.user.findUnique({ where: { tornId: tornResult.playerId } });
      if (tornConflict) {
        return NextResponse.json(
          { error: "This Torn account is already linked to another user." },
          { status: 409 },
        );
      }
      tornId = tornResult.playerId;
      apiKeyEnc = encrypt(tornApiKey.trim());
    }

    const passwordHash = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        emailVerified: new Date(), // admin-created: pre-verified
        tornId,
        apiKeyEnc,
      },
      select: { id: true, email: true, tornId: true, emailVerified: true, createdAt: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    console.error("[admin/users POST]", err);
    return NextResponse.json({ error: "Failed to create user." }, { status: 500 });
  }
}
