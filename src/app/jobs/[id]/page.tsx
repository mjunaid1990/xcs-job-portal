import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { JobService } from "@/server/services/job.service";
import { auth } from "@/server/lib/auth";
import { SaveJobButton } from "@/components/forms/save-job-button";
import { ReportJobModal } from "@/components/forms/report-job-modal";
import { JobFitBadge } from "@/components/jobs/job-fit-badge";
import { PublicHeader } from "@/components/layout/public-header";
import { formatRelativeTime } from "@/lib/format";
import {
  ShieldCheck,
  Building2,
  ArrowLeft,
  Send,
  Lock,
  Clock,
  Users,
  Briefcase,
  Layers,
  Calendar,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Lightbulb,
} from "lucide-react";

interface JobDetailsPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: JobDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const job = await JobService.getJobById(id);
    const company = job.client?.clientProfile?.companyName ?? job.client?.name ?? "WorkWasl Client";
    const budget = job.budgetMaxCents
      ? `$${(job.budgetMaxCents / 100).toLocaleString()}`
      : "Custom Budget";
    return {
      title: `${job.title} | ${company}`,
      description: `${job.description.slice(0, 160)}... Budget: ${budget}`,
      openGraph: {
        title: `${job.title} - ${budget}`,
        description: job.description.slice(0, 200),
        type: "article",
        url: `/jobs/${job.id}`,
      },
    };
  } catch {
    return {
      title: "Job Opportunity · WorkWasl",
      description: "View details of this freelance job opportunity on WorkWasl.",
    };
  }
}

export default async function JobDetailsPage({ params }: JobDetailsPageProps) {
  const { id } = await params;
  const session = await auth();

  let job;
  try {
    job = await JobService.getJobById(id);
  } catch {
    notFound();
  }

  const isClientOwner = session?.user?.id === job.clientId;
  const isSaved = session?.user?.id ? await JobService.isJobSaved(session.user.id, id) : false;

  const companyName =
    job.client?.clientProfile?.companyName ?? job.client?.name ?? "Confidential Client";
  const clientInitials = companyName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isPaymentVerified = job.client?.clientProfile?.paymentVerified ?? true;
  const postedAgo = formatRelativeTime(job.createdAt);
  const clientMemberSince = job.client?.createdAt
    ? new Date(job.client.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "Recently joined";

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

    if (job.budgetMaxCents) {
      return `$${(job.budgetMaxCents / 100).toLocaleString()}`;
    }
    return "Competitive";
  };

  const formattedScope = job.scope
    ? `${job.scope.charAt(0).toUpperCase() + job.scope.slice(1).toLowerCase()} Scope`
    : "Medium Scope";

  const formattedLevel = job.experienceLevel
    ? job.experienceLevel.charAt(0).toUpperCase() + job.experienceLevel.slice(1).toLowerCase()
    : "Intermediate";

  // Schema.org JobPosting structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.createdAt.toISOString(),
    validThrough: new Date(job.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    employmentType: "CONTRACTOR",
    hiringOrganization: {
      "@type": "Organization",
      name: companyName,
      sameAs: job.client?.clientProfile?.website ?? undefined,
    },
    jobLocationType: "TELECOMMUTE",
    applicantLocationRequirements: {
      "@type": "Country",
      name: "Worldwide",
    },
    baseSalary: job.budgetMaxCents
      ? {
          "@type": "MonetaryAmount",
          currency: job.currency ?? "USD",
          value: {
            "@type": "QuantitativeValue",
            value: job.budgetMaxCents / 100,
            unitText: job.budgetType === "FIXED" ? "TOTAL" : "HOUR",
          },
        }
      : undefined,
  };

  return (
    <div className="min-h-screen bg-zinc-50/70 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <PublicHeader user={session?.user} />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation Breadcrumb Bar */}
        <div className="flex items-center justify-between border-b border-zinc-200/60 pb-4 dark:border-zinc-800">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 rounded-lg text-xs font-semibold text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to all opportunities</span>
          </Link>

          <ReportJobModal jobId={job.id} />
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* Main Job Briefing Column (8 cols) */}
          <div className="lg:col-span-8">
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
              {/* Header: Category Eyebrow, Title, then Client & Meta below */}
              <div className="space-y-2.5">
                <div>
                  <span className="inline-block rounded-md bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                    {job.category?.name ?? "General Opportunity"}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {job.title}
                </h1>

                {/* Client & Posting Meta Bar below Title */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-zinc-600 dark:text-zinc-400 pt-0.5">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-zinc-100">
                    <Building2 className="h-4 w-4 text-zinc-400" />
                    <span>{companyName}</span>
                  </span>

                  {isPaymentVerified && (
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Payment Verified</span>
                    </span>
                  )}

                  <span className="text-zinc-300 dark:text-zinc-700">•</span>

                  <span className="inline-flex items-center gap-1 text-zinc-500">
                    <Clock className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Posted {postedAgo}</span>
                  </span>
                </div>
              </div>

              {/* Key Specifications Grid (Non-duplicated, unique project dimensions) */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-xl border border-zinc-100 bg-zinc-50/70 p-4 dark:border-zinc-800/80 dark:bg-zinc-950/40">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400">
                    <Briefcase className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Experience Level</span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {formattedLevel}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400">
                    <Layers className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Project Scope</span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {formattedScope}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400">
                    <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Est. Duration</span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {job.duration ?? "1 to 3 months"}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400">
                    <Clock className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Commitment</span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {job.timeCommitment ?? "Flexible"}
                  </p>
                </div>
              </div>

              {/* Detailed Scope of Work */}
              <div className="space-y-2.5 pt-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Detailed Scope of Work
                </h2>
                <div className="whitespace-pre-wrap break-words text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 min-h-[4rem]">
                  {job.description}
                </div>
              </div>

              {/* Structured Deliverables (Rendered only when defined) */}
              {job.deliverables && (
                <div className="space-y-3 rounded-xl border border-indigo-100/80 bg-indigo-50/20 p-4.5 dark:border-indigo-950 dark:bg-indigo-950/10">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Milestone Deliverables & Acceptance Criteria</span>
                  </div>
                  <div className="whitespace-pre-wrap break-words text-xs font-mono leading-relaxed text-zinc-700 dark:text-zinc-300">
                    {job.deliverables}
                  </div>
                </div>
              )}

              {/* Screening Questions (Rendered only when defined) */}
              {job.screeningQuestions && job.screeningQuestions.length > 0 && (
                <div className="space-y-3 rounded-xl border border-amber-200/60 bg-amber-50/40 p-4.5 dark:border-amber-900/40 dark:bg-amber-950/20">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                    <HelpCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span>Applicant Screening Questions</span>
                  </div>
                  <p className="text-xs text-amber-800 dark:text-amber-300/80">
                    You will be asked to answer these questions when submitting your proposal:
                  </p>
                  <div className="space-y-2 pt-1">
                    {job.screeningQuestions.map((q, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 text-xs text-zinc-800 dark:text-zinc-200"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-200/80 text-[11px] font-bold text-amber-900 dark:bg-amber-900/60 dark:text-amber-200">
                          {i + 1}
                        </span>
                        <span className="pt-0.5 leading-snug">{q}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills Section & Single AI Suitability Card */}
              {job.skills.length > 0 && (
                <div className="space-y-4 border-t border-zinc-100 pt-6 dark:border-zinc-800">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Required Skills & Expertise
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((s) => (
                      <span
                        key={s.skill.id}
                        className="rounded-xl border border-zinc-200/90 bg-zinc-50/80 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:border-indigo-300 hover:bg-white dark:border-zinc-800 dark:bg-zinc-800/80 dark:text-zinc-300 dark:hover:border-indigo-600 transition"
                      >
                        {s.skill.name}
                      </span>
                    ))}
                  </div>

                  {/* AI Suitability Match Breakdown (Displayed once, right where skills are evaluated) */}
                  <div className="pt-2">
                    <JobFitBadge jobSkills={job.skills.map((s) => s.skill.name)} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sticky Sidebar: Compensation & Client Dossier (4 cols) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20 self-start">
            {/* Compensation & Action Card */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-5">
              <div>
                <span className="inline-block rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  {job.budgetType === "HOURLY" ? "Hourly Rate" : "Fixed-Price Escrow"}
                </span>
                <div className="mt-2 font-mono text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                  {formatBudget()}
                </div>
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-zinc-500">
                  <Users className="h-3.5 w-3.5 text-zinc-400" />
                  <span>{job.proposalsCount} proposals submitted</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                {isClientOwner ? (
                  <Link
                    href={`/client/jobs/${job.id}/proposals`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-xs font-bold text-white shadow-xs hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition"
                  >
                    <Users className="h-4 w-4" />
                    <span>View Proposals ({job.proposalsCount})</span>
                  </Link>
                ) : session?.user ? (
                  <div className="space-y-2">
                    <Link
                      href={`/jobs/${job.id}/apply`}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-500 transition"
                    >
                      <Send className="h-4 w-4" />
                      <span>Submit Proposal</span>
                    </Link>
                    <SaveJobButton
                      jobId={job.id}
                      initialSaved={isSaved}
                      className="w-full justify-center"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href={`/login?redirect=/jobs/${job.id}`}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-xs font-bold text-white shadow-xs hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white transition"
                    >
                      <Lock className="h-4 w-4" />
                      <span>Sign In to Apply</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Flat $1 Fee Tagline Banner */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-50/70 p-3.5 text-xs text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200 flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <span className="font-bold">Transparent $1 Platform Fee:</span> No 10%–20% cuts or
                  hidden commission fees. You keep 100% of your earnings.
                </div>
              </div>
            </div>

            {/* About the Client Card */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                About the Client
              </h3>

              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-xs font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                  {clientInitials || <Building2 className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {companyName}
                  </div>
                  {isPaymentVerified && (
                    <div className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Payment Method Verified</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2.5 border-t border-zinc-100 pt-3 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Member Since</span>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    {clientMemberSince}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Location</span>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    Remote / Worldwide
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Escrow Security</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    100% Pre-funded
                  </span>
                </div>
              </div>
            </div>

            {/* Proposal Safety Tips Card */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <span>Tips for a Winning Proposal</span>
              </div>
              <ul className="space-y-2 text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span>Reference the specific tech stack and deliverables requested.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span>Propose realistic milestone breakdowns with acceptance criteria.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span>Keep all chat and milestones on WorkWasl to remain covered by escrow.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
