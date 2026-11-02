import { Skeleton, JobCardSkeleton } from "@/components/ui/skeleton";

export default function MarketplaceLoading() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 animate-pulse">
      {/* Top Header Placeholder */}
      <div className="h-16 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Skeleton className="h-7 w-28 rounded-lg" />
            <div className="hidden md:flex items-center gap-2 pl-4 border-l border-zinc-200 dark:border-zinc-800">
              <Skeleton className="h-4 w-20 rounded-md" />
              <Skeleton className="h-4 w-16 rounded-md" />
              <Skeleton className="h-4 w-24 rounded-md" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-24 rounded-xl" />
          </div>
        </div>
      </div>

      <div className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Hero Header Skeleton */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200/60 pb-6 dark:border-zinc-800">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-md" />
                <Skeleton className="h-3.5 w-36 rounded-md" />
              </div>
              <Skeleton className="h-8 w-72 rounded-lg" />
              <Skeleton className="h-4 w-96 max-w-full rounded-md" />
            </div>

            <Skeleton className="h-10 w-36 rounded-xl shrink-0" />
          </div>

          {/* Unified Search & Multi-Filter Bar Skeleton */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-12 items-center">
              <Skeleton className="h-9 rounded-xl lg:col-span-4" />
              <Skeleton className="h-9 rounded-xl lg:col-span-3" />
              <Skeleton className="h-9 rounded-xl lg:col-span-2" />
              <Skeleton className="h-9 rounded-xl lg:col-span-2" />
              <Skeleton className="h-9 rounded-xl lg:col-span-1" />
            </div>

            {/* Trending Keyword Pills Skeleton */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex flex-wrap items-center gap-1.5">
                <Skeleton className="h-3.5 w-16 rounded-md" />
                <Skeleton className="h-6 w-14 rounded-lg" />
                <Skeleton className="h-6 w-16 rounded-lg" />
                <Skeleton className="h-6 w-12 rounded-lg" />
                <Skeleton className="h-6 w-14 rounded-lg" />
                <Skeleton className="h-6 w-16 rounded-lg" />
                <Skeleton className="h-6 w-18 rounded-lg" />
              </div>
            </div>
          </div>

          {/* Results Summary Bar Skeleton */}
          <div className="flex items-center justify-between px-1">
            <Skeleton className="h-4 w-44 rounded-md" />
          </div>

          {/* Jobs Feed Grid Skeleton */}
          <div className="space-y-3.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <JobCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
