import { auth } from "@/server/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { NotificationService } from "@/server/services/notification.service";
import { formatNotification } from "@/lib/notification-format";
import { EmptyState } from "@/components/ui/empty-state";
import { MarkNotificationsReadButton } from "@/components/forms/mark-notifications-read-button";
import {
  Bell,
  Briefcase,
  FileCheck,
  DollarSign,
  Star,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

function getNotificationIcon(category: string) {
  switch (category) {
    case "proposal":
      return <Briefcase className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />;
    case "contract":
      return <FileCheck className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />;
    case "payment":
      return <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />;
    case "review":
      return <Star className="h-5 w-5 text-amber-500" />;
    case "dispute":
      return <AlertCircle className="h-5 w-5 text-rose-500" />;
    case "message":
      return <MessageSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />;
    default:
      return <ShieldCheck className="h-5 w-5 text-zinc-500" />;
  }
}

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const notifications = await NotificationService.getUserNotifications(session.user.id, 50);
  const hasUnread = notifications.some((n) => !n.readAt);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Notifications & Activity Alerts
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Real-time updates on your proposals, contract milestones, escrow funds, and team
            communications.
          </p>
        </div>
        <MarkNotificationsReadButton hasUnread={hasUnread} />
      </div>

      {/* Main Notification Stream Card */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
          {notifications.map((n) => {
            const formatted = formatNotification(n.type, n.payload);
            const isUnread = !n.readAt;
            const hasLink = Boolean(formatted.href);

            const content = (
              <>
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 group-hover:scale-105 transition">
                    {getNotificationIcon(formatted.category)}
                  </div>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2
                        className={`font-bold text-sm text-zinc-900 dark:text-zinc-100 transition ${
                          hasLink
                            ? "group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                            : ""
                        }`}
                      >
                        {formatted.title}
                      </h2>
                      {isUnread && (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          Unread
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {formatted.message}
                    </p>

                    <p className="text-xs text-zinc-400 pt-0.5">
                      {new Date(n.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                {hasLink && (
                  <div className="flex items-center self-center shrink-0 text-zinc-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                )}
              </>
            );

            if (formatted.href) {
              return (
                <Link
                  key={n.id}
                  href={formatted.href}
                  className={`group flex items-start justify-between gap-4 p-5 sm:p-6 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/40 ${
                    isUnread ? "bg-emerald-50/30 dark:bg-emerald-950/20" : ""
                  }`}
                >
                  {content}
                </Link>
              );
            }

            return (
              <div
                key={n.id}
                className={`flex items-start justify-between gap-4 p-5 sm:p-6 ${
                  isUnread ? "bg-emerald-50/20 dark:bg-emerald-950/15" : ""
                }`}
              >
                {content}
              </div>
            );
          })}

          {notifications.length === 0 && (
            <div className="p-12 text-center">
              <EmptyState
                icon={Bell}
                title="You're all caught up!"
                description="No unread notifications. New proposal updates, milestone escrow releases, and messages will appear here."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
