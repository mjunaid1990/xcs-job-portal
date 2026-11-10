"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileCheck,
  Briefcase,
  Sparkles,
  ShieldAlert,
  X,
  ChevronRight,
} from "lucide-react";

export interface DashboardAlertItem {
  id: string;
  type?: "action" | "warning" | "info" | "success";
  title: string;
  message: string;
  badge?: string;
  actionLabel?: string;
  actionHref?: string;
  meta?: string;
  dismissible?: boolean;
}

interface DashboardAlertBannerProps {
  role: "CLIENT" | "FREELANCER" | "ADMIN";
  alerts: DashboardAlertItem[];
  className?: string;
}

export function DashboardAlertBanner({
  role,
  alerts: initialAlerts,
  className = "",
}: DashboardAlertBannerProps) {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  const activeAlerts = initialAlerts.filter((a) => !dismissedIds.includes(a.id));

  if (activeAlerts.length === 0) return null;

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => [...prev, id]);
  };

  const getIcon = (type?: string) => {
    switch (type) {
      case "warning":
        return <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
      case "action":
        return <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      default:
        return role === "CLIENT" ? (
          <Briefcase className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        ) : role === "ADMIN" ? (
          <ShieldAlert className="h-4 w-4 text-rose-600 dark:text-rose-400" />
        ) : (
          <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        );
    }
  };

  const getStyle = (type?: string) => {
    switch (type) {
      case "warning":
        return "border-amber-200/90 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20";
      case "action":
        return "border-emerald-200/90 bg-emerald-50/40 dark:border-emerald-900/50 dark:bg-emerald-950/20";
      case "success":
        return "border-emerald-200/90 bg-emerald-50/40 dark:border-emerald-900/50 dark:bg-emerald-950/20";
      default:
        return "border-zinc-200 bg-zinc-50/70 dark:border-zinc-800 dark:bg-zinc-900/50";
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {activeAlerts.map((alert) => (
        <div
          key={alert.id}
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 rounded-2xl border p-4 sm:p-4.5 transition-all shadow-2xs ${getStyle(
            alert.type,
          )}`}
        >
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-2xs dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 mt-0.5">
              {getIcon(alert.type)}
            </div>

            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {alert.title}
                </h4>
                {alert.badge && (
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {alert.badge}
                  </span>
                )}
                {alert.meta && (
                  <span className="text-[11px] text-zinc-400">&middot; {alert.meta}</span>
                )}
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-3xl">
                {alert.message}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0 pt-1 sm:pt-0">
            {alert.actionHref && alert.actionLabel && (
              <Link
                href={alert.actionHref}
                className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition"
              >
                <span>{alert.actionLabel}</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            )}

            {alert.dismissible !== false && (
              <button
                type="button"
                onClick={() => handleDismiss(alert.id)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-200/60 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition"
                title="Dismiss alert"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
