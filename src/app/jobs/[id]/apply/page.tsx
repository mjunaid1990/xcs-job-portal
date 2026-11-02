import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/server/lib/auth";
import { JobService } from "@/server/services/job.service";
import { ApplyJobForm } from "@/components/forms/apply-job-form";
import { PublicHeader } from "@/components/layout/public-header";
import { extractJobId, getJobUrl, formatJobRef } from "@/lib/format";
import { ArrowLeft, Building2, ShieldCheck, Wallet } from "lucide-react";

interface ApplyPageProps {
  params: Promise<{ id: string }>;
}

export default async function ApplyPage({ params }: ApplyPageProps) {
  const { id } = await params;
  const canonicalId = extractJobId(id);
  const session = await auth();

  if (!session?.user) {
    redirect(`/login?callbackUrl=/jobs/${canonicalId}/apply`);
  }

  let job;
  try {
    job = await JobService.getJobById(canonicalId);
  } catch {
    notFound();
  }

  const companyName = job.client.clientProfile?.companyName ?? job.client.name ?? "Verified Client";
  const isPaymentVerified = job.client.clientProfile?.paymentVerified ?? true;

  const budgetFormatted = () => {
    if (job.budgetType === "HOURLY") {
      if (job.budgetMinCents && job.budgetMaxCents) {
        return `$${job.budgetMinCents / 100} - $${job.budgetMaxCents / 100}/hr`;
      }
      if (job.budgetMaxCents) {
        return `$${job.budgetMaxCents / 100}/hr`;
      }
      return "Hourly Rate";
    }
    if (job.budgetMaxCents) {
      return `$${(job.budgetMaxCents / 100).toLocaleString()}`;
    }
    return "Custom Budget";
  };

  return (
    <div className="min-h-screen bg-zinc-50/70 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <PublicHeader user={session?.user} />

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <Link
          href={getJobUrl(job)}
          className="inline-flex items-center gap-2 rounded-lg text-xs font-semibold text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to job details</span>
        </Link>

        {/* Unified Application Dossier Card */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
          {/* Header Area */}
          <div className="space-y-2 border-b border-zinc-100 pb-5 dark:border-zinc-800">
            <span className="inline-block rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
              Submit Proposal
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {job.title}
            </h1>

            {/* Context Meta Strip */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-1 text-xs text-zinc-500">
              <span className="inline-flex items-center gap-1.5 font-medium text-zinc-800 dark:text-zinc-200">
                <Building2 className="h-3.5 w-3.5 text-zinc-400" />
                <span>{companyName}</span>
              </span>

              {isPaymentVerified && (
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Verified</span>
                </span>
              )}

              <span className="text-zinc-300 dark:text-zinc-700">•</span>

              <span className="inline-flex items-center gap-1 font-semibold text-zinc-800 dark:text-zinc-200">
                <Wallet className="h-3.5 w-3.5 text-zinc-400" />
                <span>Budget: {budgetFormatted()}</span>
              </span>

              <span className="text-zinc-300 dark:text-zinc-700">•</span>

              <span className="font-mono text-[11px] text-zinc-400">{formatJobRef(job.id)}</span>
            </div>
          </div>

          {/* Clean Proposal Form */}
          <ApplyJobForm
            jobId={job.id}
            jobTitle={job.title}
            budgetType={job.budgetType}
            screeningQuestions={job.screeningQuestions ?? []}
            defaultBid={job.budgetMaxCents ? String(job.budgetMaxCents / 100) : "500"}
          />
        </div>
      </div>
    </div>
  );
}
