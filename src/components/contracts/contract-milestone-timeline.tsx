"use client";

import { Badge } from "@/components/ui/badge";
import { ContractMilestoneActions } from "@/components/forms/contract-milestone-actions";
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  RotateCcw,
  Circle,
  Calendar,
  FileCheck2,
} from "lucide-react";

export interface MilestoneItem {
  id: string;
  position: number;
  title: string;
  description?: string | null;
  amountCents: bigint | number;
  status: string;
  dueDate?: Date | string | null;
  submittedAt?: Date | string | null;
  approvedAt?: Date | string | null;
  releasedAt?: Date | string | null;
}

interface ContractMilestoneTimelineProps {
  contractId: string;
  milestones: MilestoneItem[];
  isClient: boolean;
  isFreelancer: boolean;
}

export function ContractMilestoneTimeline({
  contractId,
  milestones,
  isClient,
  isFreelancer,
}: ContractMilestoneTimelineProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "RELEASED":
        return {
          icon: <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />,
          badgeVariant: "purple" as const,
          label: "Released & Paid",
          bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
          line: "bg-emerald-400 dark:bg-emerald-600",
        };
      case "SUBMITTED":
        return {
          icon: <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400 animate-pulse" />,
          badgeVariant: "info" as const,
          label: "Submitted for Review",
          bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
          line: "bg-amber-400 dark:bg-amber-600",
        };
      case "FUNDED":
        return {
          icon: <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />,
          badgeVariant: "success" as const,
          label: "Funded in Escrow",
          bg: "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800",
          line: "bg-indigo-300 dark:bg-indigo-700",
        };
      case "DISPUTED":
        return {
          icon: <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />,
          badgeVariant: "destructive" as const,
          label: "In Dispute",
          bg: "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800",
          line: "bg-red-300 dark:bg-red-800",
        };
      case "REVISION_REQUESTED":
        return {
          icon: <RotateCcw className="h-4 w-4 text-orange-600 dark:text-orange-400" />,
          badgeVariant: "warning" as const,
          label: "Revision Requested",
          bg: "bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800",
          line: "bg-orange-300 dark:bg-orange-700",
        };
      default:
        return {
          icon: <Circle className="h-3.5 w-3.5 text-zinc-400" />,
          badgeVariant: "secondary" as const,
          label: "Pending Funding",
          bg: "bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700",
          line: "bg-zinc-200 dark:bg-zinc-800",
        };
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-5 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <FileCheck2 className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Milestone Deliverables & Escrow Schedule
            </h2>
            <p className="text-xs text-zinc-500">
              Track work submission, review deliverables, and authorize escrow payouts.
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold text-zinc-400">{milestones.length} Milestones</span>
      </div>

      {/* Vertical Milestone Timeline */}
      <div className="relative mt-6 space-y-6">
        {milestones.map((m, index) => {
          const config = getStatusConfig(m.status);
          const isLast = index === milestones.length - 1;
          const amountDollars = Number(m.amountCents) / 100;

          return (
            <div key={m.id} id={`milestone-${m.id}`} className="relative flex gap-4 group">
              {/* Timeline Track & Node */}
              <div className="relative flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border shadow-2xs transition-transform group-hover:scale-105 z-10 ${config.bg}`}
                >
                  {config.icon}
                </div>
                {!isLast && (
                  <div
                    className={`w-0.5 flex-1 my-1 rounded-full ${config.line}`}
                    style={{ minHeight: "48px" }}
                  />
                )}
              </div>

              {/* Milestone Details Card */}
              <div className="flex-1 rounded-xl border border-zinc-200/70 bg-zinc-50/50 p-4 sm:p-5 transition-all hover:bg-white hover:shadow-xs dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:bg-zinc-900 mb-2">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  {/* Title & Metadata */}
                  <div className="space-y-1.5 flex-1 min-w-0 pr-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-zinc-500">
                        #{m.position}
                      </span>
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {m.title}
                      </h3>
                      <Badge variant={config.badgeVariant} className="text-[10px] py-0.5">
                        {config.label}
                      </Badge>
                    </div>

                    {m.description && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed pt-0.5">
                        {m.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-zinc-400">
                      {m.dueDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Due {new Date(m.dueDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      {m.submittedAt && (
                        <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                          <Clock className="h-3 w-3" />
                          <span>Submitted {new Date(m.submittedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                      {m.releasedAt && (
                        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Released {new Date(m.releasedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Amount & Actions */}
                  <div className="flex flex-col sm:items-end gap-3 shrink-0 self-start sm:self-auto pt-1 sm:pt-0">
                    <div className="font-mono text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      $
                      {amountDollars.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>

                    <ContractMilestoneActions
                      contractId={contractId}
                      milestoneId={m.id}
                      status={m.status}
                      isClient={isClient}
                      isFreelancer={isFreelancer}
                      amountDollars={Math.round(amountDollars)}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
