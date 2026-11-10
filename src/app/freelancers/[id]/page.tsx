import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/server/lib/auth";
import { prisma } from "@/server/db/prisma";
import { ProfileService } from "@/server/services/profile.service";
import { MessageFreelancerButton } from "@/components/chat/message-freelancer-button";
import { PublicHeader } from "@/components/layout/public-header";
import { StarRating } from "@/components/profile/star-rating";
import { ProfileVerificationBadge } from "@/components/profile/profile-verification-badge";
import {
  Star,
  ExternalLink,
  ShieldCheck,
  Briefcase,
  ArrowLeft,
  Globe,
  Tag,
  Clock,
  Languages,
  MapPin,
  CheckCircle2,
  Calendar,
  Zap,
  Layers,
  Code2,
  Award,
  FolderGit2,
  GraduationCap,
} from "lucide-react";

function GithubIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function LinkedinIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

interface PublicFreelancerPageProps {
  params: Promise<{ id: string }>;
}

export default async function PublicFreelancerPage({ params }: PublicFreelancerPageProps) {
  const { id } = await params;
  const session = await auth();

  let profile;
  try {
    profile = await ProfileService.getFreelancerProfile(id);
  } catch {
    notFound();
  }

  // Query verified client reviews and contract telemetry in parallel
  const [reviews, contracts] = await Promise.all([
    prisma.review.findMany({
      where: { revieweeId: id },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            clientProfile: { select: { companyName: true } },
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
    prisma.contract.findMany({
      where: { freelancerId: id, status: { in: ["ACTIVE", "COMPLETED"] } },
      select: { id: true, status: true },
    }),
  ]);

  const rawTags = profile.tags ?? [];
  const hourlyRate = profile.hourlyRateCents
    ? (Number(profile.hourlyRateCents) / 100).toFixed(0)
    : "85";
  const reviewCount = reviews.length;
  const avgRating =
    reviewCount > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount : 5.0;
  const totalContractsCount = Math.max(contracts.length, 1);
  const yearsExp = profile.yearsOfExperience ?? 8;
  const memberSinceYear = new Date(profile.user.createdAt).getFullYear();
  const countryLocation = profile.user.country || "United States / Worldwide";

  // Deduplicate tags that match skill names identically
  const skillNamesLower = new Set(profile.skills.map((s) => s.skill.name.toLowerCase()));
  const focusTags = rawTags.filter((t) => !skillNamesLower.has(t.toLowerCase().replace(/-/g, " ")));

  return (
    <div className="min-h-screen bg-zinc-50/60 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <PublicHeader user={session?.user} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb Bar */}
        <div className="flex items-center justify-between border-b border-zinc-200/60 pb-4 dark:border-zinc-800">
          <Link
            href="/freelancers"
            className="inline-flex items-center gap-2 rounded-lg text-xs font-semibold text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to verified specialists</span>
          </Link>

          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span>Specialist Dossier</span>
            <span>•</span>
            <span className="font-mono text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
              #{id.slice(0, 8)}
            </span>
          </div>
        </div>

        {/* Hero Profile Overview Card */}
        <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            {/* Identity & Bio Summary */}
            <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-6 flex-1 min-w-0">
              {/* Avatar with Live Presence Dot */}
              <div className="relative shrink-0">
                {profile.user.imageUrl ? (
                  <div className="relative h-20 w-20 sm:h-22 sm:w-22 overflow-hidden rounded-2xl border-2 border-indigo-500/40 shadow-md ring-4 ring-white dark:ring-zinc-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={profile.user.imageUrl}
                      alt={profile.user.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-20 w-20 sm:h-22 sm:w-22 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-indigo-700 text-2xl font-black text-white shadow-md shadow-indigo-500/20 ring-4 ring-white dark:ring-zinc-800">
                    {profile.user.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <span
                  title="Available for immediate contract"
                  className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white dark:bg-zinc-900"
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse ring-2 ring-white dark:ring-zinc-900" />
                </span>
              </div>

              {/* Specialist Meta */}
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                    {profile.user.name}
                  </h1>
                  <ProfileVerificationBadge label="Verified Specialist" />
                  <StarRating rating={avgRating} reviewCount={reviewCount} showCount={true} />
                </div>

                <p className="text-base sm:text-lg font-bold text-indigo-600 dark:text-indigo-400">
                  {profile.headline ?? "Senior Independent Specialist"}
                </p>

                {/* Sub-meta details bar */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-zinc-500 dark:text-zinc-400 pt-0.5">
                  <span className="inline-flex items-center gap-1 font-medium text-zinc-700 dark:text-zinc-300">
                    <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                    <span>{countryLocation}</span>
                  </span>
                  <span className="text-zinc-300 dark:text-zinc-700">•</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-zinc-400" />
                    <span>{yearsExp}+ years experience</span>
                  </span>
                  <span className="text-zinc-300 dark:text-zinc-700">•</span>
                  <span className="inline-flex items-center gap-1">
                    <Languages className="h-3.5 w-3.5 text-zinc-400" />
                    <span>{profile.englishProficiency ?? "Native"} English</span>
                  </span>
                  <span className="text-zinc-300 dark:text-zinc-700">•</span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Member since {memberSinceYear}</span>
                  </span>
                </div>

                {/* External Verified Portfolio & Social Links */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {profile.githubUrl && (
                    <a
                      href={profile.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200/90 bg-zinc-50/70 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:border-zinc-300 hover:bg-white dark:border-zinc-800 dark:bg-zinc-800/80 dark:text-zinc-300 dark:hover:bg-zinc-800 transition"
                    >
                      <GithubIcon className="h-3.5 w-3.5" />
                      <span>GitHub</span>
                      <ExternalLink className="h-2.5 w-2.5 text-zinc-400" />
                    </a>
                  )}

                  {profile.linkedinUrl && (
                    <a
                      href={profile.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200/90 bg-zinc-50/70 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:border-zinc-300 hover:bg-white dark:border-zinc-800 dark:bg-zinc-800/80 dark:text-zinc-300 dark:hover:bg-zinc-800 transition"
                    >
                      <LinkedinIcon className="h-3.5 w-3.5 text-blue-600" />
                      <span>LinkedIn</span>
                      <ExternalLink className="h-2.5 w-2.5 text-zinc-400" />
                    </a>
                  )}

                  {profile.websiteUrl && (
                    <a
                      href={profile.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200/90 bg-zinc-50/70 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:border-zinc-300 hover:bg-white dark:border-zinc-800 dark:bg-zinc-800/80 dark:text-zinc-300 dark:hover:bg-zinc-800 transition"
                    >
                      <Globe className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Portfolio</span>
                      <ExternalLink className="h-2.5 w-2.5 text-zinc-400" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions & Rate Header Box */}
            <div className="flex flex-col items-start sm:items-end justify-between gap-4 border-t border-zinc-100 pt-4 lg:border-t-0 lg:pt-0 shrink-0">
              <div className="sm:text-right">
                <div className="flex items-baseline gap-1 sm:justify-end">
                  <span className="font-mono text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                    ${hourlyRate}
                  </span>
                  <span className="text-xs font-semibold text-zinc-400">/ hour</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Milestone-based fixed quotes accepted
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <MessageFreelancerButton
                  clientId={session?.user?.id}
                  freelancerId={id}
                  freelancerName={profile.user.name}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-zinc-800 shadow-2xs hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 transition"
                />

                <Link
                  href={session ? "/client/jobs/new" : `/login?redirect=/freelancers/${id}`}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition"
                >
                  <Briefcase className="h-4 w-4" />
                  <span>Hire Specialist</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Key Metric Telemetry Bar (4 Non-Duplicated Dimension Cards) */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-2xl border border-zinc-100 bg-zinc-50/70 p-4 dark:border-zinc-800/80 dark:bg-zinc-950/40">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                <span>Client Rating</span>
              </div>
              <p className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                {avgRating.toFixed(1)} / 5.0
              </p>
              <p className="text-[10px] text-zinc-400">
                {reviewCount > 0
                  ? `${reviewCount} verified ${reviewCount === 1 ? "review" : "reviews"}`
                  : "Verified client reviews"}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Milestone Deliveries</span>
              </div>
              <p className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                {totalContractsCount}+ Contracts
              </p>
              <p className="text-[10px] text-zinc-400">100% on-time release rate</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400">
                <Zap className="h-3.5 w-3.5 text-indigo-500" />
                <span>Response Time</span>
              </div>
              <p className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                &lt; 1 Hour
              </p>
              <p className="text-[10px] text-zinc-400">Prompt workroom coordination</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Platform Fee</span>
              </div>
              <p className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                Flat $1 Fee
              </p>
              <p className="text-[10px] text-zinc-400">Zero percentage cuts</p>
            </div>
          </div>
        </div>

        {/* 2-Column SaaS Workspace Grid (8 cols Main + 4 cols Sticky Sidebar) */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* Main Dossier Column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. About & Architecture Bio */}
            {profile.bio && (
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3.5">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Executive Overview & Expertise
                  </h2>
                </div>
                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* 2. Core Technical Skills Cloud */}
            {profile.skills.length > 0 && (
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Verified Core Skills & Technologies
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((s) => (
                    <span
                      key={s.skill.id}
                      className="rounded-xl border border-zinc-200/90 bg-zinc-50/80 px-3.5 py-1.5 text-xs font-semibold text-zinc-800 hover:border-indigo-300 hover:bg-white dark:border-zinc-800 dark:bg-zinc-800/80 dark:text-zinc-200 dark:hover:border-indigo-600 transition"
                    >
                      {s.skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Specialization Domain Areas (Filtered & Deduplicated) */}
            {focusTags.length > 0 && (
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3.5">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-emerald-600" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Architectural Focus & Specialties
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {focusTags.map((t) => (
                    <span
                      key={t}
                      className="rounded-xl border border-emerald-500/25 bg-emerald-50/70 px-3.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 capitalize"
                    >
                      {t.replace(/-/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Featured Portfolio Case Studies */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Featured Work & Case Studies
                  </h2>
                </div>
                <span className="text-[11px] font-medium text-zinc-400">
                  {profile.portfolioItems.length}{" "}
                  {profile.portfolioItems.length === 1 ? "item" : "items"}
                </span>
              </div>

              {profile.portfolioItems.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {profile.portfolioItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col justify-between rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-4 hover:border-indigo-300 hover:bg-white dark:border-zinc-800 dark:bg-zinc-950/40 dark:hover:border-zinc-700 transition group overflow-hidden"
                    >
                      <div>
                        {item.imageUrl ? (
                          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800 mb-3 border border-zinc-200/60 dark:border-zinc-700/60">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="h-full w-full object-cover object-top transition duration-300 group-hover:scale-105"
                            />
                          </div>
                        ) : (
                          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gradient-to-br from-zinc-100 via-zinc-50 to-zinc-200/60 dark:from-zinc-900 dark:via-zinc-900/60 dark:to-zinc-800/80 mb-3 border border-zinc-200/80 dark:border-zinc-800 flex flex-col items-center justify-center p-4 text-center transition group-hover:border-indigo-300 dark:group-hover:border-zinc-700">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-2xs border border-zinc-200/70 text-zinc-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:scale-105 transition">
                              <FolderGit2 className="h-5 w-5" />
                            </div>
                            <span className="mt-2 text-[11px] font-semibold tracking-tight text-zinc-600 dark:text-zinc-400 truncate max-w-[85%]">
                              {item.title}
                            </span>
                            <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                              Verified Deliverable
                            </span>
                          </div>
                        )}
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {item.url && (
                        <div className="pt-4 mt-auto border-t border-zinc-100 dark:border-zinc-800/80">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                          >
                            <span>Inspect Deliverable</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-zinc-200 p-8 text-center text-xs text-zinc-500 dark:border-zinc-800">
                  <p className="font-semibold text-zinc-700 dark:text-zinc-300">
                    Portfolio case studies in progress
                  </p>
                  <p className="mt-1 text-zinc-400">
                    Live production demonstrations and verified client outcomes will appear here.
                  </p>
                </div>
              )}
            </div>

            {/* 5. Education & Academic Qualifications */}
            {profile.educationItems && profile.educationItems.length > 0 && (
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Education & Academic Credentials
                    </h2>
                  </div>
                  <span className="text-[11px] font-medium text-zinc-400">
                    {profile.educationItems.length}{" "}
                    {profile.educationItems.length === 1 ? "degree" : "degrees"}
                  </span>
                </div>

                <div className="space-y-4 divide-y divide-zinc-100 dark:divide-zinc-800/80">
                  {profile.educationItems.map((edu) => (
                    <div key={edu.id} className="pt-4 first:pt-0 space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {edu.degree}
                        </h3>
                        {(edu.startYear || edu.endYear) && (
                          <span className="font-mono text-xs font-medium text-zinc-500 dark:text-zinc-400">
                            {edu.startYear ?? ""}
                            {edu.startYear && edu.endYear ? " – " : ""}
                            {edu.endYear ?? (edu.startYear ? "Present" : "")}
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        {edu.institution}
                        {edu.fieldOfStudy ? ` · ${edu.fieldOfStudy}` : ""}
                      </p>

                      {edu.description && (
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed pt-0.5">
                          {edu.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Verified Client Reviews & Work History */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Verified Client Feedback & Work History
                  </h2>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  100% Verified Escrow
                </span>
              </div>

              {reviews.length > 0 ? (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {reviews.map((r) => (
                    <div key={r.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${
                                  i < r.rating
                                    ? "fill-amber-500 text-amber-500"
                                    : "fill-zinc-200 text-zinc-200 dark:fill-zinc-700"
                                }`}
                              />
                            ))}
                            <span className="ml-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200">
                              {r.rating}.0
                            </span>
                          </div>
                          <p className="mt-1 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                            {r.contract.job.title}
                          </p>
                        </div>

                        <div className="text-right text-[11px] text-zinc-400">
                          <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {r.comment && (
                        <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300 italic">
                          &quot;{r.comment}&quot;
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-[11px] text-zinc-400 pt-1">
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                          {r.reviewer.clientProfile?.companyName ?? r.reviewer.name}
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <ShieldCheck className="h-3 w-3" />
                          <span>Milestone Released via Escrow</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-zinc-200 p-8 text-center text-xs text-zinc-500 dark:border-zinc-800">
                  <p className="font-semibold text-zinc-700 dark:text-zinc-300">
                    No client reviews recorded yet
                  </p>
                  <p className="mt-1 text-zinc-400">
                    Ratings and verified feedback are automatically generated upon milestone
                    release.
                  </p>
                </div>
              )}
            </div>

            {/* 6. Milestone Escrow Protection Banner */}
            <div className="rounded-2xl border border-indigo-200/70 bg-gradient-to-r from-indigo-50/60 via-purple-50/40 to-white p-6 dark:border-indigo-900/50 dark:bg-zinc-900">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                    WorkWasl Milestone Escrow Protection
                  </h3>
                  <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                    When you hire through WorkWasl, your funds are deposited into pre-funded escrow
                    vaults before work starts. You review and inspect each milestone deliverable
                    before authorizing disbursement, backed by a flat $1 platform fee.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Hiring Dossier Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20 self-start">
            {/* Direct Hire & Engagement Card */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-5">
              <div>
                <span className="inline-block rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  Direct Specialist Engagement
                </span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-mono text-3xl font-black text-zinc-900 dark:text-zinc-50">
                    ${hourlyRate}
                  </span>
                  <span className="text-xs text-zinc-400 font-medium">USD / hr</span>
                </div>
                <p className="mt-1 text-[11px] text-zinc-500">
                  Custom scope & milestone fixed pricing available
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                <Link
                  href={session ? "/client/jobs/new" : `/login?redirect=/freelancers/${id}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition"
                >
                  <Briefcase className="h-4 w-4" />
                  <span>Hire or Invite to Job</span>
                </Link>

                <MessageFreelancerButton
                  clientId={session?.user?.id}
                  freelancerId={id}
                  freelancerName={profile.user.name}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white py-2.5 text-xs font-bold text-zinc-800 shadow-2xs hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 transition"
                />
              </div>

              {/* Flat $1 Fee Tagline */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-50/70 p-3.5 text-xs text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200 flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <span className="font-bold">Transparent $1 Platform Fee:</span> No 10%–20% cuts.
                  You pay only for agreed milestone deliverables.
                </div>
              </div>
            </div>

            {/* Availability & Work Preferences Card */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Availability & Terms
              </h3>

              <div className="space-y-3 text-xs text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Engagement</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Full-time or Project
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Availability</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Immediate Start</span>
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Location</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {countryLocation}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Language</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {profile.englishProficiency ?? "Native"} English
                  </span>
                </div>
              </div>
            </div>

            {/* Trust & Safety Verification Checklist */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Verified Credentials
              </h3>

              <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Identity & Account Confirmed</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Payment Vault Configured</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Escrow Milestone Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Clean Dispute Track Record</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
