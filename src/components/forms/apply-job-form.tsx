"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitProposalAction } from "@/server/actions/proposal.actions";
import { Loader2, DollarSign, Send, Clock, HelpCircle } from "lucide-react";

interface ApplyJobFormProps {
  jobId: string;
  jobTitle?: string;
  budgetType: "FIXED" | "HOURLY";
  screeningQuestions?: string[];
  defaultBid?: string;
}

export function ApplyJobForm({
  jobId,
  budgetType,
  screeningQuestions = [],
  defaultBid = "500",
}: ApplyJobFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [bid, setBid] = useState(defaultBid);
  const [estimatedDays, setEstimatedDays] = useState("14");
  const [coverLetter, setCoverLetter] = useState("");
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const bidNum = Number(bid) || 0;
  const netEarnings = Math.max(0, bidNum > 0 ? bidNum - 1 : 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append("jobId", jobId);
    formData.append("bid", bid);
    formData.append("estimatedDays", estimatedDays);
    formData.append("coverLetter", coverLetter);

    const answersList = screeningQuestions.map((_, i) => answers[i] ?? "");
    formData.append("screeningAnswers", JSON.stringify(answersList));

    startTransition(async () => {
      const result = await submitProposalAction(null, formData);
      if (!result.success) {
        setError(result.error ?? "Failed to submit proposal.");
      } else {
        router.push("/freelancer/proposals");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50/70 p-3.5 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Proposed Terms */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Proposed Terms & Timeline
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {budgetType === "HOURLY" ? "Hourly Bid Rate ($/hr)" : "Your Total Bid ($)"}{" "}
              <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1.5">
              <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="number"
                min="5"
                step="any"
                required
                value={bid}
                onChange={(e) => setBid(e.target.value)}
                placeholder="500"
                className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-3.5 text-sm font-semibold text-zinc-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 transition"
              />
            </div>
            <p className="mt-1 text-[11px] text-zinc-400">
              Total amount the client will be billed.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Estimated Delivery Time (Days) <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1.5">
              <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="number"
                min="1"
                required
                value={estimatedDays}
                onChange={(e) => setEstimatedDays(e.target.value)}
                placeholder="14"
                className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-3.5 text-sm font-semibold text-zinc-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 transition"
              />
            </div>
            <p className="mt-1 text-[11px] text-zinc-400">
              Estimated days to full project delivery.
            </p>
          </div>
        </div>

        {/* Clean, Non-Duplicative Take-Home Snapshot */}
        <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-4 dark:border-zinc-800/80 dark:bg-zinc-950/40">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400">
              <div>
                <span className="text-[11px] text-zinc-400 block">Your Bid</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  ${bidNum.toFixed(2)}
                </span>
              </div>
              <span className="text-zinc-300 dark:text-zinc-700">—</span>
              <div>
                <span className="text-[11px] text-zinc-400 block">Platform Fee</span>
                <span className="font-mono font-medium text-zinc-500">$1.00 (Flat)</span>
              </div>
            </div>

            <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-200/60 dark:border-zinc-800">
              <span className="text-[11px] text-zinc-400 block">You&apos;ll Receive (Net)</span>
              <span className="font-mono text-base font-black text-emerald-600 dark:text-emerald-400">
                ${netEarnings.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Screening Questions from Client (if specified) */}
      {screeningQuestions.length > 0 && (
        <div className="space-y-4 rounded-2xl border border-emerald-100 bg-emerald-50/30 p-5 dark:border-emerald-950/40 dark:bg-emerald-950/20">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-950 dark:text-emerald-200">
            <HelpCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Client Screening Questions ({screeningQuestions.length})</span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            The client has requested responses to these specific questions. Please provide your
            answers in the fields below:
          </p>
          <div className="space-y-3.5 pt-1">
            {screeningQuestions.map((question, i) => (
              <div
                key={i}
                className="space-y-2 rounded-xl border border-zinc-200/80 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-start gap-2.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    {i + 1}
                  </span>
                  <span className="pt-0.5 leading-snug">{question}</span>
                </div>

                <textarea
                  rows={2}
                  value={answers[i] ?? ""}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [i]: e.target.value }))}
                  placeholder={`Type your answer to question #${i + 1}...`}
                  className="w-full resize-none rounded-lg border border-zinc-200 bg-zinc-50/60 p-2.5 text-xs leading-relaxed text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-100 transition"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cover Letter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Cover Letter & Proposal Pitch <span className="text-red-500">*</span>
          </label>
          <span
            className={`font-mono text-[11px] ${
              coverLetter.trim().length >= 20 && coverLetter.trim().length <= 5000
                ? "text-zinc-400"
                : coverLetter.trim().length > 5000
                  ? "font-bold text-red-500"
                  : "text-amber-500"
            }`}
          >
            {coverLetter.length.toLocaleString()} / 5,000 chars{" "}
            {coverLetter.trim().length < 20 && "(min 20)"}
          </span>
        </div>

        <textarea
          rows={7}
          required
          minLength={20}
          maxLength={5000}
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          placeholder="Explain your approach to the project, how you will tackle the milestone deliverables, and highlight past relevant experience..."
          className="w-full rounded-xl border border-zinc-200 bg-white p-3.5 text-xs leading-relaxed text-zinc-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 whitespace-pre-wrap transition"
        />
        <p className="text-[11px] text-zinc-400">
          Markdown formatting, bullet points, and code links are fully supported.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-zinc-200 px-4 py-2.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 transition"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isPending || coverLetter.trim().length < 20}
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-2.5 text-xs font-bold text-white shadow-2xs transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span>Submit Proposal</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
