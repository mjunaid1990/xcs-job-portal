"use client";

import { useState, useTransition, useRef } from "react";
import { updateFreelancerProfileAction } from "@/server/actions/profile.actions";
import {
  Loader2,
  Check,
  DollarSign,
  Tag,
  X,
  Plus,
  Globe,
  Sparkles,
  Award,
  Search,
  Camera,
  Upload,
  AlertCircle,
  Layers,
  Clock,
  Languages,
  CheckCircle2,
} from "lucide-react";

function GithubIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function LinkedinIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

interface Skill {
  id: number;
  name: string;
  slug: string;
}

interface ProfileFormProps {
  profile: {
    user: {
      name: string;
      country?: string | null;
      timezone?: string | null;
      imageUrl?: string | null;
    };
    headline: string | null;
    bio: string | null;
    hourlyRateCents: number | null;
    currency: string;
    availability: string | null;
    experienceLevel: string | null;
    tags?: string[];
    githubUrl?: string | null;
    linkedinUrl?: string | null;
    websiteUrl?: string | null;
    yearsOfExperience?: number | null;
    englishProficiency?: string | null;
    skills: Array<{ skill: Skill }>;
  };
  skills: Skill[];
}

const RECOMMENDED_TAGS = [
  "microservices",
  "fintech",
  "stripe-connect",
  "nextjs15",
  "design-systems",
  "high-throughput",
  "tailwind-v4",
  "realtime-websockets",
  "ai-agents",
  "soc2-compliance",
  "zero-downtime",
  "graphql-federation",
];

export function FreelancerProfileForm({ profile, skills }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Avatar State
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(
    profile.user.imageUrl ?? null,
  );
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Core Fields
  const [name, setName] = useState(profile.user.name ?? "");
  const [headline, setHeadline] = useState(profile.headline ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [hourlyRate, setHourlyRate] = useState(
    profile.hourlyRateCents ? (profile.hourlyRateCents / 100).toString() : "85",
  );
  const [experienceLevel, setExperienceLevel] = useState(profile.experienceLevel ?? "EXPERT");
  const [availability, setAvailability] = useState(profile.availability ?? "AVAILABLE");
  const [yearsOfExperience, setYearsOfExperience] = useState<string>(
    profile.yearsOfExperience?.toString() ?? "6",
  );
  const [englishProficiency, setEnglishProficiency] = useState(
    profile.englishProficiency ?? "FLUENT",
  );

  // Social & Credibility Links
  const [githubUrl, setGithubUrl] = useState(profile.githubUrl ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedinUrl ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(profile.websiteUrl ?? "");

  // Custom Tags Manager
  const [tags, setTags] = useState<string[]>(profile.tags ?? []);
  const [tagInput, setTagInput] = useState("");

  // Skills Manager
  const [selectedSkills, setSelectedSkills] = useState<number[]>(
    profile.skills.map((s) => s.skill.id),
  );
  const [skillFilter, setSkillFilter] = useState("");

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Avatar image must not exceed 5MB.");
      return;
    }

    setAvatarFile(file);
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreviewUrl(objectUrl);
  };

  const handleResetAvatar = () => {
    setAvatarFile(null);
    if (avatarPreviewUrl && avatarPreviewUrl !== profile.user.imageUrl) {
      URL.revokeObjectURL(avatarPreviewUrl);
    }
    setAvatarPreviewUrl(profile.user.imageUrl ?? null);
    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }
  };

  const handleAddTag = (tagToAdd?: string) => {
    const val = (tagToAdd || tagInput)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, "");
    if (!val) return;
    if (!tags.includes(val)) {
      setTags((prev) => [...prev, val]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const toggleSkill = (id: number) => {
    setSelectedSkills((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id],
    );
  };

  const handleClearSkills = () => {
    setSelectedSkills([]);
  };

  const initials =
    name
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "NO";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const trimmedName = name.trim();
    const trimmedHeadline = headline.trim();
    const trimmedBio = bio.trim();

    if (trimmedName.length < 2) {
      setError("Full legal name must be at least 2 characters.");
      return;
    }
    if (trimmedName.length > 60) {
      setError("Full legal name cannot exceed 60 characters.");
      return;
    }

    if (trimmedHeadline.length < 5) {
      setError("Professional headline must be at least 5 characters.");
      return;
    }
    if (trimmedHeadline.length > 120) {
      setError("Professional headline cannot exceed 120 characters.");
      return;
    }

    if (trimmedBio.length < 30) {
      setError(`Biography must be at least 30 characters (currently ${trimmedBio.length}).`);
      return;
    }
    if (trimmedBio.length > 5000) {
      setError(`Biography cannot exceed 5,000 characters (currently ${trimmedBio.length}).`);
      return;
    }

    const rateNum = Number(hourlyRate);
    if (isNaN(rateNum) || rateNum < 5 || rateNum > 1000) {
      setError("Hourly rate must be between $5 and $1,000 USD.");
      return;
    }

    if (selectedSkills.length === 0) {
      setError("Please select at least 1 technology skill.");
      return;
    }

    const formData = new FormData();
    formData.append("name", trimmedName);
    formData.append("headline", trimmedHeadline);
    formData.append("bio", trimmedBio);
    formData.append("hourlyRate", hourlyRate);
    formData.append("experienceLevel", experienceLevel);
    formData.append("availability", availability);
    formData.append("yearsOfExperience", yearsOfExperience);
    formData.append("englishProficiency", englishProficiency);
    formData.append("githubUrl", githubUrl.trim());
    formData.append("linkedinUrl", linkedinUrl.trim());
    formData.append("websiteUrl", websiteUrl.trim());

    if (avatarFile) {
      formData.append("avatarFile", avatarFile);
    }

    // Append custom tags
    for (const t of tags) {
      formData.append("tags", t);
    }

    // Append skills
    for (const id of selectedSkills) {
      formData.append("skillIds", id.toString());
    }

    startTransition(async () => {
      const res = await updateFreelancerProfileAction(null, formData);
      if (!res.success) {
        setError(res.error ?? "Failed to save profile.");
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3500);
      }
    });
  };

  const filteredSkills = skills.filter((s) =>
    s.name.toLowerCase().includes(skillFilter.toLowerCase()),
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Global Alerts */}
      {success && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 animate-in fade-in duration-200 shadow-xs">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>Profile changes saved successfully! Live marketplace records updated.</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-2xl bg-red-500/10 p-4 text-xs font-semibold text-red-700 dark:text-red-400 border border-red-500/20 shadow-xs">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* BOX 1: IDENTITY & AVATAR CARD */}
      <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 sm:p-8 space-y-6">
        <div className="border-b border-zinc-100 pb-4 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Profile Identity & Professional Headline
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Manage your public avatar photo, full name, and primary job title.
              </p>
            </div>
          </div>
        </div>

        {/* Avatar Uploader Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-4 sm:p-5 dark:border-zinc-800 dark:bg-zinc-950/40">
          <div className="relative group shrink-0">
            {avatarPreviewUrl ? (
              <div className="relative h-20 w-20 overflow-hidden rounded-2xl border-2 border-zinc-200 dark:border-zinc-700 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatarPreviewUrl}
                  alt={name || "Profile avatar"}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-zinc-900 text-2xl font-black text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs ring-2 ring-white dark:ring-zinc-800">
                {initials}
              </div>
            )}
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-white shadow-md hover:bg-emerald-600 transition dark:bg-white dark:text-zinc-900 dark:hover:bg-emerald-500 dark:hover:text-white"
              title="Change avatar photo"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          <div className="flex-1 space-y-1">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Profile Photo & Headshot
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Upload a clear professional photo. A verified headshot gives clients 40% higher
              contract confidence.
            </p>
            <div className="flex items-center gap-2 pt-1.5">
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-2xs hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 transition"
              >
                <Upload className="h-3 w-3" />
                <span>Upload Photo</span>
              </button>
              {(avatarFile || (avatarPreviewUrl && avatarPreviewUrl !== profile.user.imageUrl)) && (
                <button
                  type="button"
                  onClick={handleResetAvatar}
                  className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-500 hover:text-red-500 transition"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Name & Headline Inputs */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                Full Legal Name <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] font-mono text-zinc-400">{name.length} / 60</span>
            </div>
            <input
              type="text"
              required
              minLength={2}
              maxLength={60}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                Professional Headline <span className="text-red-500">*</span>
              </label>
              <span
                className={`text-[11px] font-mono ${
                  headline.trim().length >= 5 && headline.trim().length <= 120
                    ? "text-zinc-400"
                    : headline.trim().length > 120
                      ? "text-red-500 font-bold"
                      : "text-amber-500"
                }`}
              >
                {headline.length} / 120 chars
              </span>
            </div>
            <input
              type="text"
              required
              minLength={5}
              maxLength={120}
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Senior Full-Stack Engineer | Next.js 15, TypeScript & Escrow Protocols"
              className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>
        </div>
      </div>

      {/* BOX 2: PRICING, SENIORITY & AVAILABILITY */}
      <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 sm:p-8 space-y-6">
        <div className="border-b border-zinc-100 pb-4 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <DollarSign className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Pricing, Seniority & Contract Availability
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Set your hourly rate in USD, contract availability, and experience level.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
              Hourly Billing Rate (USD) <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1.5">
              <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="number"
                min="5"
                max="1000"
                required
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-9 pr-3.5 text-xs font-semibold text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
            <p className="mt-1 text-[11px] text-zinc-400">
              You receive 100% of approved escrow payouts. Platform charges a flat $1 fee on
              milestone funding.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
              Current Work Availability
            </label>
            <div className="relative mt-1.5">
              <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-9 pr-3.5 text-xs text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              >
                <option value="AVAILABLE">Available for Full-time & Part-time Contracts</option>
                <option value="PART_TIME">Part-time Only (&lt; 20 hrs/week)</option>
                <option value="ADVISORY">Advisory / Architectural Consulting Only</option>
                <option value="NOT_AVAILABLE">Not Looking for New Contracts Currently</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
              Experience Level
            </label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            >
              <option value="ENTRY">Entry Level (1-2 years)</option>
              <option value="INTERMEDIATE">Intermediate (3-5 years)</option>
              <option value="EXPERT">Expert / Lead (6-9 years)</option>
              <option value="PRINCIPAL">Principal / Staff (10+ years)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
              Years in Tech
            </label>
            <input
              type="number"
              min="0"
              max="50"
              value={yearsOfExperience}
              onChange={(e) => setYearsOfExperience(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
              English Proficiency
            </label>
            <div className="relative mt-1.5">
              <Languages className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <select
                value={englishProficiency}
                onChange={(e) => setEnglishProficiency(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-9 pr-3.5 text-xs text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              >
                <option value="NATIVE">Native or Bilingual</option>
                <option value="FLUENT">Full Professional / Fluent</option>
                <option value="CONVERSATIONAL">Conversational Working</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* BOX 3: EXECUTIVE BIO & BACKGROUND */}
      <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 sm:p-8 space-y-6">
        <div className="border-b border-zinc-100 pb-4 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
              <Award className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Executive Overview & Technical Pitch
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Craft a detailed pitch highlighting past architectures, production outcomes, and
                core strengths.
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
              Biography & Architecture Expertise <span className="text-red-500">*</span>
            </label>
            <span
              className={`text-[11px] font-mono ${
                bio.trim().length >= 30 && bio.trim().length <= 5000
                  ? "text-zinc-400"
                  : bio.trim().length > 5000
                    ? "text-red-500 font-bold"
                    : "text-amber-500"
              }`}
            >
              {bio.length.toLocaleString()} / 5,000 chars {bio.trim().length < 30 && "(min 30)"}
            </span>
          </div>
          <textarea
            rows={8}
            required
            minLength={30}
            maxLength={5000}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Describe your architecture experience, past production deliverables, technical strengths, and preferred engagement models. Line breaks, bullet lists, markdown, and URLs are preserved..."
            className="mt-1.5 w-full rounded-2xl border border-zinc-300 bg-white p-4 text-xs text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-sans leading-relaxed whitespace-pre-wrap"
          />
          <div className="mt-3 rounded-xl bg-emerald-50/50 p-3 text-[11px] text-zinc-600 dark:bg-emerald-950/20 dark:text-zinc-400 border border-emerald-200/60 dark:border-emerald-900/30">
            <span className="font-bold text-emerald-800 dark:text-emerald-300">
              Pro-Tip for High Conversions:
            </span>{" "}
            Clients review your first 3 sentences first. Highlight measurable outcomes (e.g.
            &ldquo;Scaled transaction system to \$15M/yr with 99.99% uptime&rdquo;) and key
            frameworks.
          </div>
        </div>
      </div>

      {/* BOX 4: SPECIALIZATION & SEARCH TAGS */}
      <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 sm:p-8 space-y-6">
        <div className="border-b border-zinc-100 pb-4 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
              <Tag className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Specialization & Search Keywords
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Custom tags that boost your profile visibility when clients search the talent
                marketplace.
              </p>
            </div>
          </div>
          <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
            {tags.length} Active
          </span>
        </div>

        {/* Tag Input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Type tag (e.g. stripe-connect, nextjs15, microservices) and press Enter..."
              className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-9 pr-3 text-xs text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>
          <button
            type="button"
            onClick={() => handleAddTag()}
            disabled={!tagInput.trim()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-zinc-800 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white transition shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Tag</span>
          </button>
        </div>

        {/* Selected Tags Chips */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-50/70 px-3 py-1.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 animate-in fade-in duration-150"
              >
                <span>#{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="rounded-full p-0.5 hover:bg-emerald-200/50 dark:hover:bg-emerald-900/50 transition"
                  aria-label={`Remove tag ${tag}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Recommended Tag Suggestions */}
        <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Suggested Keywords (Click to add):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {RECOMMENDED_TAGS.filter((rt) => !tags.includes(rt)).map((rt) => (
              <button
                type="button"
                key={rt}
                onClick={() => handleAddTag(rt)}
                className="inline-flex items-center gap-1 rounded-lg border border-dashed border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] font-medium text-zinc-600 hover:border-emerald-400 hover:text-emerald-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-emerald-500 dark:hover:text-emerald-300 transition"
              >
                <Plus className="h-2.5 w-2.5" />
                <span>{rt}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* BOX 5: VERIFIED LINKS & SOCIAL PROOF */}
      <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 sm:p-8 space-y-6">
        <div className="border-b border-zinc-100 pb-4 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Globe className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Online Presence & Code Repositories
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Connect your code repositories and professional networks to increase client trust.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
              GitHub Profile
            </label>
            <div className="relative mt-1.5">
              <GithubIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username"
                className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-9 pr-3 text-xs text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
              LinkedIn Profile
            </label>
            <div className="relative mt-1.5">
              <LinkedinIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-9 pr-3 text-xs text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
              Personal Site / Portfolio URL
            </label>
            <div className="relative mt-1.5">
              <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://yourdomain.dev"
                className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-9 pr-3 text-xs text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
          </div>
        </div>
      </div>

      {/* BOX 6: CORE TECHNOLOGIES & SKILLS MULTI-PICKER */}
      <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 sm:p-8 space-y-6">
        <div className="border-b border-zinc-100 pb-4 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Core Technologies & Skills <span className="text-red-500">*</span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Select technologies you are comfortable architecting and delivering in production.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-bold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
              {selectedSkills.length} selected
            </span>
            {selectedSkills.length > 0 && (
              <button
                type="button"
                onClick={handleClearSkills}
                className="text-xs text-zinc-400 hover:text-red-500 transition"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Filter input */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            placeholder="Search skills by name (e.g. Next.js, PostgreSQL, Docker)..."
            className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-9 pr-3 text-xs text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </div>

        {/* Skills Pills */}
        <div className="max-h-64 overflow-y-auto rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
          <div className="flex flex-wrap gap-2">
            {filteredSkills.map((skill) => {
              const isSelected = selectedSkills.includes(skill.id);
              return (
                <button
                  type="button"
                  key={skill.id}
                  onClick={() => toggleSkill(skill.id)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition shadow-2xs ${
                    isSelected
                      ? "bg-zinc-900 text-white shadow-xs hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
                      : "bg-white text-zinc-700 border border-zinc-200/80 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800 dark:hover:bg-zinc-800"
                  }`}
                >
                  {isSelected && <Check className="h-3.5 w-3.5" />}
                  <span>{skill.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* STICKY BOTTOM SAVE ACTION BAR */}
      <div className="sticky bottom-4 z-20 rounded-3xl border border-zinc-200/90 bg-white/95 p-4 sm:p-5 shadow-xl backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            Save changes across all sections to update your public profile and active pitches.
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
              <span>Save & Update Profile</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
