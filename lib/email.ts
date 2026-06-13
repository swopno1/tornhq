import "server-only";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM ?? "TornHQ <noreply@tornhq.app>";
const APP_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export async function sendVerificationEmail(to: string, token: string) {
  const url = `${APP_URL}/api/auth/verify-email?token=${token}`;
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Verify your TornHQ email address",
    text: `Verify your TornHQ account:\n\n${url}\n\nThis link expires in 24 hours. If you didn't sign up, ignore this email.`,
    html: emailTemplate("Verify Your Email", `
      <p>Click the button below to verify your email address and activate your TornHQ account.</p>
      <p><a href="${url}" class="btn">Verify Email Address</a></p>
      <p class="note">This link expires in 24 hours. If you didn't create an account, ignore this email.</p>
    `),
  });
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const url = `${APP_URL}/reset-password?token=${token}`;
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Reset your TornHQ password",
    text: `Reset your TornHQ password:\n\n${url}\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.`,
    html: emailTemplate("Reset Your Password", `
      <p>Click the button below to reset your TornHQ password.</p>
      <p><a href="${url}" class="btn">Reset Password</a></p>
      <p class="note">This link expires in 1 hour. If you didn't request a reset, ignore this email — your password won't change.</p>
    `),
  });
}

function emailTemplate(heading: string, body: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body{background:#0a0a0a;color:#e0e0e0;font-family:monospace;margin:0;padding:20px}
  .card{background:#111;border:1px solid #1e2830;border-radius:8px;max-width:480px;margin:40px auto;padding:32px}
  .logo{color:#00d4ff;font-weight:900;font-size:18px;letter-spacing:.2em;margin-bottom:24px}
  h2{color:#f0f0f0;font-size:16px;letter-spacing:.1em;margin:0 0 16px;text-transform:uppercase}
  p{color:#888;font-size:13px;line-height:1.6;margin:0 0 20px}
  .btn{display:inline-block;background:#00d4ff;color:#000;font-weight:700;font-size:13px;letter-spacing:.1em;padding:12px 24px;border-radius:4px;text-decoration:none}
  .note{color:#555;font-size:11px}
  .footer{margin-top:24px;border-top:1px solid #1e2830;padding-top:16px}
</style>
</head>
<body>
<div class="card">
  <div class="logo">TORNHQ</div>
  <h2>${heading}</h2>
  ${body}
  <div class="footer">
    <p class="note">TornHQ — Not affiliated with Torn City Ltd.</p>
  </div>
</div>
</body>
</html>`;
}
