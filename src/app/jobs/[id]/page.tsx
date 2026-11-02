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
  Coins,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Info,
  Shield,
  Check,
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
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <PublicHeader user={session?.user} />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-zinc-200/60 pb-4 dark:border-zinc-800">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to all opportunities</span>
          </Link>

          <ReportJobModal jobId={job.id} />
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Main Content Column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Main Job Overview Card */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
              {/* Header Badges & Meta */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                    {job.category?.name ?? "General Opportunity"}
                  </span>
                  <span className="text-zinc-400">•</span>
                  <span className="text-zinc-500">Posted {postedAgo}</span>
                  <JobFitBadge jobSkills={job.skills.map((s) => s.skill.name)} compact />
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {job.title}
                </h1>

                {/* Client Trust Tagline */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400 pt-1">
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <Building2 className="h-4 w-4 text-zinc-400" />
                    <span>{companyName}</span>
                  </span>
                  {isPaymentVerified && (
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Payment Verified</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Specifications Matrix */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-xl border border-zinc-100 bg-zinc-50/60 p-4 dark:border-zinc-800/80 dark:bg-zinc-950/40">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                    <Coins className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Project Type</span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {job.budgetType === "HOURLY" ? "Hourly Contract" : "Fixed-Price Escrow"}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                    <Briefcase className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Experience Level</span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 capitalize">
                    {job.experienceLevel?.toLowerCase() ?? "Intermediate"}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                    <Layers className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Project Scope</span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {job.scope ? `${job.scope} Scope` : "Medium Scope"}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                    <Clock className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Est. Duration</span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {job.duration ?? "1 to 3 months"}
                  </p>
                </div>
              </div>

              {/* Detailed Scope of Work */}
              <div className="space-y-3 pt-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Detailed Scope of Work
                </h2>
                <div className="whitespace-pre-wrap break-words text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {job.description}
                </div>
              </div>

              {/* Structured Deliverables */}
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

              {/* Screening Questions */}
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

              {/* Skills Section */}
              {job.skills.length > 0 && (
                <div className="space-y-3 border-t border-zinc-100 pt-6 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Required Technical Skills
                    </h2>
                    <JobFitBadge jobSkills={job.skills.map((s) => s.skill.name)} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((s) => (
                      <span
                        key={s.skill.id}
                        className="rounded-xl border border-zinc-200/90 bg-zinc-50/70 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:border-indigo-300 hover:bg-white dark:border-zinc-800 dark:bg-zinc-800/80 dark:text-zinc-300 dark:hover:border-indigo-600 transition"
                      >
                        {s.skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Escrow & Security Trust Card */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                  <Shield className="h-4 w-4" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  WorkWasl Milestone Escrow Protection
                </h3>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Work with confidence. Client funds are fully deposited into platform escrow before
                any milestone begins. Freelancers keep 100% of their earnings with our transparent,
                flat $1 platform fee.
              </p>
              <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-3 text-[11px] text-zinc-500">
                <div className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Funds pre-locked in escrow</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Flat $1 fee per milestone</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Fair dispute mediation</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20 self-start">
            {/* Compensation & Action Card */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-5">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  {job.budgetType === "HOURLY" ? "Hourly Rate" : "Fixed-Price Escrow"}
                </div>
                <div className="mt-1 font-mono text-3xl font-black text-zinc-900 dark:text-zinc-50">
                  {formatBudget()}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
                  <Users className="h-3.5 w-3.5 text-zinc-400" />
                  <span>{job.proposalsCount} proposals submitted</span>
                </div>
              </div>

              {/* Actions */}
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
                  <Link
                    href={`/jobs/${job.id}/apply`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-500 transition"
                  >
                    <Send className="h-4 w-4" />
                    <span>Submit Proposal</span>
                  </Link>
                ) : (
                  <Link
                    href={`/login?redirect=/jobs/${job.id}`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-xs font-bold text-white shadow-xs hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white transition"
                  >
                    <Lock className="h-4 w-4" />
                    <span>Sign In to Apply</span>
                  </Link>
                )}

                {session?.user?.id && !isClientOwner && (
                  <div className="flex justify-center w-full">
                    <SaveJobButton jobId={job.id} initialSaved={isSaved} />
                  </div>
                )}
              </div>

              {/* Flat $1 Fee Tagline */}
              <div className="rounded-xl bg-emerald-50/70 p-3 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <span className="font-bold">Transparent $1 Platform Fee:</span> No
                  percentage-based cuts or hidden deductions. Keep what you earn.
                </div>
              </div>
            </div>

            {/* About the Client Card */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                About the Client
              </h3>

              <div className="space-y-3">
                <div>
                  <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {companyName}
                  </div>
                  {isPaymentVerified && (
                    <div className="mt-0.5 flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Payment Method Verified</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 border-t border-zinc-100 pt-3 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400">
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
            </div>

            {/* Proposal Safety Tip */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                <Info className="h-4 w-4 text-indigo-500" />
                <span>Tips for Submitting Proposals</span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Break your proposal down into clear milestones with defined deliverables. Keep all
                communications and milestones on WorkWasl to remain fully covered by escrow.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
