import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashToken } from "@/lib/tokens";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const loginUrl = new URL("/login", req.nextUrl.origin);

  if (!token) {
    loginUrl.searchParams.set("error", "invalid-token");
    return NextResponse.redirect(loginUrl);
  }

  const tokenHash = hashToken(token);

  const user = await prisma.user.findUnique({
    where: { emailVerificationToken: tokenHash },
  });

  if (!user) {
    loginUrl.searchParams.set("error", "invalid-token");
    return NextResponse.redirect(loginUrl);
  }

  if (user.emailVerificationExpiry && user.emailVerificationExpiry < new Date()) {
    loginUrl.searchParams.set("error", "token-expired");
    return NextResponse.redirect(loginUrl);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      emailVerificationToken: null,
      emailVerificationExpiry: null,
    },
  });

  loginUrl.searchParams.set("verified", "1");
  return NextResponse.redirect(loginUrl);
}
