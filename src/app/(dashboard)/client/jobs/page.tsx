import { auth } from "@/server/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { JobService } from "@/server/services/job.service";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ClientJobStatusActions } from "@/components/forms/client-job-status-actions";
import { Briefcase, Plus, Eye, Users } from "lucide-react";

export default async function ClientJobsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const jobs = await JobService.getClientJobs(session.user.id);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "OPEN":
        return "success";
      case "IN_PROGRESS":
        return "info";
      case "COMPLETED":
        return "emerald";
      case "CLOSED":
      case "CANCELLED":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Your Active & Past Jobs"
        description="Review incoming candidate proposals, track ongoing milestones, and manage postings."
      >
        <Link
          href="/client/jobs/new"
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Post New Job</span>
        </Link>
      </PageHeader>

      <div className="rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <Link
                    href={`/jobs/${job.id}`}
                    className="font-bold text-zinc-900 hover:text-emerald-600 dark:text-zinc-100 dark:hover:text-emerald-400 transition"
                  >
                    {job.title}
                  </Link>
                  <Badge variant={getStatusVariant(job.status)} dot={job.status === "OPEN"}>
                    {job.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                  <span className="font-medium text-zinc-600 dark:text-zinc-400">
                    {job.category?.name ?? "General Category"}
                  </span>
                  <span>•</span>
                  <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                    {job._count.proposals} proposals received
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <Link
                  href={`/client/jobs/${job.id}/proposals`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-800 shadow-xs transition hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>Review Proposals ({job._count.proposals})</span>
                </Link>

                <Link
                  href={`/jobs/${job.id}`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200/90 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 shadow-xs transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <Eye className="h-3.5 w-3.5 text-zinc-400" />
                  <span>View Post</span>
                </Link>

                <ClientJobStatusActions jobId={job.id} status={job.status} />
              </div>
            </div>
          ))}

          {jobs.length === 0 && (
            <div className="p-8">
              <EmptyState
                icon={Briefcase}
                title="No active job postings"
                description="You haven't posted any job listings yet. Publish your requirements to receive pitches from vetted freelancers."
                action={{
                  label: "Post Your First Job",
                  href: "/client/jobs/new",
                  icon: Plus,
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
