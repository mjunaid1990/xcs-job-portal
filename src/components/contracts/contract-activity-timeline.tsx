"use client";

import { useMemo } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  FileText,
  AlertCircle,
  Star,
  Clock,
  ArrowUpRight,
} from "lucide-react";

export interface ActivityItem {
  id: string;
  type:
    | "CONTRACT_CREATED"
    | "CONTRACT_STARTED"
    | "ESCROW_FUNDED"
    | "DELIVERABLE_SUBMITTED"
    | "MILESTONE_RELEASED"
    | "DISPUTE_OPENED"
    | "DISPUTE_RESOLVED"
    | "REVIEW_LEFT"
    | "CONTRACT_COMPLETED";
  title: string;
  description?: string;
  amount?: string;
  timestamp: Date;
  statusBadge?: string;
  badgeColor?: "green" | "blue" | "amber" | "red" | "emerald" | "zinc";
}

interface ContractActivityTimelineProps {
  contract: {
    id: string;
    createdAt: Date | string;
    startedAt?: Date | string | null;
    completedAt?: Date | string | null;
    status: string;
    client: { name: string };
    freelancer: { name: string };
    milestones: Array<{
      id: string;
      position: number;
      title: string;
      amountCents: bigint | number;
      status: string;
      submittedAt?: Date | string | null;
      approvedAt?: Date | string | null;
      releasedAt?: Date | string | null;
    }>;
    ledgerEntries: Array<{
      id: string;
      type: string;
      amountCents: bigint | number;
      createdAt: Date | string;
    }>;
    disputes: Array<{
      id: string;
      status: string;
      reason: string;
      createdAt: Date | string;
      resolvedAt?: Date | string | null;
    }>;
    reviews: Array<{
      id: string;
      rating: number;
      comment?: string | null;
      createdAt: Date | string;
      reviewerId: string;
    }>;
  };
}

export function ContractActivityTimeline({ contract }: ContractActivityTimelineProps) {
  const events = useMemo(() => {
    const list: ActivityItem[] = [];

    // 1. Contract Creation
    list.push({
      id: `c-create-${contract.id}`,
      type: "CONTRACT_CREATED",
      title: "Contract Agreement Established",
      description: `Terms and milestone schedule confirmed between ${contract.client.name} and ${contract.freelancer.name}.`,
      timestamp: new Date(contract.createdAt),
      badgeColor: "blue",
    });

    // 2. Ledger Entries (Escrow Funds, Releases)
    contract.ledgerEntries.forEach((l) => {
      const dollars = (Number(l.amountCents) / 100).toFixed(2);
      if (l.type === "ESCROW_FUND") {
        list.push({
          id: `ledger-${l.id}`,
          type: "ESCROW_FUNDED",
          title: "Escrow Deposit Secured",
          description: `Client funded $${dollars} into protected marketplace escrow.`,
          amount: `+$${dollars}`,
          timestamp: new Date(l.createdAt),
          badgeColor: "blue",
        });
      } else if (l.type === "ESCROW_RELEASE") {
        list.push({
          id: `ledger-${l.id}`,
          type: "MILESTONE_RELEASED",
          title: "Milestone Payout Disbursed",
          description: `$${dollars} released to freelancer payout balance.`,
          amount: `+$${dollars}`,
          timestamp: new Date(l.createdAt),
          badgeColor: "green",
        });
      } else if (l.type === "PLATFORM_FEE") {
        list.push({
          id: `ledger-${l.id}`,
          type: "ESCROW_FUNDED",
          title: "Platform Fee Snapshot Applied",
          description: "Flat $1.00 marketplace service fee recorded.",
          amount: "$1.00",
          timestamp: new Date(l.createdAt),
          badgeColor: "zinc",
        });
      }
    });

    // 3. Milestone Submissions & Approvals
    contract.milestones.forEach((m) => {
      if (m.submittedAt) {
        list.push({
          id: `m-sub-${m.id}`,
          type: "DELIVERABLE_SUBMITTED",
          title: `Milestone #${m.position} Submitted`,
          description: `Deliverables for "${m.title}" submitted by ${contract.freelancer.name} for client review.`,
          timestamp: new Date(m.submittedAt),
          badgeColor: "amber",
        });
      }
    });

    // 4. Disputes
    contract.disputes.forEach((d) => {
      list.push({
        id: `disp-open-${d.id}`,
        type: "DISPUTE_OPENED",
        title: "Dispute Opened & Funds Frozen",
        description: `Reason: "${d.reason}". Awaiting administrative mediation.`,
        timestamp: new Date(d.createdAt),
        badgeColor: "red",
      });
      if (d.resolvedAt) {
        list.push({
          id: `disp-res-${d.id}`,
          type: "DISPUTE_RESOLVED",
          title: "Dispute Resolution Finalized",
          description: `Dispute closed with status: ${d.status}.`,
          timestamp: new Date(d.resolvedAt),
          badgeColor: "green",
        });
      }
    });

    // 5. Completion
    if (contract.completedAt) {
      list.push({
        id: `c-comp-${contract.id}`,
        type: "CONTRACT_COMPLETED",
        title: "Contract Completed Successfully",
        description: "All scheduled milestones released. Engagement officially finalized.",
        timestamp: new Date(contract.completedAt),
        badgeColor: "green",
      });
    }

    // 6. Reviews
    contract.reviews.forEach((r) => {
      list.push({
        id: `rev-${r.id}`,
        type: "REVIEW_LEFT",
        title: `Verified ${r.rating}★ Review Submitted`,
        description: r.comment ? `"${r.comment}"` : "Mutual feedback recorded.",
        timestamp: new Date(r.createdAt),
        badgeColor: "amber",
      });
    });

    // Sort descending (most recent first)
    return list.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [contract]);

  const getEventIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "CONTRACT_CREATED":
        return <FileText className="h-4 w-4 text-zinc-500" />;
      case "ESCROW_FUNDED":
        return <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case "DELIVERABLE_SUBMITTED":
        return <ArrowUpRight className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
      case "MILESTONE_RELEASED":
        return <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case "DISPUTE_OPENED":
        return <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
      case "DISPUTE_RESOLVED":
        return <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case "CONTRACT_COMPLETED":
        return <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case "REVIEW_LEFT":
        return <Star className="h-4 w-4 text-amber-500" />;
      default:
        return <Clock className="h-4 w-4 text-zinc-400" />;
    }
  };

  const getIconBackground = (type: ActivityItem["type"]) => {
    switch (type) {
      case "MILESTONE_RELEASED":
      case "CONTRACT_COMPLETED":
        return "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800";
      case "ESCROW_FUNDED":
        return "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800";
      case "DELIVERABLE_SUBMITTED":
      case "REVIEW_LEFT":
        return "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800";
      case "DISPUTE_OPENED":
        return "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800";
      default:
        return "bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700";
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Contract Activity & Audit Trail
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Immutable log of milestones, escrow movements, and deliverable handoffs.
          </p>
        </div>
        <span className="text-[11px] font-semibold text-zinc-400">
          {events.length} Recorded Events
        </span>
      </div>

      <div className="relative mt-6 space-y-6 before:absolute before:inset-0 before:left-4 before:h-full before:w-0.5 before:bg-zinc-100 dark:before:bg-zinc-800">
        {events.map((item) => (
          <div key={item.id} className="relative flex items-start gap-4 group">
            {/* Timeline Node Icon */}
            <div
              className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border shadow-2xs transition-transform group-hover:scale-105 ${getIconBackground(item.type)}`}
            >
              {getEventIcon(item.type)}
            </div>

            {/* Event Content */}
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{item.title}</p>
                <div className="flex items-center gap-2">
                  {item.amount && (
                    <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                      {item.amount}
                    </span>
                  )}
                  <time className="text-[10px] text-zinc-400 whitespace-nowrap">
                    {item.timestamp.toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}{" "}
                    •{" "}
                    {item.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </div>
              </div>

              {item.description && (
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
