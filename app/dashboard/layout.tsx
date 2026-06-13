import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Providers } from "@/components/providers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <Providers>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex flex-col">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-4 pb-20 md:pb-4">
            {children}
          </main>
          <BottomNav />
        </SidebarInset>
      </SidebarProvider>
    </Providers>
  );
}
