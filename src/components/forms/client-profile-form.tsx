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
    <form onSubmit={handleSubmit} className="space-y-7">
      {success && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 animate-in fade-in duration-200">
          <Check className="h-4 w-4" />
          <span>Organization profile updated successfully!</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-500/10 p-4 text-xs font-semibold text-red-700 dark:text-red-400 border border-red-500/20">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* SECTION 1: LOGO & BASIC IDENTITY */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
          <Sparkles className="h-3.5 w-3.5 text-blue-500" />
          <span>Company Brand & Contact</span>
        </div>

        {/* Company Logo Uploader Card */}
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
              Company Logo & Visual Identity
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

        {/* Row: Primary Contact & Company Name */}
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
                className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-9 pr-3.5 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
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
                className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-9 pr-3.5 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: INDUSTRY & COMPANY SCALE */}
      <div className="space-y-4 border-t border-zinc-100 pt-6 dark:border-zinc-800">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
          <Briefcase className="h-3.5 w-3.5 text-indigo-500" />
          <span>Industry & Organization Scale</span>
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
                className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
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
                className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-9 pr-3.5 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
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
                className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-9 pr-3.5 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
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
                className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-9 pr-3.5 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: ABOUT OVERVIEW */}
      <div className="space-y-4 border-t border-zinc-100 pt-6 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
            About Company & Engineering Culture
          </label>
          <span
            className={`text-[11px] font-mono ${
              about.length <= 4000 ? "text-zinc-400" : "text-red-500 font-bold"
            }`}
          >
            {about.length.toLocaleString()} / 4,000 chars
          </span>
        </div>
        <textarea
          rows={6}
          maxLength={4000}
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          placeholder="Describe your company's mission, engineering products, core tech stack, and what contractors can expect when working with your team..."
          className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-sans leading-relaxed"
        />
        <p className="mt-1 text-[11px] text-zinc-400">
          Tip: Candidates evaluate company mission, team size, and tech stack before sending
          detailed proposals.
        </p>
      </div>

      {/* SUBMIT BUTTON */}
      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
        <p className="text-xs text-zinc-400">
          Changes will reflect immediately on your job postings and company public view.
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-60 transition"
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
