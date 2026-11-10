"use client";

import { useState, useTransition, useRef } from "react";
import { updateClientProfileAction } from "@/server/actions/profile.actions";
import {
  Loader2,
  Check,
  Globe,
  Building2,
  User,
  Users,
  Camera,
  Upload,
  AlertCircle,
  Briefcase,
  Sparkles,
  FileText,
  CheckCircle2,
} from "lucide-react";

function LinkedinIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

interface ClientProfileFormProps {
  profile: {
    user: { name: string; email: string; imageUrl?: string | null };
    companyName: string | null;
    website: string | null;
    companySize?: string | null;
    industry?: string | null;
    about?: string | null;
    linkedinUrl?: string | null;
  };
}

const INDUSTRY_OPTIONS = [
  "Fintech & Payments",
  "SaaS & Developer Tools",
  "AI & Machine Learning",
  "Healthcare & Life Sciences",
  "E-Commerce & Marketplaces",
  "Web3 & Blockchain",
  "Media & Entertainment",
  "Education & EdTech",
  "Security & Cloud Infrastructure",
  "Professional Services & Consulting",
];

const COMPANY_SIZE_OPTIONS = [
  "1-10 Employees (Startup / Seed)",
  "11-50 Employees (Series A-B)",
  "51-200 Employees (Growth / Mid-Market)",
  "201-1000 Employees (Large Enterprise)",
  "1000+ Employees (Global Enterprise)",
];

export function ClientProfileForm({ profile }: ClientProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Logo State
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(
    profile.user.imageUrl ?? null,
  );
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Form Fields
  const [name, setName] = useState(profile.user.name ?? "");
  const [companyName, setCompanyName] = useState(profile.companyName ?? "");
  const [website, setWebsite] = useState(profile.website ?? "");
  const [companySize, setCompanySize] = useState(
    profile.companySize ?? "11-50 Employees (Series A-B)",
  );
  const [industry, setIndustry] = useState(profile.industry ?? "Fintech & Payments");
  const [about, setAbout] = useState(profile.about ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedinUrl ?? "");

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, SVG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Company logo must not exceed 5MB.");
      return;
    }

    setLogoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setLogoPreviewUrl(objectUrl);
  };

  const handleResetLogo = () => {
    setLogoFile(null);
    if (logoPreviewUrl && logoPreviewUrl !== profile.user.imageUrl) {
      URL.revokeObjectURL(logoPreviewUrl);
    }
    setLogoPreviewUrl(profile.user.imageUrl ?? null);
    if (logoInputRef.current) {
      logoInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const trimmedName = name.trim();
    const trimmedCompany = companyName.trim();
    const trimmedAbout = about.trim();

    if (trimmedName.length < 2) {
      setError("Primary contact name must be at least 2 characters.");
      return;
    }
    if (trimmedName.length > 60) {
      setError("Primary contact name cannot exceed 60 characters.");
      return;
    }

    if (trimmedCompany.length < 2) {
      setError("Company or organization name must be at least 2 characters.");
      return;
    }
    if (trimmedCompany.length > 100) {
      setError("Company name cannot exceed 100 characters.");
      return;
    }

    if (trimmedAbout.length > 4000) {
      setError("About overview cannot exceed 4,000 characters.");
      return;
    }

    const formData = new FormData();
    formData.append("name", trimmedName);
    formData.append("companyName", trimmedCompany);
    formData.append("website", website.trim());
    formData.append("companySize", companySize);
    formData.append("industry", industry);
    formData.append("about", trimmedAbout);
    formData.append("linkedinUrl", linkedinUrl.trim());

    if (logoFile) {
      formData.append("logoFile", logoFile);
    }

    startTransition(async () => {
      const res = await updateClientProfileAction(null, formData);
      if (!res.success) {
        setError(res.error ?? "Failed to save company profile.");
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3500);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Global Alerts */}
      {success && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 animate-in fade-in duration-200 shadow-xs">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>
            Organization profile updated successfully! Changes reflect on all job openings.
          </span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-2xl bg-red-500/10 p-4 text-xs font-semibold text-red-700 dark:text-red-400 border border-red-500/20 shadow-xs">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* BOX 1: BRAND LOGO & CORE CONTACT */}
      <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 sm:p-8 space-y-6">
        <div className="border-b border-zinc-100 pb-4 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Company Brand & Primary Contact
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Upload your company logo mark and specify the legal organization identity.
              </p>
            </div>
          </div>
        </div>

        {/* Company Logo Uploader Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-4 sm:p-5 dark:border-zinc-800 dark:bg-zinc-950/40">
          <div className="relative group shrink-0">
            {logoPreviewUrl ? (
              <div className="relative h-20 w-20 overflow-hidden rounded-2xl border-2 border-blue-500/40 bg-white p-2 shadow-sm dark:bg-zinc-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoPreviewUrl}
                  alt={companyName || "Company logo"}
                  className="h-full w-full object-contain"
                />
              </div>
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border-2 border-dashed border-blue-300 dark:border-blue-800">
                <Building2 className="h-8 w-8" />
              </div>
            )}
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-white shadow-md hover:bg-blue-600 transition dark:bg-white dark:text-zinc-900 dark:hover:bg-blue-500 dark:hover:text-white"
              title="Upload company logo"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={handleLogoChange}
              className="hidden"
            />
          </div>

          <div className="flex-1 space-y-1">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Corporate Logo & Visual Mark
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Display your brand mark across job postings and contractor offers. High-res SVG or PNG
              recommended.
            </p>
            <div className="flex items-center gap-2 pt-1.5">
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-2xs hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 transition"
              >
                <Upload className="h-3 w-3" />
                <span>Upload Logo</span>
              </button>
              {(logoFile || (logoPreviewUrl && logoPreviewUrl !== profile.user.imageUrl)) && (
                <button
                  type="button"
                  onClick={handleResetLogo}
                  className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-500 hover:text-red-500 transition"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                Primary Contact Name <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] font-mono text-zinc-400">{name.length} / 60</span>
            </div>
            <div className="relative mt-1.5">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                required
                minLength={2}
                maxLength={60}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-9 pr-3.5 text-xs text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                Company / Organization Legal Name <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] font-mono text-zinc-400">
                {companyName.length} / 100
              </span>
            </div>
            <div className="relative mt-1.5">
              <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                required
                minLength={2}
                maxLength={100}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Technologies Inc."
                className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-9 pr-3.5 text-xs text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
          </div>
        </div>
      </div>

      {/* BOX 2: INDUSTRY & COMPANY SCALE */}
      <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 sm:p-8 space-y-6">
        <div className="border-b border-zinc-100 pb-4 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
              <Briefcase className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Industry Sector & Company Scale
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Categorize your firm so relevant specialists can evaluate project fit.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
              Primary Industry <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1.5">
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              >
                {INDUSTRY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
              Company Size <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1.5">
              <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <select
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-9 pr-3.5 text-xs text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              >
                {COMPANY_SIZE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Row: Website & LinkedIn */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
              Company Website
            </label>
            <div className="relative mt-1.5">
              <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://acme.com"
                className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-9 pr-3.5 text-xs text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
              Company LinkedIn Profile
            </label>
            <div className="relative mt-1.5">
              <LinkedinIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/company/acme"
                className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-9 pr-3.5 text-xs text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
          </div>
        </div>
      </div>

      {/* BOX 3: ABOUT COMPANY & ENGINEERING CULTURE */}
      <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 sm:p-8 space-y-6">
        <div className="border-b border-zinc-100 pb-4 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                About Company & Engineering Culture
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Describe your organization mission and engineering environment for candidate
                pitches.
              </p>
            </div>
          </div>
          <span
            className={`text-[11px] font-mono ${
              about.length <= 4000 ? "text-zinc-400" : "text-red-500 font-bold"
            }`}
          >
            {about.length.toLocaleString()} / 4,000 chars
          </span>
        </div>

        <div>
          <textarea
            rows={7}
            maxLength={4000}
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder="Describe your company's mission, engineering products, core tech stack, and what contractors can expect when collaborating with your teams..."
            className="w-full rounded-2xl border border-zinc-300 bg-white p-4 text-xs text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-sans leading-relaxed"
          />
          <p className="mt-2 text-[11px] text-zinc-400">
            Tip: Top-rated contractors evaluate mission, code quality standards, and team velocity
            before submitting proposals.
          </p>
        </div>
      </div>

      {/* STICKY BOTTOM SAVE ACTION BAR */}
      <div className="sticky bottom-4 z-20 rounded-3xl border border-zinc-200/90 bg-white/95 p-4 sm:p-5 shadow-xl backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Sparkles className="h-4 w-4 text-blue-500 shrink-0" />
          <span>
            Updates take effect immediately on your company profile and all active job postings.
          </span>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-8 py-3 text-xs font-bold text-white shadow-2xs hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 disabled:opacity-60 transition"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              <span>Save Organization Profile</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
