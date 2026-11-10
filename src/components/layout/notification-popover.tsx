"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { formatNotification } from "@/lib/notification-format";
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from "@/server/actions/notification.actions";
import {
  Bell,
  CheckCheck,
  Briefcase,
  FileCheck,
  DollarSign,
  Star,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  Loader2,
} from "lucide-react";

export interface SerializedNotification {
  id: string;
  type: string;
  payload: unknown;
  readAt: string | Date | null;
  createdAt: string | Date;
}

interface NotificationPopoverProps {
  initialNotifications?: SerializedNotification[];
  initialUnreadCount?: number;
}

function getNotificationIcon(category: string) {
  switch (category) {
    case "proposal":
      return <Briefcase className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
    case "contract":
      return <FileCheck className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />;
    case "payment":
      return <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
    case "review":
      return <Star className="h-4 w-4 text-amber-500" />;
    case "dispute":
      return <AlertCircle className="h-4 w-4 text-rose-500" />;
    case "message":
      return <MessageSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
    default:
      return <ShieldCheck className="h-4 w-4 text-zinc-500" />;
  }
}

function formatRelativeTime(dateInput: string | Date): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const now = new Date();
  const diffSecs = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSecs < 60) return "Just now";
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function NotificationPopover({
  initialNotifications = [],
  initialUnreadCount = 0,
}: NotificationPopoverProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [notifications, setNotifications] =
    useState<SerializedNotification[]>(initialNotifications);
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  const currentRole = pathname.startsWith("/client")
    ? "CLIENT"
    : pathname.startsWith("/freelancer")
      ? "FREELANCER"
      : pathname.startsWith("/admin")
        ? "ADMIN"
        : undefined;

  // Sync state if props change from server revalidation
  useEffect(() => {
    setUnreadCount(initialUnreadCount);
    setNotifications(initialNotifications);
  }, [initialUnreadCount, initialNotifications]);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAllRead = () => {
    startTransition(async () => {
      await markAllNotificationsReadAction();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date() })));
      router.refresh();
    });
  };

  const handleNotificationClick = async (notif: SerializedNotification, href?: string) => {
    if (!notif.readAt) {
      startTransition(async () => {
        await markNotificationReadAction(notif.id);
        setUnreadCount((c) => Math.max(0, c - 1));
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, readAt: new Date() } : n)),
        );
        router.refresh();
      });
    }

    // Default to the user's active dashboard if notification doesn't provide a deeper route
    const targetHref =
      href ||
      (pathname.startsWith("/client")
        ? "/client"
        : pathname.startsWith("/freelancer")
          ? "/freelancer"
          : pathname.startsWith("/admin")
            ? "/admin"
            : "/client");

    setIsOpen(false);
    router.push(targetHref);
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Notifications"
        aria-expanded={isOpen}
        className="relative rounded-xl p-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-xs font-bold text-white shadow-xs ring-2 ring-white dark:ring-zinc-950 animate-in zoom-in-75 duration-150">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-zinc-200/90 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900 z-50 overflow-hidden animate-in fade-in-50 slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-100 p-4 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Notifications</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={isPending}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 transition"
              >
                {isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <CheckCheck className="h-3.5 w-3.5" />
                )}
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List of Latest 5 Notifications */}
          <div className="max-h-[380px] divide-y divide-zinc-100 overflow-y-auto dark:divide-zinc-800/80">
            {notifications.length > 0 ? (
              notifications.slice(0, 5).map((n) => {
                const formatted = formatNotification(n.type, n.payload, currentRole);
                const isUnread = !n.readAt;
                const hasLink = Boolean(formatted.href);

                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => handleNotificationClick(n, formatted.href)}
                    className={`w-full text-left flex items-start gap-3 p-3.5 sm:p-4 transition cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${
                      isUnread ? "bg-emerald-50/30 dark:bg-emerald-950/20" : ""
                    }`}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                      {getNotificationIcon(formatted.category)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                          {formatted.title}
                        </p>
                        <span className="text-xs text-zinc-400 shrink-0">
                          {formatRelativeTime(n.createdAt)}
                        </span>
                      </div>

                      <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                        {formatted.message}
                      </p>
                    </div>

                    {hasLink ? (
                      <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400 self-center" />
                    ) : isUnread ? (
                      <span className="h-2 w-2 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
                    ) : null}
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center">
                <Bell className="mx-auto h-7 w-7 text-zinc-300 dark:text-zinc-600" />
                <p className="mt-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  You are all caught up!
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  No new alerts or contract notifications.
                </p>
              </div>
            )}
          </div>

          {/* Footer View All Link */}
          <div className="border-t border-zinc-100 bg-zinc-50/80 p-2.5 text-center dark:border-zinc-800 dark:bg-zinc-900/80">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-zinc-700 hover:text-emerald-600 dark:text-zinc-300 dark:hover:text-emerald-400 transition"
            >
              <span>View all notifications</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
