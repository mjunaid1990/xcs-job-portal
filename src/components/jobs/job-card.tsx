import Link from "next/link";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { JobFitBadge } from "@/components/jobs/job-fit-badge";
import { formatRelativeTime, getJobUrl } from "@/lib/format";

export interface JobCardProps {
  job: {
    id: string;
    title: string;
    description: string;
    budgetType: string;
    budgetMinCents?: number | null;
    budgetMaxCents?: number | null;
    currency?: string;
    experienceLevel?: string | null;
    duration?: string | null;
    scope?: string | null;
    createdAt: Date | string;
    category?: { name: string } | null;
    client: {
      name: string;
      clientProfile?: {
        companyName?: string | null;
        paymentVerified?: boolean;
        totalSpentCents?: bigint | number;
      } | null;
    };
    skills: Array<{
      skill: {
        id: string | number;
        name: string;
      };
    }>;
  };
}

export function JobCard({ job }: JobCardProps) {
  const companyName = job.client.clientProfile?.companyName ?? job.client.name ?? "Verified Client";
  const isPaymentVerified = job.client.clientProfile?.paymentVerified ?? true;
  const postedAgo = formatRelativeTime(job.createdAt);

  const formatBudget = () => {
    if (job.budgetType === "HOURLY") {
      if (job.budgetMinCents && job.budgetMaxCents) {
        return `$${job.budgetMinCents / 100} - $${job.budgetMaxCents / 100}/hr`;
      }
      if (job.budgetMaxCents) {
        return `$${job.budgetMaxCents / 100}/hr`;
      }
      return "Hourly Rate";
    }

    // Fixed price
    if (job.budgetMaxCents) {
      return `$${(job.budgetMaxCents / 100).toLocaleString()}`;
    }
    return "Competitive";
  };

  return (
    <div className="group relative rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6 shadow-2xs transition-all duration-200 hover:border-indigo-500/50 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-400/50">
      <Link href={getJobUrl(job)} className="block">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2.5 flex-1 min-w-0 pr-0 sm:pr-4">
            {/* Meta Pill Row */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-medium text-zinc-400">{postedAgo}</span>
              <span>•</span>
              <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                {job.category?.name ?? "General"}
              </span>
              <JobFitBadge jobSkills={job.skills.map((s) => s.skill.name)} compact />
            </div>

            {/* Title */}
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 group-hover:text-indigo-600 dark:text-zinc-100 dark:group-hover:text-indigo-400 transition-colors">
              {job.title}
            </h2>

            {/* Specifications Row */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                {job.budgetType === "HOURLY" ? "Hourly Contract" : "Fixed-Price Escrow"}
              </span>
              <span>•</span>
              <span className="capitalize">
                {job.experienceLevel?.toLowerCase() ?? "intermediate"}
              </span>
              <span>•</span>
              <span>Est. {job.duration ?? "1-3 months"}</span>
            </div>

            {/* Description Snippet */}
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2 pt-0.5">
              {job.description}
            </p>

            {/* Skills Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {job.skills.slice(0, 6).map((s) => (
                <span
                  key={s.skill.id}
                  className="rounded-lg bg-zinc-100/80 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 group-hover:bg-indigo-50 group-hover:text-indigo-700 dark:group-hover:bg-indigo-950/40 dark:group-hover:text-indigo-300 transition-colors"
                >
                  {s.skill.name}
                </span>
              ))}
              {job.skills.length > 6 && (
                <span className="rounded-lg bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-500 dark:bg-zinc-800">
                  +{job.skills.length - 6} more
                </span>
              )}
            </div>
          </div>

          {/* Budget & Action Column */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800">
            <div className="text-left sm:text-right">
              <div className="font-mono text-base sm:text-xl font-black text-zinc-900 dark:text-zinc-100">
                {formatBudget()}
              </div>
              <div className="text-xs text-zinc-400">
                {job.budgetType === "HOURLY" ? "Hourly rate" : "Milestone escrow"}
              </div>
            </div>

            <div className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:translate-x-1 dark:text-indigo-400 transition-transform mt-3">
              <span>View Job</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>

        {/* Client Trust Verification Sub-footer */}
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">{companyName}</span>
            {isPaymentVerified && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Payment Verified</span>
              </span>
            )}
          </div>

          <span className="text-[11px] text-zinc-400 sm:hidden flex items-center gap-1">
            <span>Details</span>
            <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </Link>
    </div>
  );
}
