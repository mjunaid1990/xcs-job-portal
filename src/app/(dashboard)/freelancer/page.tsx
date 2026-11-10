import { auth } from "@/server/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/server/db/prisma";
import { getJobUrl } from "@/lib/format";
import {
  Search,
  Briefcase,
  Clock,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  FileText,
} from "lucide-react";

export default async function FreelancerDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const roles = session.user.roles ?? [];
  if (!roles.includes("FREELANCER") && !roles.includes("ADMIN")) {
    redirect("/client");
  }

  // Fetch proposals, profile, active contracts, and recommendations in parallel
  const [proposalCount, profile, activeContracts, recentProposals, recommendedJobs] =
    await Promise.all([
      prisma.proposal.count({ where: { freelancerId: session.user.id } }),
      prisma.freelancerProfile.findUnique({
        where: { userId: session.user.id },
        include: { skills: { include: { skill: true } } },
      }),
      prisma.contract.findMany({
        where: { freelancerId: session.user.id, status: "ACTIVE" },
        include: {
          job: true,
          client: {
            select: {
              name: true,
              clientProfile: { select: { companyName: true } },
            },
          },
          milestones: true,
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.proposal.findMany({
        where: { freelancerId: session.user.id },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          job: { select: { id: true, title: true, budgetMaxCents: true, budgetType: true } },
        },
      }),
      prisma.job.findMany({
        where: { status: "OPEN" },
        take: 4,
        orderBy: { createdAt: "desc" },
        include: {
          category: true,
          skills: { include: { skill: true } },
          client: {
            select: {
              name: true,
              clientProfile: { select: { companyName: true } },
            },
          },
        },
      }),
    ]);

  const firstName = session.user.name?.split(" ")[0] ?? "Freelancer";
  const hourlyRate = profile?.hourlyRateCents
    ? `$${(profile.hourlyRateCents / 100).toFixed(0)}/hr`
    : "$85/hr";

  let completenessScore = 30; // base account
  if (profile?.headline) completenessScore += 25;
  if (profile?.bio) completenessScore += 20;
  if (profile?.hourlyRateCents) completenessScore += 15;
  if (profile?.skills && profile.skills.length > 0) completenessScore += 10;
  completenessScore = Math.min(100, completenessScore);

  return (
    <div className="space-y-8">
      {/* Human, Natural Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {activeContracts.length > 0
              ? `You have ${activeContracts.length} active project${activeContracts.length > 1 ? "s" : ""} and ${recentProposals.length} proposal${recentProposals.length === 1 ? "" : "s"} under review.`
              : "Track your active proposals, manage deliverables, and discover open client briefs."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition"
          >
            <Search className="h-4 w-4" />
            <span>Find Work</span>
          </Link>
        </div>
      </div>

      {/* Clean KPI Summary Strip (Human, Minimal, High-Contrast) */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Active Projects
          </span>
          <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {activeContracts.length}
          </div>
          <p className="mt-1 text-[11px] text-zinc-400">Contracts in flight</p>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Proposals Sent
          </span>
          <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {proposalCount}
          </div>
          <p className="mt-1 text-[11px] text-zinc-400">Submitted pitches</p>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Baseline Rate
          </span>
          <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {hourlyRate}
          </div>
          <p className="mt-1 text-[11px] text-zinc-400">Profile rate in USD</p>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Available Funds
          </span>
          <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">$0.00</div>
          <p className="mt-1 text-[11px] text-zinc-400">Ready for payout</p>
        </div>
      </div>

      {/* Main 2-Column Responsive Body */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column (2 spans): Active Work & In-Flight Proposals */}
        <div className="space-y-6 lg:col-span-2">
          {/* Active Milestone Contracts */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Active Engagements ({activeContracts.length})
                </h2>
              </div>
              {activeContracts.length > 0 && (
                <Link
                  href="/freelancer/contracts"
                  className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 flex items-center gap-1"
                >
                  <span>View all</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>

            {activeContracts.length > 0 ? (
              <div className="space-y-3">
                {activeContracts.map((contract) => {
                  const completedM = contract.milestones.filter(
                    (m) => m.status === "RELEASED",
                  ).length;
                  const totalM = contract.milestones.length;
                  const progress = totalM > 0 ? Math.round((completedM / totalM) * 100) : 0;
                  const clientName =
                    contract.client.clientProfile?.companyName ?? contract.client.name;

                  return (
                    <div
                      key={contract.id}
                      className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800/80 dark:bg-zinc-950/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                            {contract.job.title}
                          </h3>
                          <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                            Active
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500">
                          Client:{" "}
                          <span className="font-medium text-zinc-700 dark:text-zinc-300">
                            {clientName}
                          </span>{" "}
                          · ${(Number(contract.totalCents) / 100).toFixed(0)} Escrow
                        </p>
                        <div className="flex items-center gap-3 pt-1">
                          <div className="h-1.5 w-28 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-medium text-zinc-500">
                            {completedM}/{totalM} milestones ({progress}%)
                          </span>
                        </div>
                      </div>

                      <Link
                        href={`/contracts/${contract.id}`}
                        className="inline-flex items-center justify-center gap-1.5 self-start sm:self-auto rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-800 shadow-2xs hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 transition shrink-0"
                      >
                        <span>Open Workroom</span>
                        <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-200 p-8 text-center text-xs text-zinc-500 dark:border-zinc-800">
                <Clock className="mx-auto h-7 w-7 text-zinc-400 mb-2" />
                <p className="font-semibold text-zinc-700 dark:text-zinc-300">
                  No active contracts right now
                </p>
                <p className="mt-1 text-zinc-400">
                  When a client accepts your proposal and funds a milestone, workrooms will appear
                  here.
                </p>
                <Link
                  href="/jobs"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-900 underline dark:text-zinc-100"
                >
                  <span>Explore open briefs</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}
          </div>

          {/* Recent Proposals Tracker */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Recent Proposals ({recentProposals.length})
                </h2>
              </div>
              {recentProposals.length > 0 && (
                <Link
                  href="/freelancer/proposals"
                  className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 flex items-center gap-1"
                >
                  <span>View all</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>

            {recentProposals.length > 0 ? (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {recentProposals.map((proposal) => (
                  <div
                    key={proposal.id}
                    className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1 min-w-0">
                      <Link
                        href={getJobUrl(proposal.job)}
                        className="text-xs font-bold text-zinc-900 hover:underline dark:text-zinc-100 truncate block"
                      >
                        {proposal.job.title}
                      </Link>
                      <div className="flex items-center gap-2.5 text-[11px] text-zinc-500">
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                          ${(proposal.bidCents / 100).toFixed(0)} Bid
                        </span>
                        <span>·</span>
                        <span>
                          {proposal.estimatedDays ? `${proposal.estimatedDays} days` : "Flexible"}
                        </span>
                        <span>·</span>
                        <span>{new Date(proposal.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <span
                      className={`rounded-md px-2.5 py-1 text-[11px] font-semibold shrink-0 ${
                        proposal.status === "ACCEPTED"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : proposal.status === "SHORTLISTED"
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                            : proposal.status === "REJECTED"
                              ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                              : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                      }`}
                    >
                      {proposal.status === "SUBMITTED" ? "In Review" : proposal.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 py-2">
                You haven&apos;t pitched for any projects yet.
              </p>
            )}
          </div>

          {/* Recommended Opportunities */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Opportunities Matching Your Profile
              </h2>
              <Link
                href="/jobs"
                className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Browse all &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {recommendedJobs.map((job) => {
                const budget = job.budgetMaxCents
                  ? `$${(job.budgetMaxCents / 100).toLocaleString()}`
                  : "Competitive";
                const clientName = job.client.clientProfile?.companyName ?? job.client.name;

                return (
                  <div
                    key={job.id}
                    className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800/80 dark:bg-zinc-950/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:border-zinc-200 dark:hover:border-zinc-700 transition"
                  >
                    <div className="space-y-1 min-w-0">
                      <Link
                        href={getJobUrl(job)}
                        className="font-bold text-xs text-zinc-900 hover:underline dark:text-zinc-100 truncate block"
                      >
                        {job.title}
                      </Link>
                      <div className="flex items-center gap-2.5 text-[11px] text-zinc-500">
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                          {budget} {job.budgetType === "HOURLY" ? "/hr" : "Fixed"}
                        </span>
                        <span>·</span>
                        <span>{clientName}</span>
                      </div>
                    </div>

                    <Link
                      href={`${getJobUrl(job)}/apply`}
                      className="inline-flex items-center justify-center gap-1 self-start sm:self-auto rounded-xl bg-zinc-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition shrink-0"
                    >
                      <span>Submit Proposal</span>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Sidebar (1 span): Profile Standing & Payouts */}
        <div className="space-y-6">
          {/* Profile Standing */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Profile Completeness
              </span>
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                {completenessScore}%
              </span>
            </div>

            <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full transition-all"
                style={{ width: `${completenessScore}%` }}
              />
            </div>

            <div className="space-y-2 text-xs text-zinc-500 pt-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Account & Email Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Rate & Availability Configured</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Technical Skills Listed</span>
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-2">
              <Link
                href="/freelancer/profile"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white py-2 text-xs font-semibold text-zinc-800 shadow-2xs hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 transition"
              >
                <span>Edit Profile Settings</span>
              </Link>
              <Link
                href={`/freelancers/${session.user.id}`}
                target="_blank"
                className="inline-flex w-full items-center justify-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 py-1 transition"
              >
                <span>View Public Profile</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Earnings & Payouts Card */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Earnings & Escrow
              </span>
              <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                Stripe Connect
              </span>
            </div>

            <div>
              <div className="text-xs text-zinc-500">Available to Withdraw</div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                $0.00 <span className="text-xs font-normal text-zinc-400">USD</span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Escrow funds release automatically to your balance once the client approves your
              submitted milestone.
            </p>

            <Link
              href="/freelancer/payouts"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white py-2 text-xs font-semibold text-zinc-800 shadow-2xs hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 transition"
            >
              <span>Payout Settings</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
