import { CheckCircle2, CircleDashed, Sparkles, Award } from "lucide-react";

export interface ProfileSectionStatus {
  name: string;
  completed: boolean;
}

interface ProfileCompletenessCardProps {
  score: number;
  completedCount?: number;
  totalCount?: number;
  sections?: ProfileSectionStatus[];
  missingItems?: string[];
  role: "CLIENT" | "FREELANCER";
}

export function ProfileCompletenessCard({
  score,
  completedCount,
  totalCount,
  sections = [],
  missingItems = [],
  role,
}: ProfileCompletenessCardProps) {
  const isComplete = score >= 100;
  const isClient = role === "CLIENT";

  const total = totalCount ?? (sections.length > 0 ? sections.length : isClient ? 6 : 7);
  const completed =
    completedCount ??
    (sections.length > 0
      ? sections.filter((s) => s.completed).length
      : Math.round((score / 100) * total));

  return (
    <div className="rounded-3xl border border-zinc-200/90 bg-white p-6 sm:p-7 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                isComplete
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-500/20"
                  : "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-500/20"
              }`}
            >
              {isComplete ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              )}
              <span>{isComplete ? "100% Profile Complete" : `${score}% Completed`}</span>
            </span>

            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              {completed} of {total} sections completed
            </span>
          </div>

          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
            {isClient ? "Organization Trust & Verification" : "Profile Completeness & Readiness"}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xl leading-relaxed">
            {isComplete
              ? "All key sections are completed! Your profile is verified, fully indexed for discovery, and ready for active contracts."
              : isClient
                ? "Complete company details to build credibility and attract verified proposals from top engineers."
                : "Fill out each profile section (headline, bio, rate, skills, experience, portfolio, and education) to reach 100% completeness and rank higher in client searches."}
          </p>
        </div>

        {/* Circular / Linear Progress Indicator */}
        <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
              {score}%
            </span>
            <span className="text-xs text-zinc-400">/ 100%</span>
          </div>
          <div className="h-2.5 w-40 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isComplete ? "bg-emerald-500" : score >= 70 ? "bg-indigo-600" : "bg-amber-500"
              }`}
              style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Structured Section Badges Checklist */}
      {sections.length > 0 ? (
        <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
          <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
            Profile Checklist ({completed}/{total} Completed)
          </p>
          <div className="flex flex-wrap gap-2">
            {sections.map((section, idx) => (
              <span
                key={idx}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                  section.completed
                    ? "bg-emerald-50/80 text-emerald-800 border border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "border border-dashed border-zinc-300 bg-zinc-50/50 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-850 dark:text-zinc-400"
                }`}
              >
                {section.completed ? (
                  <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <CircleDashed className="h-3 w-3 text-zinc-400" />
                )}
                <span>{section.name}</span>
              </span>
            ))}
          </div>
        </div>
      ) : missingItems.length > 0 && !isComplete ? (
        <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
          <p className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
            Add remaining sections to reach 100%:
          </p>
          <div className="flex flex-wrap gap-2">
            {missingItems.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-zinc-300 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-850 dark:text-zinc-300"
              >
                <CircleDashed className="h-3 w-3 text-indigo-500" />
                <span>{item}</span>
              </span>
            ))}
          </div>
        </div>
      ) : isComplete ? (
        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          <Award className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>All sections fulfilled. Profile is at 100% capacity!</span>
        </div>
      ) : null}
    </div>
  );
}
