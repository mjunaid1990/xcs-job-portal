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
import {
  ArrowLeft,
  AlertCircle,
  Star,
  ExternalLink,
  ShieldCheck,
  Clock,
  UserCheck,
} from "lucide-react";

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
  const clientReview = contract.reviews.find((r) => r.reviewerId === contract.clientId);
  const freelancerReview = contract.reviews.find((r) => r.reviewerId === contract.freelancerId);

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
    <div className="space-y-6">
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

          {/* 2. Contract Completion & Mutual Reviews */}
          {contract.status === "COMPLETED" && (
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Mutual Contract Reviews & Feedback
                  </h2>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <span>Contract Completed</span>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Client Review of Freelancer */}
                <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-4.5 dark:border-zinc-800/80 dark:bg-zinc-800/40 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        <UserCheck className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>Client Review of Freelancer</span>
                      </div>
                      <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                        {contract.client.name}
                      </span>
                    </div>

                    {clientReview ? (
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center gap-1 text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < clientReview.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-zinc-300 dark:text-zinc-700"
                              }`}
                            />
                          ))}
                          <span className="ml-1 text-xs font-bold text-zinc-800 dark:text-zinc-200">
                            {clientReview.rating}.0
                          </span>
                          <span className="ml-auto text-xs text-zinc-400">
                            {new Date(clientReview.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {clientReview.comment ? (
                          <p className="text-xs text-zinc-700 dark:text-zinc-300 italic leading-relaxed">
                            &quot;{clientReview.comment}&quot;
                          </p>
                        ) : (
                          <p className="text-xs text-zinc-400 italic">
                            Client submitted a rating without written comments.
                          </p>
                        )}
                      </div>
                    ) : isClient ? (
                      <div className="pt-1">
                        <ContractReviewForm
                          contractId={contract.id}
                          counterpartRole="Freelancer"
                          counterpartName={contract.freelancer.name}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 rounded-lg border border-dashed border-zinc-200 p-4 text-xs text-zinc-400 dark:border-zinc-700">
                        <Clock className="h-4 w-4 shrink-0 text-zinc-400" />
                        <span>Awaiting client feedback from {contract.client.name}...</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Freelancer Review of Client */}
                <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-4.5 dark:border-zinc-800/80 dark:bg-zinc-800/40 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        <UserCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Freelancer Review of Client</span>
                      </div>
                      <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        {contract.freelancer.name}
                      </span>
                    </div>

                    {freelancerReview ? (
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center gap-1 text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < freelancerReview.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-zinc-300 dark:text-zinc-700"
                              }`}
                            />
                          ))}
                          <span className="ml-1 text-xs font-bold text-zinc-800 dark:text-zinc-200">
                            {freelancerReview.rating}.0
                          </span>
                          <span className="ml-auto text-xs text-zinc-400">
                            {new Date(freelancerReview.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {freelancerReview.comment ? (
                          <p className="text-xs text-zinc-700 dark:text-zinc-300 italic leading-relaxed">
                            &quot;{freelancerReview.comment}&quot;
                          </p>
                        ) : (
                          <p className="text-xs text-zinc-400 italic">
                            Freelancer submitted a rating without written comments.
                          </p>
                        )}
                      </div>
                    ) : isFreelancer ? (
                      <div className="pt-1">
                        <ContractReviewForm
                          contractId={contract.id}
                          counterpartRole="Client"
                          counterpartName={contract.client.name}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 rounded-lg border border-dashed border-zinc-200 p-4 text-xs text-zinc-400 dark:border-zinc-700">
                        <Clock className="h-4 w-4 shrink-0 text-zinc-400" />
                        <span>Awaiting freelancer feedback from {contract.freelancer.name}...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
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
