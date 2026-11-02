import { auth } from "@/server/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MessagingService } from "@/server/services/messaging.service";
import { CommandPalette } from "@/components/layout/command-palette";
import { UserNavDropdown } from "@/components/layout/user-nav-dropdown";
import { ShieldCheck, Bell } from "lucide-react";

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
  const unreadMessagesCount = await MessagingService.getUnreadCount(user.id);

  // Top header navigation: Dashboard is strictly first menu item, max 2 words per item, clean neutrals
  const navItems = isFreelancer
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

      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/80 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/80 transition-all">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand & Left Navigation */}
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-xs group-hover:scale-105 transition-transform dark:bg-zinc-100 dark:text-zinc-900">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                  Work<span className="text-indigo-600 dark:text-indigo-400">Wasl</span>
                </span>
              </div>
            </Link>

            {/* Core Header Navigation */}
            <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-zinc-200 dark:border-zinc-800">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  <span>{item.label}</span>
                  {typeof item.badge === "number" && item.badge > 0 && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[9px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* User profile & actions */}
          <div className="flex items-center gap-3">
            <CommandPalette />

            <Link
              href="/notifications"
              aria-label="Notifications"
              className="relative rounded-xl p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition"
            >
              <Bell className="h-4 w-4" />
            </Link>

            <div className="pl-2 border-l border-zinc-200 dark:border-zinc-800">
              <UserNavDropdown user={user} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">{children}</main>
    </div>
  );
}
