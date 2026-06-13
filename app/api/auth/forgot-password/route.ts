import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { isSuperAdmin } from "@/lib/admin";
import { generateToken, hashToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/email";

const schema = z.object({
  email: z.string().email(),
});

const OK = NextResponse.json({
  message: "If that email exists, a reset link has been sent.",
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return OK;

    const email = parsed.data.email.toLowerCase().trim();
    let user = await prisma.user.findUnique({ where: { email } });

    if (isSuperAdmin(email)) {
      // Auto-seed the super admin account on first password reset request.
      // The env var itself serves as the identity proof — no separate email verification needed.
      if (!user) {
        user = await prisma.user.create({
          data: { email, emailVerified: new Date() },
        });
      } else if (!user.emailVerified) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: new Date() },
        });
      }
    } else {
      if (!user || !user.emailVerified) return OK;
    }

    // Expire any existing unused reset tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    const token = generateToken();
    const tokenHash = hashToken(token);
    // Token is scoped to this specific userId — cannot be used to reset any other account
    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
    });

    await sendPasswordResetEmail(email, token);
    return OK;
  } catch (err) {
    console.error("[forgot-password]", err);
    return OK;
  }
}
