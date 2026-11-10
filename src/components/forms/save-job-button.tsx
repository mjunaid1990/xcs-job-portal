"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { toggleSaveJobAction } from "@/server/actions/job.actions";
import { toast } from "sonner";

interface SaveJobButtonProps {
  jobId: string;
  initialSaved?: boolean;
  className?: string;
}

export function SaveJobButton({ jobId, initialSaved = false, className = "" }: SaveJobButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    const newSaved = !saved;
    setSaved(newSaved); // optimistic

    try {
      const res = await toggleSaveJobAction(jobId);
      if (res.success && res.saved !== undefined) {
        setSaved(res.saved);
        if (res.saved) {
          toast.success("Job saved to your bookmarks");
        } else {
          toast.info("Job removed from bookmarks");
        }
      } else if (res.error) {
        setSaved(!newSaved); // revert
        toast.error(res.error);
      }
    } catch {
      setSaved(!newSaved); // revert
      toast.error("Failed to update bookmark.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      title={saved ? "Remove bookmark" : "Save this job"}
      className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-xs font-semibold shadow-xs transition-all ${
        saved
          ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
          : "border-zinc-200/90 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
      } ${className}`}
    >
      <Bookmark
        className={`h-4 w-4 transition-colors ${
          saved
            ? "fill-emerald-600 text-emerald-600 dark:fill-emerald-400 dark:text-emerald-400"
            : "text-zinc-400"
        }`}
      />
      <span>{saved ? "Saved to Bookmarks" : "Save Job"}</span>
    </button>
  );
}
