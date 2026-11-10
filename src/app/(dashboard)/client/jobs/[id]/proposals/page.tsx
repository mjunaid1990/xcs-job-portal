import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/server/lib/auth";
import { ProposalService } from "@/server/services/proposal.service";
import { JobService } from "@/server/services/job.service";
import { ClientProposalActions } from "@/components/forms/client-proposal-actions";
import { ProposalComparisonMatrix } from "@/components/proposals/proposal-comparison-matrix";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ArrowLeft, Calendar, DollarSign, UserCheck, HelpCircle } from "lucide-react";

interface ProposalsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientJobProposalsPage({ params }: ProposalsPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  let job;
  try {
    job = await JobService.getJobById(id);
  } catch {
    notFound();
  }

  if (job.clientId !== session.user.id) {
    redirect("/client");
  }

  const proposals = await ProposalService.getJobProposals(session.user.id, id);

  return (
    <div className="space-y-8">
      <Link
        href="/client/jobs"
        className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to my job postings</span>
      </Link>

      <PageHeader
        title={`Proposals: ${job.title}`}
        description="Review candidate credentials, compare bids, message directly, and award milestone contracts."
      />

      <ProposalComparisonMatrix jobId={job.id} jobTitle={job.title} proposals={proposals} />

      <div className="space-y-4">
        {proposals.map((proposal) => {
          const initials = proposal.freelancer.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          return (
            <div
              key={proposal.id}
              className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 transition-all hover:shadow-md"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-900 font-bold text-white text-xs dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs">
                      {initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/freelancers/${proposal.freelancer.id}`}
                          className="font-bold text-base text-zinc-900 hover:text-emerald-600 dark:text-zinc-100 dark:hover:text-emerald-400 transition"
                        >
                          {proposal.freelancer.name}
                        </Link>
                        <Badge
                          variant={
                            proposal.status === "ACCEPTED"
                              ? "success"
                              : proposal.status === "SHORTLISTED"
                                ? "emerald"
                                : proposal.status === "REJECTED"
                                  ? "destructive"
                                  : "secondary"
                          }
                        >
                          {proposal.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {proposal.freelancer.freelancerProfile?.headline ??
                          "Software Engineer & Consultant"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 pt-1">
                    <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                      <span>${(proposal.bidCents / 100).toFixed(0)}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                      <span>
                        Est:{" "}
                        {proposal.estimatedDays ? `${proposal.estimatedDays} days` : "Flexible"}
                      </span>
                    </span>
                    <span>•</span>
                    <span>Submitted {new Date(proposal.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Status & Actions */}
                <ClientProposalActions
                  jobId={job.id}
                  proposalId={proposal.id}
                  freelancerId={proposal.freelancer.id}
                  currentStatus={proposal.status}
                />
              </div>

              {/* Cover Letter */}
              <div className="mt-5 border-t border-zinc-100 pt-4 dark:border-zinc-800 space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Candidate Cover Pitch
                </h4>
                <div className="rounded-xl bg-zinc-50/60 p-4 text-xs sm:text-sm leading-relaxed text-zinc-700 whitespace-pre-line border border-zinc-100 dark:border-zinc-800/80 dark:bg-zinc-950/40 dark:text-zinc-300">
                  {proposal.coverLetter}
                </div>
              </div>

              {/* Candidate Screening Question Responses */}
              {proposal.screeningAnswers &&
                proposal.screeningAnswers.length > 0 &&
                job.screeningQuestions &&
                job.screeningQuestions.length > 0 && (
                  <div className="mt-4 rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40 space-y-3">
                    <h5 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                      <HelpCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Screening Question Responses</span>
                    </h5>
                    <div className="space-y-2.5 pt-1">
                      {job.screeningQuestions.map((q, idx) => {
                        const answer = proposal.screeningAnswers[idx];
                        return (
                          <div
                            key={idx}
                            className="rounded-lg bg-white p-3 text-xs border border-zinc-200/70 dark:border-zinc-800 dark:bg-zinc-900 space-y-1"
                          >
                            <div className="flex items-start gap-2 font-semibold text-zinc-900 dark:text-zinc-100">
                              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-[9px] font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                                {idx + 1}
                              </span>
                              <span>{q}</span>
                            </div>
                            <p className="pl-6 text-zinc-600 dark:text-zinc-300 leading-relaxed">
                              {answer?.trim() ? (
                                answer
                              ) : (
                                <span className="italic text-zinc-400">No response provided</span>
                              )}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
            </div>
          );
        })}

        {proposals.length === 0 && (
          <EmptyState
            icon={UserCheck}
            title="No proposals submitted yet"
            description="Your listing is live on the marketplace. Verified engineers and designers will submit proposals soon."
          />
        )}
      </div>
    </div>
  );
}
