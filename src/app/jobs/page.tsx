import Link from "next/link";
import { auth } from "@/server/lib/auth";
import { JobService } from "@/server/services/job.service";
import { ProfileService } from "@/server/services/profile.service";
import { PublicHeader } from "@/components/layout/public-header";
import { JobCard } from "@/components/jobs/job-card";
import {
  Search,
  ArrowRight,
  Filter,
  Sparkles,
  Code2,
  Palette,
  Cpu,
  Cloud,
  RotateCcw,
  PlusCircle,
  Briefcase,
} from "lucide-react";

interface JobsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    type?: string;
    level?: string;
    cursor?: string;
  }>;
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const params = await searchParams;
  const categoryId = params.category ? Number(params.category) : undefined;
  const budgetType = params.type === "HOURLY" || params.type === "FIXED" ? params.type : undefined;

  const [[{ items, nextCursor }, taxonomy], session] = await Promise.all([
    Promise.all([
      JobService.listJobs({
        query: params.q,
        categoryId,
        budgetType,
        experienceLevel: params.level,
        cursor: params.cursor,
        limit: 15,
      }),
      ProfileService.getTaxonomy(),
    ]),
    auth(),
  ]);

  const hasActiveFilters = Boolean(params.q || params.category || params.type || params.level);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <PublicHeader user={session?.user} />

      <div className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Hero Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200/60 pb-6 dark:border-zinc-800">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
                <Briefcase className="h-4 w-4" />
                <span>Marketplace Opportunities</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                Explore Freelance Projects
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                Browse verified milestone escrow contracts and apply with transparent flat $1 fees.
              </p>
            </div>

            <Link
              href="/client/jobs/new"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 transition shrink-0 self-start sm:self-auto"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Post a Job Scope</span>
            </Link>
          </div>

          {/* Unified Search & Multi-Filter Bar */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
            <form
              method="GET"
              className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-12 items-center"
            >
              {/* Keyword Search (4 cols) */}
              <div className="relative lg:col-span-4">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  name="q"
                  defaultValue={params.q ?? ""}
                  placeholder="Title, skills, or keywords..."
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2 pl-9 pr-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 transition"
                />
              </div>

              {/* Category Dropdown (3 cols) */}
              <div className="lg:col-span-3">
                <select
                  name="category"
                  defaultValue={params.category ?? ""}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2 px-3 text-xs text-zinc-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 transition"
                >
                  <option value="">All Categories</option>
                  {taxonomy.categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Budget Type Dropdown (2 cols) */}
              <div className="lg:col-span-2">
                <select
                  name="type"
                  defaultValue={params.type ?? ""}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2 px-3 text-xs text-zinc-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 transition"
                >
                  <option value="">All Budgets</option>
                  <option value="FIXED">Fixed Price</option>
                  <option value="HOURLY">Hourly Rate</option>
                </select>
              </div>

              {/* Experience Level Dropdown (2 cols) */}
              <div className="lg:col-span-2">
                <select
                  name="level"
                  defaultValue={params.level ?? ""}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2 px-3 text-xs text-zinc-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 transition"
                >
                  <option value="">All Levels</option>
                  <option value="ENTRY">Entry Level</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="EXPERT">Expert Level</option>
                </select>
              </div>

              {/* Submit Button (1 col) */}
              <div className="lg:col-span-1">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-zinc-900 py-2 px-3 text-xs font-semibold text-white shadow-2xs hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition"
                >
                  <Filter className="h-3.5 w-3.5" />
                  <span>Filter</span>
                </button>
              </div>
            </form>

            {/* Quick Trending Keyword Pills */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-semibold text-zinc-400 mr-1 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-indigo-500" />
                  <span>Popular:</span>
                </span>
                {[
                  "Next.js",
                  "TypeScript",
                  "React",
                  "Python",
                  "Tailwind",
                  "PostgreSQL",
                  "AI Agents",
                  "Stripe",
                ].map((kw) => (
                  <Link
                    key={kw}
                    href={`/jobs?q=${encodeURIComponent(kw)}`}
                    className={`rounded-lg px-2 py-0.5 text-[11px] font-medium transition ${
                      params.q === kw
                        ? "bg-indigo-600 text-white font-bold"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                    }`}
                  >
                    {kw}
                  </Link>
                ))}
              </div>

              {hasActiveFilters && (
                <Link
                  href="/jobs"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Clear All Filters</span>
                </Link>
              )}
            </div>
          </div>

          {/* Results Summary Bar */}
          <div className="flex items-center justify-between px-1 text-xs text-zinc-500">
            <span className="font-medium">
              Showing{" "}
              <span className="font-bold text-zinc-900 dark:text-zinc-100">{items.length}</span>{" "}
              active opportunities
            </span>
            {hasActiveFilters && (
              <span className="text-[11px] text-zinc-400">Filtered search results</span>
            )}
          </div>

          {/* Jobs Feed Grid */}
          <div className="space-y-3.5">
            {items.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}

            {/* Empty State */}
            {items.length === 0 && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-zinc-200/90 bg-white p-10 text-center shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 mb-3">
                    <Search className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {params.q || params.category || params.type
                      ? `No opportunities found matching "${params.q || "your filters"}"`
                      : "No active job postings in this view"}
                  </h3>
                  <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
                    Try clearing or broadening your keyword query, or explore projects by category
                    below.
                  </p>
                  <div className="mt-5 flex items-center justify-center gap-2.5">
                    {hasActiveFilters && (
                      <Link
                        href="/jobs"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 shadow-2xs hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 transition"
                      >
                        <RotateCcw className="h-3.5 w-3.5 text-zinc-400" />
                        <span>Reset Filters</span>
                      </Link>
                    )}
                    <Link
                      href="/client/jobs/new"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-indigo-500 transition"
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      <span>Post a Job Scope</span>
                    </Link>
                  </div>
                </div>

                {/* Explore Categories */}
                <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">
                    Explore Core Disciplines
                  </h4>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <Link
                      href="/jobs?q=fullstack"
                      className="flex items-center gap-3 rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-3.5 hover:border-indigo-400 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/40 transition"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                        <Code2 className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          Full-Stack Engineering
                        </div>
                        <div className="text-[10px] text-zinc-400">Next.js, Node, React</div>
                      </div>
                    </Link>

                    <Link
                      href="/jobs?q=design"
                      className="flex items-center gap-3 rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-3.5 hover:border-purple-400 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/40 transition"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
                        <Palette className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          UI/UX & Product Design
                        </div>
                        <div className="text-[10px] text-zinc-400">Figma, Design Systems</div>
                      </div>
                    </Link>

                    <Link
                      href="/jobs?q=ai"
                      className="flex items-center gap-3 rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-3.5 hover:border-emerald-400 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/40 transition"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                        <Cpu className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          AI & Agentic Systems
                        </div>
                        <div className="text-[10px] text-zinc-400">LLMs, Python, RAG</div>
                      </div>
                    </Link>

                    <Link
                      href="/jobs?q=cloud"
                      className="flex items-center gap-3 rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-3.5 hover:border-blue-400 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/40 transition"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                        <Cloud className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          DevOps & Cloud Infra
                        </div>
                        <div className="text-[10px] text-zinc-400">AWS, Docker, CI/CD</div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cursor Pagination */}
          {nextCursor && (
            <div className="flex justify-center pt-4">
              <Link
                href={`/jobs?cursor=${nextCursor}&q=${encodeURIComponent(params.q ?? "")}`}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-xs font-semibold text-zinc-800 shadow-2xs transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
              >
                <span>Load More Opportunities</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
