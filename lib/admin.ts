import "server-only";

/**
 * Returns true if the given email matches the SUPER_ADMIN_EMAIL env var.
 * Comparison is case-insensitive. Never expose the env var value to the client —
 * pass only the boolean result via the JWT isAdmin flag.
 */
export function isSuperAdmin(email: string | null | undefined): boolean {
  const adminEmail = process.env.SUPER_ADMIN_EMAIL?.toLowerCase().trim();
  if (!adminEmail) return false;
  return email?.toLowerCase().trim() === adminEmail;
}

/**
 * Throws a 403 response if the session email is not the super admin.
 * Used in admin API route handlers.
 */
export function requireSuperAdmin(email: string | null | undefined): void {
  if (!isSuperAdmin(email)) {
    throw new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
}
