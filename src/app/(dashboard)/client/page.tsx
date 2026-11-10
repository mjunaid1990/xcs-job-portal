import { auth } from "@/server/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/server/db/prisma";
import { getJobUrl } from "@/lib/format";
import { NotificationService } from "@/server/services/notification.service";
import { formatNotification } from "@/lib/notification-format";
import {
  DashboardAlertBanner,
  type DashboardAlertItem,
} from "@/components/layout/dashboard-alert-banner";
import {
  Briefcase,
  Plus,
  FileText,
  Clock,
  ArrowRight,
  Users,
  ChevronRight,
  ShieldCheck,
  Building2,
} from "lucide-react";

export default async function ClientDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const roles = session.user.roles ?? [];
  if (!roles.includes("CLIENT") && !roles.includes("ADMIN")) {
    redirect("/freelancer");
  }

  // Fetch client counts, recent listings, and active contracts
  const [jobCount, contractCount, activeJobs, activeContracts] = await Promise.all([
    prisma.job.count({ where: { clientId: session.user.id, deletedAt: null } }),
    prisma.contract.count({ where: { clientId: session.user.id } }),
    prisma.job.findMany({
      where: { clientId: session.user.id, deletedAt: null },
      include: {
        _count: { select: { proposals: true } },
        skills: { include: { skill: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.contract.findMany({
      where: { clientId: session.user.id, status: "ACTIVE" },
      include: {
        freelancer: true,
        job: true,
        milestones: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 4,
    }),
  ]);

  // Compute total funds actively locked in escrow
  let escrowLockedCents = 0;
  activeContracts.forEach((c) => {
    c.milestones.forEach((m) => {
      if (m.status === "FUNDED" || m.status === "SUBMITTED" || m.status === "REVISION_REQUESTED") {
        escrowLockedCents += Number(m.amountCents);
      }
    });
  });

  const totalProposalsToReview = activeJobs.reduce((acc, j) => acc + j._count.proposals, 0);
  const firstName = session.user.name?.split(" ")[0] ?? "Client";

  // Fetch unread in-app notifications
  const recentNotifs = await NotificationService.getUserNotifications(session.user.id, 5);
  const unreadOnly = recentNotifs.filter((n) => !n.readAt);

  // Compute pending milestone deliverables awaiting client signoff
  const submittedMilestones: Array<{
    id: string;
    title: string;
    contractId: string;
    contractTitle: string;
    freelancerName: string;
  }> = [];

  activeContracts.forEach((c) => {
    c.milestones.forEach((m) => {
      if (m.status === "SUBMITTED") {
        submittedMilestones.push({
          id: m.id,
          title: m.title,
          contractId: c.id,
          contractTitle: c.job.title,
          freelancerName: c.freelancer.name,
        });
      }
    });
  });

  const alerts: DashboardAlertItem[] = [];

  // 1. Deliverables ready for review (High Priority Action)
  if (submittedMilestones.length > 0) {
    const firstM = submittedMilestones[0];
    alerts.push({
      id: `deliverable-${firstM.id}`,
      type: "action",
      badge: "Action Required",
      title: `Deliverable Ready for Review: ${firstM.title}`,
      message: `${firstM.freelancerName} has submitted project deliverables for "${firstM.contractTitle}". Review work to release milestone escrow.`,
      actionLabel: "Review & Release",
      actionHref: `/contracts/${firstM.contractId}`,
    });
  }

  // 2. Proposals awaiting review
  const jobWithProposals = activeJobs.find((j) => j._count.proposals > 0);
  if (jobWithProposals) {
    alerts.push({
      id: `proposals-${jobWithProposals.id}`,
      type: "info",
      badge: "Proposals",
      title: `${jobWithProposals._count.proposals} New Proposal${jobWithProposals._count.proposals === 1 ? "" : "s"} on "${jobWithProposals.title}"`,
      message: "Qualified specialists have submitted project bids. Review proposals, compare rates, and start conversations.",
      actionLabel: "Review Proposals",
      actionHref: `/client/jobs/${jobWithProposals.id}/proposals`,
    });
  }

  // 3. Unread in-app alerts
  unreadOnly.forEach((n) => {
    const formatted = formatNotification(n.type, n.payload, "CLIENT");
    if (!alerts.some((a) => a.title === formatted.title)) {
      alerts.push({
        id: `notif-${n.id}`,
        type: formatted.category === "payment" ? "action" : "info",
        badge: "Notification",
        title: formatted.title,
        message: formatted.message,
        actionLabel: "View Details",
        actionHref: formatted.href ?? "/client",
      });
    }
  });

  return (
    <div className="space-y-8">
      {/* Natural Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {activeJobs.length > 0 || activeContracts.length > 0
              ? `You have ${activeJobs.length} active job post${activeJobs.length === 1 ? "" : "s"} and ${activeContracts.length} contract${activeContracts.length === 1 ? "" : "s"} in progress.`
              : "Manage your project listings, review specialist proposals, and fund project milestones."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/client/jobs/new"
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Post a Job</span>
          </Link>
        </div>
      </div>

      {/* Actionable Client Alert Notifications */}
      {alerts.length > 0 && <DashboardAlertBanner role="CLIENT" alerts={alerts} />}

      {/* Clean KPI Metrics Strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Active Jobs</span>
          <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">{jobCount}</div>
          <p className="mt-1 text-xs text-zinc-400">Open listings</p>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Proposals to Review
          </span>
          <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {totalProposalsToReview}
          </div>
          <p className="mt-1 text-xs text-zinc-400">Candidate pitches</p>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Active Contracts
          </span>
          <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {contractCount}
          </div>
          <p className="mt-1 text-xs text-zinc-400">Ongoing engagements</p>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Funded in Escrow
          </span>
          <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            $
            {(escrowLockedCents / 100).toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </div>
          <p className="mt-1 text-xs text-zinc-400">Protected milestones</p>
        </div>
      </div>

      {/* Main 2-Column Responsive Body */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column (2 spans): Active Job Posts & In-Flight Contracts */}
        <div className="space-y-6 lg:col-span-2">
          {/* Active Job Requisitions */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Active Job Posts ({activeJobs.length})
                </h2>
              </div>
              {activeJobs.length > 0 && (
                <Link
                  href="/client/jobs"
                  className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 flex items-center gap-1"
                >
                  <span>View all</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>

            {activeJobs.length > 0 ? (
              <div className="space-y-3">
                {activeJobs.map((job) => {
                  const proposalCount = job._count.proposals;
                  return (
                    <div
                      key={job.id}
                      className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800/80 dark:bg-zinc-950/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                    >
                      <div className="space-y-1 min-w-0">
                        <Link
                          href={getJobUrl(job)}
                          className="text-sm font-bold text-zinc-900 hover:underline dark:text-zinc-100 truncate block"
                        >
                          {job.title}
                        </Link>
                        <div className="flex items-center gap-2.5 text-xs text-zinc-500">
                          <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                            {job.budgetType === "HOURLY"
                              ? `$${job.budgetMinCents ? (job.budgetMinCents / 100).toFixed(0) : "35"} - $${job.budgetMaxCents ? (job.budgetMaxCents / 100).toFixed(0) : "75"}/hr`
                              : `$${job.budgetMaxCents ? (job.budgetMaxCents / 100).toLocaleString() : "2,500"} Fixed`}
                          </span>
                          <span>·</span>
                          <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          href={`/client/jobs/${job.id}/proposals`}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-800 shadow-2xs hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 transition"
                        >
                          <Users className="h-3.5 w-3.5 text-zinc-400" />
                          <span>
                            {proposalCount} {proposalCount === 1 ? "Proposal" : "Proposals"}
                          </span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-200 p-8 text-center text-xs text-zinc-500 dark:border-zinc-800">
                <Briefcase className="mx-auto h-7 w-7 text-zinc-400 mb-2" />
                <p className="font-semibold text-zinc-700 dark:text-zinc-300">
                  No active job postings
                </p>
                <p className="mt-1 text-zinc-400">
                  Publish a job brief to receive proposals from vetted engineering specialists.
                </p>
                <Link
                  href="/client/jobs/new"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-900 underline dark:text-zinc-100"
                >
                  <span>Post your first job</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}
          </div>

          {/* Ongoing Milestone Contracts */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Ongoing Contracts ({activeContracts.length})
                </h2>
              </div>
              {activeContracts.length > 0 && (
                <Link
                  href="/client/contracts"
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

                  return (
                    <div
                      key={contract.id}
                      className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800/80 dark:bg-zinc-950/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {contract.job.title}
                        </h3>
                        <p className="text-xs text-zinc-500">
                          Specialist:{" "}
                          <span className="font-medium text-zinc-700 dark:text-zinc-300">
                            {contract.freelancer.name}
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
                          <span className="text-xs font-medium text-zinc-500">
                            {completedM}/{totalM} milestones approved ({progress}%)
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
              <p className="text-xs text-zinc-500 py-2">
                No active contractor engagements currently in progress.
              </p>
            )}
          </div>
        </div>

        {/* Right Sidebar (1 span): Escrow Standing & Team */}
        <div className="space-y-6">
          {/* Escrow Protection Box */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Escrow Capital Protection
              </span>
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
            </div>

            <div>
              <div className="text-xs text-zinc-500">Active Escrow Funds</div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                $
                {(escrowLockedCents / 100).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                <span className="text-xs font-normal text-zinc-400">USD</span>
              </div>
            </div>

            <p className="text-xs text-zinc-500 leading-relaxed">
              Funds stay securely in milestone escrow. You review deliverables and release payments
              only when work meets specifications.
            </p>
          </div>

          {/* Quick Actions & Workspace */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block mb-1">
              Organization & Team
            </span>
            <Link
              href="/client/profile"
              className="flex items-center justify-between rounded-xl p-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800 transition"
            >
              <span className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-zinc-400" />
                <span>Company Profile & Settings</span>
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
            </Link>
            <Link
              href="/freelancers"
              className="flex items-center justify-between rounded-xl p-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800 transition"
            >
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-zinc-400" />
                <span>Search Freelance Talent</span>
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
