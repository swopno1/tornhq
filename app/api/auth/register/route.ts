import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { encrypt } from "@/lib/crypto";
import { validateApiKey } from "@/lib/torn-api";
import { generateToken, hashToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  tornApiKey: z.string().min(10, "Invalid Torn API key"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { email, password, tornApiKey } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    const tornResult = await validateApiKey(tornApiKey.trim());
    if (!tornResult) {
      return NextResponse.json(
        { error: "Could not validate Torn API key. Check it and try again." },
        { status: 400 },
      );
    }

    const existingTorn = await prisma.user.findUnique({
      where: { tornId: tornResult.playerId },
    });
    if (existingTorn) {
      return NextResponse.json(
        { error: "This Torn account is already linked to another email." },
        { status: 409 },
      );
    }

    const passwordHash = await hash(password, 12);
    const apiKeyEnc = encrypt(tornApiKey.trim());
    const verificationToken = generateToken();
    const verificationTokenHash = hashToken(verificationToken);
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        tornId: tornResult.playerId,
        apiKeyEnc,
        emailVerificationToken: verificationTokenHash,
        emailVerificationExpiry: verificationExpiry,
      },
    });

    await sendVerificationEmail(normalizedEmail, verificationToken);

    return NextResponse.json(
      { message: "Account created. Check your email to verify your address." },
      { status: 201 },
    );
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 },
    );
  }
}
