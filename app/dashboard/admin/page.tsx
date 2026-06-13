import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AdminUsersClient } from "@/components/admin/AdminUsersClient";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-0.5">
        <h1 className="font-heading text-lg font-black uppercase tracking-widest text-foreground">
          Admin Panel
        </h1>
        <p className="font-mono text-xs text-muted-foreground">
          Manage user accounts — super admin only
        </p>
      </div>
      <AdminUsersClient currentUserId={session.user.userId} />
    </div>
  );
}
