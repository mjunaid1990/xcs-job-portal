"use client";

import { useState, useTransition } from "react";
import {
  addEducationItemAction,
  deleteEducationItemAction,
} from "@/server/actions/profile.actions";
import {
  GraduationCap,
  Plus,
  Trash2,
  Calendar,
  Building,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string | null;
  startYear?: number | null;
  endYear?: number | null;
  description?: string | null;
}

interface EducationListProps {
  items: EducationItem[];
}

export function EducationList({ items }: EducationListProps) {
  const [isPending, startTransition] = useTransition();
  const [showAddForm, setShowAddForm] = useState(false);
  const [institution, setInstitution] = useState("");
  const [degree, setDegree] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = () => {
    setInstitution("");
    setDegree("");
    setFieldOfStudy("");
    setStartYear("");
    setEndYear("");
    setDescription("");
    setFormError(null);
    setShowAddForm(false);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!institution.trim()) {
      setFormError("Institution or university name is required.");
      return;
    }
    if (!degree.trim()) {
      setFormError("Degree or qualification name is required.");
      return;
    }

    const formData = new FormData();
    formData.append("institution", institution.trim());
    formData.append("degree", degree.trim());
    if (fieldOfStudy.trim()) formData.append("fieldOfStudy", fieldOfStudy.trim());
    if (startYear.trim()) formData.append("startYear", startYear.trim());
    if (endYear.trim()) formData.append("endYear", endYear.trim());
    if (description.trim()) formData.append("description", description.trim());

    startTransition(async () => {
      const res = await addEducationItemAction(null, formData);
      if (!res.success) {
        setFormError(res.error ?? "Failed to add education credential.");
      } else {
        resetForm();
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to remove this education credential?")) return;

    startTransition(async () => {
      await deleteEducationItemAction(id);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
            Education & Degrees
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Verified academic qualifications, degrees, and university credentials.
          </p>
        </div>

        {!showAddForm && (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Education</span>
          </button>
        )}
      </div>

      {/* Add Education Form */}
      {showAddForm && (
        <form
          onSubmit={handleAdd}
          className="rounded-2xl border border-indigo-200/80 bg-indigo-50/30 p-5 dark:border-indigo-900/60 dark:bg-indigo-950/20 space-y-4 animate-in fade-in-50 duration-200"
        >
          <div className="flex items-center justify-between border-b border-indigo-100 pb-3 dark:border-indigo-900/40">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Add Education Credential
              </h4>
            </div>
            <button
              type="button"
              onClick={resetForm}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {formError && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/50 dark:text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                School or University <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. Stanford University or MIT"
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Degree or Diploma <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                placeholder="e.g. B.S. in Computer Science"
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Field of Study (Optional)
              </label>
              <input
                type="text"
                value={fieldOfStudy}
                onChange={(e) => setFieldOfStudy(e.target.value)}
                placeholder="e.g. Software Engineering & Distributed Systems"
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Start Year
                </label>
                <input
                  type="number"
                  min={1960}
                  max={2030}
                  value={startYear}
                  onChange={(e) => setStartYear(e.target.value)}
                  placeholder="2016"
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  End Year
                </label>
                <input
                  type="number"
                  min={1960}
                  max={2035}
                  value={endYear}
                  onChange={(e) => setEndYear(e.target.value)}
                  placeholder="2020"
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Description or Honors (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Magna Cum Laude, capstone thesis on high-concurrency consensus..."
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={resetForm}
              disabled={isPending}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition"
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Save Education</span>
            </button>
          </div>
        </form>
      )}

      {/* List of Education Entries */}
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="group flex flex-col sm:flex-row sm:items-start justify-between gap-3 rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-4 sm:p-5 hover:border-indigo-300 hover:bg-white dark:border-zinc-800 dark:bg-zinc-950/40 dark:hover:border-zinc-700 transition"
          >
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                <GraduationCap className="h-5 w-5" />
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {item.degree}
                </h4>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200 inline-flex items-center gap-1">
                    <Building className="h-3 w-3 text-zinc-400" />
                    <span>{item.institution}</span>
                  </span>

                  {item.fieldOfStudy && (
                    <>
                      <span>•</span>
                      <span>{item.fieldOfStudy}</span>
                    </>
                  )}

                  {(item.startYear || item.endYear) && (
                    <>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-zinc-500">
                        <Calendar className="h-3 w-3 text-zinc-400" />
                        <span>
                          {item.startYear ?? ""}
                          {item.startYear && item.endYear ? " – " : ""}
                          {item.endYear ?? (item.startYear ? "Present" : "")}
                        </span>
                      </span>
                    </>
                  )}
                </div>

                {item.description && (
                  <p className="pt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleDelete(item.id)}
              disabled={isPending}
              className="self-end sm:self-start rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition"
              title="Delete credential"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        {items.length === 0 && !showAddForm && (
          <div className="rounded-2xl border border-dashed border-zinc-200 p-8 sm:p-10 text-center dark:border-zinc-800">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <GraduationCap className="h-5 w-5" />
            </div>
            <h4 className="mt-3 text-sm font-bold text-zinc-900 dark:text-zinc-100">
              No Education Added Yet
            </h4>
            <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
              Adding degrees or academic certifications contributes towards 100% profile
              completeness and builds trust with enterprise clients.
            </p>
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Your Degree or Education</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
