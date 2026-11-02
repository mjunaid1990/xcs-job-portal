import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/server/lib/auth";
import { prisma } from "@/server/db/prisma";
import { ProfileService } from "@/server/services/profile.service";
import { PublicHeader } from "@/components/layout/public-header";
import { MessageFreelancerButton } from "@/components/chat/message-freelancer-button";
import { getJobUrl } from "@/lib/format";
import {
  Building2,
  Globe,
  ShieldCheck,
  ArrowLeft,
  Briefcase,
  Users,
  Star,
  ExternalLink,
  ChevronRight,
  Layers,
  CheckCircle2,
  FileText,
} from "lucide-react";

function LinkedinIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

interface PublicClientPageProps {
  params: Promise<{ id: string }>;
}

export default async function PublicClientPage({ params }: PublicClientPageProps) {
  const { id } = await params;
  const session = await auth();

  let profile;
  try {
    profile = await ProfileService.getClientProfile(id);
  } catch {
    notFound();
  }

  // Fetch open jobs, completed contracts, and verified reviews in parallel
  const [openJobs, reviews, contractsCount] = await Promise.all([
    prisma.job.findMany({
      where: { clientId: id, status: "OPEN" },
      include: {
        category: { select: { name: true } },
        skills: { include: { skill: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.review.findMany({
      where: { revieweeId: id },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            freelancerProfile: { select: { headline: true } },
          },
        },
        contract: {
          select: {
            id: true,
            job: { select: { title: true } },
            totalCents: true,
            currency: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.contract.count({
      where: { clientId: id, status: { in: ["ACTIVE", "COMPLETED"] } },
    }),
  ]);

  const isOwnProfile = session?.user?.id === id;
  const companyName = profile.companyName ?? `${profile.user.name}'s Organization`;
  const companyLogo = profile.user.imageUrl;
  const memberSinceYear = new Date(profile.user.createdAt).getFullYear();
  const totalSpentDollars = profile.totalSpentCents
    ? (Number(profile.totalSpentCents) / 100).toLocaleString()
    : "0";

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <PublicHeader user={session?.user} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Opportunities</span>
          </Link>
          {isOwnProfile && (
            <Link
              href="/client/profile"
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-800 shadow-2xs hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 transition"
            >
              <span>Edit Organization Profile</span>
            </Link>
          )}
        </div>

        {/* Hero Card */}
        <div className="relative overflow-hidden rounded-3xl border border-zinc-200/90 bg-white p-6 sm:p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-5">
              {/* Company Logo or Stylized Monogram */}
              {companyLogo ? (
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-zinc-200/80 bg-white p-2 shadow-xs dark:border-zinc-700 dark:bg-zinc-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={companyLogo}
                    alt={companyName}
                    className="h-full w-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-2xl font-black text-white shadow-md shadow-blue-500/20">
                  <Building2 className="h-9 w-9 text-white" />
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
                    {companyName}
                  </h1>
                  {profile.paymentVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-500/20">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Verified Employer</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Primary Contact:{" "}
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                    {profile.user.name}
                  </span>{" "}
                  · Member since {memberSinceYear}
                </p>

                {/* Company Link Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {profile.industry && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      <Briefcase className="h-3 w-3 text-zinc-400" />
                      <span>{profile.industry}</span>
                    </span>
                  )}
                  {profile.companySize && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      <Users className="h-3 w-3 text-zinc-400" />
                      <span>{profile.companySize}</span>
                    </span>
                  )}
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-medium text-indigo-600 hover:border-indigo-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-indigo-400 transition"
                    >
                      <Globe className="h-3 w-3" />
                      <span>{profile.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}</span>
                      <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                    </a>
                  )}
                  {profile.linkedinUrl && (
                    <a
                      href={profile.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-medium text-blue-600 hover:border-blue-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-blue-400 transition"
                    >
                      <LinkedinIcon className="h-3 w-3" />
                      <span>LinkedIn</span>
                      <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Direct Message Action */}
            {!isOwnProfile && session?.user && (
              <div className="shrink-0 w-full sm:w-auto">
                <MessageFreelancerButton
                  clientId={session.user.id}
                  freelancerId={id}
                  freelancerName={companyName}
                />
              </div>
            )}
          </div>

          {/* Quick Telemetry Strip */}
          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-zinc-100 pt-6 dark:border-zinc-800/80 sm:grid-cols-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Total Escrow Spent
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50">
                  ${totalSpentDollars}
                </span>
                <span className="text-xs font-semibold text-zinc-400">USD</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Contracts Awarded
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50">
                  {contractsCount}
                </span>
                <span className="text-xs font-semibold text-zinc-400">engagements</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Active Job Openings
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  {openJobs.length}
                </span>
                <span className="text-xs font-semibold text-zinc-400">openings</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Payment Standing
              </span>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>{profile.paymentVerified ? "Verified Escrow" : "Standard"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Responsive Body */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Column (2 spans) */}
          <div className="space-y-8 lg:col-span-2">
            {/* About Company & Mission */}
            <div className="rounded-3xl border border-zinc-200/90 bg-white p-6 sm:p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  About {companyName}
                </h2>
              </div>

              {profile.about ? (
                <div className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 font-sans whitespace-pre-wrap">
                  {profile.about}
                </div>
              ) : (
                <p className="text-sm text-zinc-500 italic">
                  No public description has been published by this organization yet.
                </p>
              )}
            </div>

            {/* Active Job Openings */}
            <div className="rounded-3xl border border-zinc-200/90 bg-white p-6 sm:p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Active Job Openings ({openJobs.length})
                  </h2>
                </div>
                <Link
                  href="/jobs"
                  className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  Browse all marketplace &rarr;
                </Link>
              </div>

              {openJobs.length > 0 ? (
                <div className="space-y-4">
                  {openJobs.map((job) => {
                    const budgetFormatted =
                      job.budgetType === "HOURLY"
                        ? `$${job.budgetMinCents ? (job.budgetMinCents / 100).toFixed(0) : "35"} - $${job.budgetMaxCents ? (job.budgetMaxCents / 100).toFixed(0) : "75"}/hr`
                        : `$${job.budgetMaxCents ? (job.budgetMaxCents / 100).toLocaleString() : "2,500"} Fixed`;

                    return (
                      <div
                        key={job.id}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-4 sm:p-5 hover:border-indigo-300 hover:bg-white dark:border-zinc-800 dark:bg-zinc-950/40 dark:hover:border-zinc-700 transition"
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            {job.category && (
                              <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                                {job.category.name}
                              </span>
                            )}
                            <span className="text-[11px] font-semibold text-zinc-500">
                              {budgetFormatted}
                            </span>
                            {job.experienceLevel && (
                              <span className="text-[11px] text-zinc-400">
                                · {job.experienceLevel}
                              </span>
                            )}
                          </div>

                          <Link
                            href={getJobUrl(job)}
                            className="block text-sm font-bold text-zinc-900 group-hover:text-indigo-600 dark:text-zinc-100 dark:group-hover:text-indigo-400 transition"
                          >
                            {job.title}
                          </Link>

                          {job.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {job.skills.slice(0, 4).map((s) => (
                                <span
                                  key={s.skill.id}
                                  className="rounded-md bg-white px-2 py-0.5 text-[10px] font-medium text-zinc-600 border border-zinc-200/60 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800"
                                >
                                  {s.skill.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <Link
                          href={`${getJobUrl(job)}/apply`}
                          className="inline-flex items-center justify-center gap-1.5 self-start sm:self-auto rounded-xl bg-zinc-900 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-600 dark:bg-white dark:text-zinc-900 dark:hover:bg-indigo-500 dark:hover:text-white transition shrink-0 shadow-xs"
                        >
                          <span>Apply</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-zinc-200 p-8 text-center text-xs text-zinc-500 dark:border-zinc-800">
                  <FileText className="h-8 w-8 text-zinc-300 mx-auto mb-2 dark:text-zinc-700" />
                  <p className="font-semibold text-zinc-700 dark:text-zinc-300">
                    No active job postings at this time
                  </p>
                  <p className="mt-1 text-zinc-400">
                    Check back regularly or connect with this organization directly for upcoming
                    projects.
                  </p>
                </div>
              )}
            </div>

            {/* Verified Contractor Reviews */}
            {reviews.length > 0 && (
              <div className="rounded-3xl border border-zinc-200/90 bg-white p-6 sm:p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-5">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Verified Freelancer Feedback ({reviews.length})
                  </h2>
                </div>

                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="rounded-2xl border border-zinc-100 bg-zinc-50/60 p-4 sm:p-5 dark:border-zinc-800/80 dark:bg-zinc-950/40 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                              {rev.reviewer.name}
                            </span>
                            {rev.reviewer.freelancerProfile?.headline && (
                              <span className="text-[11px] text-zinc-400">
                                · {rev.reviewer.freelancerProfile.headline}
                              </span>
                            )}
                          </div>
                          {rev.contract?.job?.title && (
                            <p className="text-[11px] font-medium text-zinc-500">
                              Contract: {rev.contract.job.title}
                            </p>
                          )}
                        </div>

                        {/* Star Rating */}
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < rev.rating
                                  ? "fill-amber-500 text-amber-500"
                                  : "text-zinc-300 dark:text-zinc-700"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {rev.comment && (
                        <p className="text-xs leading-relaxed text-zinc-700 dark:text-zinc-300 italic">
                          &ldquo;{rev.comment}&rdquo;
                        </p>
                      )}

                      <div className="text-[10px] text-zinc-400 pt-1">
                        Reviewed on {new Date(rev.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Column (1 span) */}
          <div className="space-y-6">
            {/* Escrow Trust & Verification Box */}
            <div className="rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Client Verification</span>
              </div>

              <div className="space-y-3 divide-y divide-zinc-100 dark:divide-zinc-800/80 text-xs">
                <div className="flex items-center justify-between pt-1">
                  <span className="text-zinc-500">Payment Method</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Verified</span>
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <span className="text-zinc-500">Identity & Business</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">Confirmed</span>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <span className="text-zinc-500">Escrow Model</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    Milestone-Funded
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <span className="text-zinc-500">Platform Contractor Fee</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    $1 Flat Fee
                  </span>
                </div>
              </div>
            </div>

            {/* Organization Metadata Card */}
            <div className="rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
                <Layers className="h-4 w-4 text-indigo-500" />
                <span>Company Footprint</span>
              </div>

              <div className="space-y-3 text-xs">
                {profile.industry && (
                  <div>
                    <span className="text-[11px] text-zinc-400 uppercase font-semibold">
                      Industry
                    </span>
                    <p className="mt-0.5 font-semibold text-zinc-800 dark:text-zinc-200">
                      {profile.industry}
                    </p>
                  </div>
                )}

                {profile.companySize && (
                  <div>
                    <span className="text-[11px] text-zinc-400 uppercase font-semibold">
                      Company Size
                    </span>
                    <p className="mt-0.5 font-semibold text-zinc-800 dark:text-zinc-200">
                      {profile.companySize}
                    </p>
                  </div>
                )}

                <div>
                  <span className="text-[11px] text-zinc-400 uppercase font-semibold">
                    Primary Contact
                  </span>
                  <p className="mt-0.5 font-semibold text-zinc-800 dark:text-zinc-200">
                    {profile.user.name}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] text-zinc-400 uppercase font-semibold">
                    Account Established
                  </span>
                  <p className="mt-0.5 font-semibold text-zinc-800 dark:text-zinc-200">
                    {memberSinceYear}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
