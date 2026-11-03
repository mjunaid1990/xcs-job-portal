"use client";

import { useState, useTransition, useRef } from "react";
import {
  addPortfolioItemAction,
  deletePortfolioItemAction,
} from "@/server/actions/profile.actions";
import {
  Plus,
  Trash2,
  ExternalLink,
  Loader2,
  Upload,
  X,
  ImageIcon,
  AlertCircle,
  FolderGit2,
} from "lucide-react";

interface PortfolioItem {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  imageUrl?: string | null;
}

interface PortfolioListProps {
  items: PortfolioItem[];
}

export function PortfolioList({ items }: PortfolioListProps) {
  const [isPending, startTransition] = useTransition();
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormError("Please select a valid image file (PNG, JPG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError("Image size exceeds 5MB. Please choose a smaller image.");
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError("Project title is required.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("url", url.trim());
    if (selectedFile) {
      formData.append("imageFile", selectedFile);
    }

    startTransition(async () => {
      const res = await addPortfolioItemAction(null, formData);
      if (!res.success) {
        setFormError(res.error ?? "Failed to add portfolio item.");
      } else {
        setTitle("");
        setDescription("");
        setUrl("");
        handleRemoveFile();
        setShowAddForm(false);
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deletePortfolioItemAction(id);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Showcase Projects & Deliverables
          </h3>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            Upload real screenshots and links to your production systems, codebases, or case
            studies.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowAddForm(!showAddForm);
            setFormError(null);
            if (showAddForm) handleRemoveFile();
          }}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-800 shadow-xs transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700"
        >
          {showAddForm ? (
            <>
              <X className="h-3.5 w-3.5" />
              <span>Cancel</span>
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5 text-indigo-500" />
              <span>Add Case Study</span>
            </>
          )}
        </button>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleAdd}
          className="rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/30 p-5 sm:p-6 space-y-4 dark:border-indigo-900/50 dark:from-indigo-950/20 dark:via-zinc-900 dark:to-purple-950/20 animate-in fade-in duration-200"
        >
          <div className="border-b border-indigo-100 pb-3 dark:border-indigo-900/40">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              New Portfolio Project
            </h4>
            <p className="text-xs text-zinc-500">
              Add rich project details with a visual preview screenshot.
            </p>
          </div>

          {formError && (
            <div className="flex items-center gap-2 rounded-xl bg-red-500/10 p-3 text-xs font-semibold text-red-700 dark:text-red-400 border border-red-500/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                Project Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Distributed Escrow Ledger Protocol"
                className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                Live URL or Repository (Optional)
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Project Screenshot / Cover File Upload with Drag & Drop Preview */}
          <div>
            <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300 mb-1.5">
              Project Cover Screenshot (File Upload)
            </label>

            {previewUrl ? (
              <div className="relative aspect-video max-h-56 w-full max-w-md overflow-hidden rounded-xl border border-indigo-300 bg-zinc-950 shadow-sm dark:border-indigo-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Screenshot preview"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900/80 text-white hover:bg-red-600 transition shadow-md backdrop-blur-xs"
                  title="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="absolute bottom-2 left-2 rounded-md bg-zinc-900/80 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-xs">
                  {selectedFile?.name} (
                  {(selectedFile?.size ? selectedFile.size / 1024 : 0).toFixed(0)} KB)
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 bg-white/70 hover:bg-white hover:border-indigo-500 p-6 text-center cursor-pointer transition dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-indigo-500"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-105 transition dark:bg-indigo-950/60 dark:text-indigo-400">
                  <Upload className="h-5 w-5" />
                </div>
                <div className="mt-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Click or drag to select project screenshot
                </div>
                <p className="mt-1 text-[11px] text-zinc-400">PNG, JPG, or WebP up to 5 MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
              Project Description & Achievements
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the architectural challenge, technologies used (e.g. Next.js 15, PostgreSQL), and business impact..."
              className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 transition hover:from-indigo-500 hover:to-purple-500 disabled:opacity-60"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving Project...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Save Project to Portfolio</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                handleRemoveFile();
              }}
              className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Projects Showcase Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="group relative flex flex-col justify-between rounded-2xl border border-zinc-200/90 bg-white p-4 sm:p-5 shadow-xs transition hover:border-indigo-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-900/60 overflow-hidden"
          >
            <div>
              {item.imageUrl ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800 mb-3.5 border border-zinc-200/60 dark:border-zinc-700/60">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover object-top transition duration-300 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gradient-to-br from-zinc-100 via-zinc-50 to-zinc-200/60 dark:from-zinc-900 dark:via-zinc-900/60 dark:to-zinc-800/80 mb-3.5 border border-zinc-200/80 dark:border-zinc-800 flex flex-col items-center justify-center p-4 text-center transition group-hover:border-indigo-300 dark:group-hover:border-zinc-700">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-2xs border border-zinc-200/70 text-zinc-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                    <FolderGit2 className="h-5 w-5" />
                  </div>
                  <span className="mt-2 text-[11px] font-semibold tracking-tight text-zinc-600 dark:text-zinc-400 truncate max-w-[85%]">
                    {item.title}
                  </span>
                  <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                    Project Deliverable
                  </span>
                </div>
              )}

              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-bold text-zinc-900 group-hover:text-indigo-600 transition dark:text-zinc-100 dark:group-hover:text-indigo-400">
                  {item.title}
                </h4>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  disabled={isPending}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition"
                  title="Delete project"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {item.description && (
                <p className="mt-2 text-xs leading-relaxed text-zinc-600 line-clamp-3 dark:text-zinc-400">
                  {item.description}
                </p>
              )}
            </div>

            {item.url && (
              <div className="pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  <span>Inspect Live / Repo</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
        ))}

        {items.length === 0 && !showAddForm && (
          <div className="col-span-full rounded-2xl border border-dashed border-zinc-200 p-8 sm:p-12 text-center dark:border-zinc-800">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <ImageIcon className="h-6 w-6" />
            </div>
            <h4 className="mt-3 text-sm font-bold text-zinc-900 dark:text-zinc-100">
              No Portfolio Projects Added
            </h4>
            <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
              Showcasing 2 or more projects with real screenshots increases candidate shortlist rate
              by 3.8x.
            </p>
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Your First Project</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
