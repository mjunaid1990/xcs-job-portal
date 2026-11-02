"use client";

import Link from "next/link";
import { ContractHuddleModal } from "@/components/chat/contract-huddle-modal";
import { OpenDisputeModal } from "@/components/forms/open-dispute-modal";
import {
  MessageSquare,
  Receipt,
  ShieldCheck,
  Building2,
  User,
  CheckCircle2,
  Clock,
} from "lucide-react";

interface ContractSidebarProps {
  contract: {
    id: string;
    totalCents: bigint | number;
    currency: string;
    status: string;
    createdAt: Date | string;
    clientFeeCents?: bigint | number | null;
    freelancerFeeCents?: bigint | number | null;
    job: { title: string };
    client: {
      id: string;
      name: string;
      clientProfile?: { companyName?: string | null } | null;
    };
    freelancer: {
      id: string;
      name: string;
    };
    milestones: Array<{
      id: string;
      title: string;
      amountCents: bigint | number;
      status: string;
    }>;
  };
  conversationUrl: string;
  isClient: boolean;
  isFreelancer: boolean;
  canDispute: boolean;
  hasActiveDispute: boolean;
}

export function ContractSidebar({
  contract,
  conversationUrl,
  isClient,
  isFreelancer,
  canDispute,
  hasActiveDispute,
}: ContractSidebarProps) {
  const totalAmount = Number(contract.totalCents) / 100;

  // Calculate breakdown
  let releasedCents = 0;
  let inEscrowCents = 0;
  let pendingCents = 0;

  contract.milestones.forEach((m) => {
    const amt = Number(m.amountCents);
    if (m.status === "RELEASED") {
      releasedCents += amt;
    } else if (
      m.status === "FUNDED" ||
      m.status === "SUBMITTED" ||
      m.status === "REVISION_REQUESTED"
    ) {
      inEscrowCents += amt;
    } else {
      pendingCents += amt;
    }
  });

  const releasedAmount = releasedCents / 100;
  const inEscrowAmount = inEscrowCents / 100;
  const pendingAmount = pendingCents / 100;

  const completedCount = contract.milestones.filter((m) => m.status === "RELEASED").length;
  const progressPercent =
    contract.milestones.length > 0
      ? Math.round((completedCount / contract.milestones.length) * 100)
      : 0;

  const counterpartName = isClient
    ? contract.freelancer.name
    : (contract.client.clientProfile?.companyName ?? contract.client.name);
  const counterpartRole = isClient ? "Freelancer" : "Client";

  return (
    <div className="space-y-6">
      {/* 1. Primary Action & Communication Card */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Workroom Actions
        </h3>

        <div className="space-y-2 pt-1">
          <Link
            href={conversationUrl}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 transition"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Open Workroom Chat</span>
          </Link>

          <Link
            href={`/contracts/${contract.id}/invoice`}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 transition"
          >
            <Receipt className="h-4 w-4 text-zinc-400" />
            <span>View Official Invoice</span>
          </Link>

          <div className="w-full">
            <ContractHuddleModal
              contractId={contract.id}
              counterpartName={counterpartName}
              counterpartRole={counterpartRole}
            />
          </div>

          {canDispute && !hasActiveDispute && (
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 text-center">
              <OpenDisputeModal
                contractId={contract.id}
                milestones={contract.milestones.map((m) => ({
                  id: m.id,
                  title: m.title,
                  status: m.status,
                }))}
              />
            </div>
          )}
        </div>
      </div>

      {/* 2. Financial & Escrow Telemetry Card */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Escrow Financials
          </h3>
          <span className="font-mono text-xs font-semibold text-zinc-400">USD</span>
        </div>

        {/* Total Value */}
        <div>
          <div className="text-[11px] font-medium text-zinc-500">Total Contract Value</div>
          <div className="font-mono text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
            $
            {totalAmount.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>

        {/* Escrow Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-zinc-600 dark:text-zinc-300">
              Disbursement Progress
            </span>
            <span className="font-bold text-zinc-900 dark:text-zinc-100">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-[10px] text-zinc-400">
            {completedCount} of {contract.milestones.length} milestones released
          </div>
        </div>

        {/* Breakdown List */}
        <div className="space-y-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Released to Freelancer</span>
            </span>
            <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
              ${releasedAmount.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-zinc-500 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
              <span>Secured in Escrow</span>
            </span>
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
              ${inEscrowAmount.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-zinc-500 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-zinc-400" />
              <span>Pending Funding</span>
            </span>
            <span className="font-mono font-bold text-zinc-500">${pendingAmount.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-dashed border-zinc-200 dark:border-zinc-800 text-[11px]">
            <span className="text-zinc-400">Platform Fee Policy</span>
            <span className="font-semibold text-zinc-600 dark:text-zinc-300">
              Flat $1.00 / contract
            </span>
          </div>
        </div>
      </div>

      {/* 3. Participants Card */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Parties</h3>

        <div className="space-y-3">
          {/* Client */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 font-bold text-xs">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {contract.client.clientProfile?.companyName ?? contract.client.name}
                </div>
                <div className="text-[10px] text-zinc-400">Client</div>
              </div>
            </div>
            {isFreelancer && (
              <Link
                href={conversationUrl}
                className="text-[11px] font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Chat
              </Link>
            )}
          </div>

          {/* Freelancer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 font-bold text-xs">
                <User className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {contract.freelancer.name}
                </div>
                <div className="text-[10px] text-zinc-400">Freelancer</div>
              </div>
            </div>
            {isClient && (
              <Link
                href={conversationUrl}
                className="text-[11px] font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Chat
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
