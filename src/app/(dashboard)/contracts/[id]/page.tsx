import { auth } from "@/server/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ContractService } from "@/server/services/contract.service";
import { MessagingService } from "@/server/services/messaging.service";
import { ContractMilestoneTimeline } from "@/components/contracts/contract-milestone-timeline";
import { ContractActivityTimeline } from "@/components/contracts/contract-activity-timeline";
import { ContractSidebar } from "@/components/contracts/contract-sidebar";
import { ContractReviewForm } from "@/components/forms/contract-review-form";
import { Badge } from "@/components/ui/badge";
import { formatContractRef } from "@/lib/format";
import { ArrowLeft, AlertCircle, Star, ExternalLink, ShieldCheck } from "lucide-react";

interface ContractPageProps {
  params: Promise<{ id: string }>;
}

export default async function ContractRoomPage({ params }: ContractPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const isAdmin = session.user.roles?.includes("ADMIN") ?? false;

  let contract;
  try {
    contract = await ContractService.getContract(id, session.user.id, isAdmin);
  } catch {
    notFound();
  }

  const isClient = contract.clientId === session.user.id;
  const isFreelancer = contract.freelancerId === session.user.id;
  const activeDispute = contract.disputes.find(
    (d) => d.status === "OPEN" || d.status === "UNDER_REVIEW",
  );
  const userReview = contract.reviews.find((r) => r.reviewerId === session.user.id);

  let conversationUrl = "/messages";
  try {
    const conv = await MessagingService.getOrCreateConversation(
      contract.clientId,
      contract.freelancerId,
      contract.jobId ?? undefined,
      contract.id,
    );
    conversationUrl = `/messages/${conv.id}`;
  } catch {
    // Fallback to /messages
  }

  const canDispute =
    (isClient || isFreelancer) &&
    contract.status !== "COMPLETED" &&
    contract.status !== "CANCELLED";

  const getContractStatusVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "success";
      case "COMPLETED":
        return "purple";
      case "DISPUTED":
        return "destructive";
      default:
        return "warning";
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href={
            isAdmin ? "/admin/disputes" : isClient ? "/client/contracts" : "/freelancer/contracts"
          }
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Contracts</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md border border-zinc-200/80 dark:border-zinc-700/80">
            #{formatContractRef(contract.id)}
          </span>
          <Badge
            variant={getContractStatusVariant(contract.status)}
            dot={contract.status === "ACTIVE"}
          >
            {contract.status}
          </Badge>
        </div>
      </div>

      {/* Contract Title Banner */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
              {contract.job.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
              <span>Started {new Date(contract.createdAt).toLocaleDateString()}</span>
              {contract.jobId && (
                <>
                  <span>•</span>
                  <Link
                    href={`/jobs/${contract.jobId}`}
                    className="inline-flex items-center gap-1 text-indigo-600 hover:underline dark:text-indigo-400 font-medium"
                  >
                    <span>Original Job Scope</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-xl border border-emerald-200/60 dark:border-emerald-900/60 shrink-0 self-start sm:self-auto">
            <ShieldCheck className="h-4 w-4" />
            <span>Escrow Protected Contract</span>
          </div>
        </div>
      </div>

      {/* Active Dispute Banner (if any) */}
      {activeDispute && (
        <div className="flex items-start gap-3.5 rounded-2xl border border-red-500/20 bg-red-50 p-5 text-red-900 dark:bg-red-950/20 dark:text-red-200">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-sm">Dispute Case In Mediation</h3>
            <p className="text-xs text-red-800 dark:text-red-300 leading-relaxed">
              Dispute filed by <span className="font-semibold">{activeDispute.openedBy.name}</span>:
              &quot;{activeDispute.reason}&quot;. Payouts are temporarily held until arbitration is
              complete.
            </p>
          </div>
        </div>
      )}

      {/* Modern 2-Column SaaS Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Workspace Column (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* 1. Milestone Deliverables Roadmap Timeline */}
          <ContractMilestoneTimeline
            contractId={contract.id}
            milestones={contract.milestones}
            isClient={isClient}
            isFreelancer={isFreelancer}
          />

          {/* 2. Contract Completion & Reviews */}
          {contract.status === "COMPLETED" && (
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                <Star className="h-4 w-4 text-amber-500" />
                <span>Contract Feedback & Rating</span>
              </div>

              {!userReview ? (
                <ContractReviewForm
                  contractId={contract.id}
                  counterpartRole={isClient ? "Freelancer" : "Client"}
                />
              ) : (
                <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-800/40 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <span>✓ Feedback Submitted ({userReview.rating}/5 Stars)</span>
                  </div>
                  {userReview.comment && (
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 italic">
                      &quot;{userReview.comment}&quot;
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 3. Chronological Activity & Audit Trail Timeline */}
          <ContractActivityTimeline contract={contract} />
        </div>

        {/* Sidebar Workspace Column (4 cols, sticky) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
          <ContractSidebar
            contract={contract}
            conversationUrl={conversationUrl}
            isClient={isClient}
            isFreelancer={isFreelancer}
            canDispute={canDispute}
            hasActiveDispute={Boolean(activeDispute)}
          />
        </div>
      </div>
    </div>
  );
}
