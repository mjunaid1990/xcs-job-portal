import { auth } from "@/server/lib/auth";
import { redirect } from "next/navigation";
import { MessagingService } from "@/server/services/messaging.service";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import type { NavItem } from "@/components/layout/nav-links";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user;
  const roles = user.roles ?? [];
  const isClient = roles.includes("CLIENT");
  const isFreelancer = roles.includes("FREELANCER");
  const isAdmin = roles.includes("ADMIN");

  let unreadMessagesCount = 0;
  try {
    unreadMessagesCount = await MessagingService.getUnreadCount(user.id);
  } catch {
    unreadMessagesCount = 0;
  }

  // Top header navigation: Dashboard is strictly first menu item, max 2 words per item, clean neutrals
  const navItems: NavItem[] = isFreelancer
    ? [
        { label: "Dashboard", href: "/freelancer" },
        { label: "Proposals", href: "/freelancer/proposals" },
        { label: "Contracts", href: "/freelancer/contracts" },
        { label: "Marketplace", href: "/jobs" },
        { label: "Messages", href: "/messages", badge: unreadMessagesCount },
      ]
    : isClient
      ? [
          { label: "Dashboard", href: "/client" },
          { label: "My Jobs", href: "/client/jobs" },
          { label: "Contracts", href: "/client/contracts" },
          { label: "Talent", href: "/freelancers" },
          { label: "Messages", href: "/messages", badge: unreadMessagesCount },
        ]
      : isAdmin
        ? [
            { label: "Dashboard", href: "/admin" },
            { label: "Categories", href: "/admin/categories" },
            { label: "Settings", href: "/admin/settings" },
            { label: "Messages", href: "/messages", badge: unreadMessagesCount },
          ]
        : [
            { label: "Dashboard", href: "/dashboard" },
            { label: "Marketplace", href: "/jobs" },
            { label: "Messages", href: "/messages", badge: unreadMessagesCount },
          ];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 flex flex-col justify-between">
      {/* Top Ambient Glow Line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80" />

      {/* Top Navigation Bar */}
      <DashboardHeader user={user} navItems={navItems} />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">{children}</main>
    </div>
  );
}
