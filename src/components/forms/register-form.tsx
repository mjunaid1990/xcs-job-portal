"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerAction } from "@/server/actions/auth.actions";
import {
  Briefcase,
  UserCheck,
  Mail,
  Lock,
  User,
  ArrowRight,
  Loader2,
  DollarSign,
  X,
  Search,
  Building2,
  AlertCircle,
} from "lucide-react";

interface Skill {
  id: number;
  name: string;
  slug: string;
}

interface RegisterFormProps {
  skills?: Skill[];
}

const RECOMMENDED_TAGS = [
  "microservices",
  "fintech",
  "stripe-connect",
  "nextjs15",
  "high-throughput",
  "ai-agents",
  "tailwind-v4",
  "realtime-websockets",
];

export function RegisterForm({ skills = [] }: RegisterFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Role Selection
  const [role, setRole] = useState<"CLIENT" | "FREELANCER">("FREELANCER");

  // Multi-step state for Freelancer (1: Account, 2: Role & Rate, 3: Bio & Tags, 4: Skills & Links)
  const [step, setStep] = useState<number>(1);

  // Step 1: Account
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");

  // Step 2: Role & Rate
  const [headline, setHeadline] = useState("");
  const [hourlyRate, setHourlyRate] = useState("75");
  const [experienceLevel, setExperienceLevel] = useState("EXPERT");
  const [yearsOfExperience, setYearsOfExperience] = useState("5");
  const [availability, setAvailability] = useState("AVAILABLE");

  // Step 3: Bio & Tags
  const [bio, setBio] = useState("");
  const [tags, setTags] = useState<string[]>(["nextjs15", "fintech"]);
  const [tagInput, setTagInput] = useState("");

  // Step 4: Skills & Links
  const [selectedSkills, setSelectedSkills] = useState<number[]>([1, 2]); // default to first common skills if available
  const [skillFilter, setSkillFilter] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

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

  // Validation between steps
  const validateStep1 = () => {
    setError(null);
    if (!name.trim()) {
      setError("Please enter your full legal name.");
      return false;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid work email address.");
      return false;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    setError(null);
    if (!headline.trim()) {
      setError("Please enter your professional headline (e.g. Senior Full-Stack Engineer).");
      return false;
    }
    const rate = Number(hourlyRate);
    if (isNaN(rate) || rate < 5 || rate > 1000) {
      setError("Hourly rate must be between $5 and $1,000 USD.");
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    setError(null);
    if (bio.trim().length < 30) {
      setError(`Biography must be at least 30 characters (currently ${bio.trim().length}).`);
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // If client signup
    if (role === "CLIENT") {
      if (!validateStep1()) return;

      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("email", email.trim());
      formData.append("password", password);
      formData.append("role", "CLIENT");
      formData.append("companyName", companyName.trim() || `${name.trim()}'s Team`);

      startTransition(async () => {
        const result = await registerAction(null, formData);
        if (!result.success) {
          setError(result.error ?? "Registration failed.");
        } else {
          router.push(result.redirectUrl ?? "/client");
          router.refresh();
        }
      });
      return;
    }

    // Freelancer submission from final step
    if (!validateStep1() || !validateStep2() || !validateStep3()) return;

    if (selectedSkills.length === 0) {
      setError("Please select at least 1 core technology skill.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("email", email.trim());
    formData.append("password", password);
    formData.append("role", "FREELANCER");
    formData.append("headline", headline.trim());
    formData.append("hourlyRate", hourlyRate);
    formData.append("experienceLevel", experienceLevel);
    formData.append("yearsOfExperience", yearsOfExperience);
    formData.append("availability", availability);
    formData.append("bio", bio.trim());
    formData.append("githubUrl", githubUrl.trim());
    formData.append("linkedinUrl", linkedinUrl.trim());

    for (const t of tags) {
      formData.append("tags", t);
    }
    for (const id of selectedSkills) {
      formData.append("skillIds", id.toString());
    }

    startTransition(async () => {
      const result = await registerAction(null, formData);
      if (!result.success) {
        setError(result.error ?? "Registration failed.");
      } else {
        router.push(result.redirectUrl ?? "/freelancer");
        router.refresh();
      }
    });
  };

  const filteredSkills = skills.filter((s) =>
    s.name.toLowerCase().includes(skillFilter.toLowerCase()),
  );

  return (
    <div className="w-full space-y-6">
      {/* Role Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          I want to:
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              setRole("FREELANCER");
              setError(null);
            }}
            className={`flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition ${
              role === "FREELANCER"
                ? "border-zinc-900 bg-zinc-900 text-white shadow-sm dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
            }`}
          >
            <UserCheck className="h-5 w-5" />
            <span className="mt-2 text-xs sm:text-sm font-bold">Work as Freelancer</span>
            <span
              className={`text-[11px] ${
                role === "FREELANCER"
                  ? "text-zinc-300 dark:text-zinc-600"
                  : "text-zinc-500 dark:text-zinc-400"
              }`}
            >
              Win contracts & earn
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setRole("CLIENT");
              setStep(1);
              setError(null);
            }}
            className={`flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition ${
              role === "CLIENT"
                ? "border-zinc-900 bg-zinc-900 text-white shadow-sm dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
            }`}
          >
            <Briefcase className="h-5 w-5" />
            <span className="mt-2 text-xs sm:text-sm font-bold">Hire Talent</span>
            <span
              className={`text-[11px] ${
                role === "CLIENT"
                  ? "text-zinc-300 dark:text-zinc-600"
                  : "text-zinc-500 dark:text-zinc-400"
              }`}
            >
              Post jobs & hire
            </span>
          </button>
        </div>
      </div>

      {/* Freelancer Step Progress Indicator */}
      {role === "FREELANCER" && (
        <div className="space-y-2 pt-1 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-500">
            <span>Step {step} of 4</span>
            <span className="text-zinc-900 dark:text-zinc-100 font-bold">
              {step === 1 && "Account Credentials"}
              {step === 2 && "Role & Compensation"}
              {step === 3 && "Bio & Keywords"}
              {step === 4 && "Skills & Repositories"}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${step >= 1 ? "bg-zinc-900 dark:bg-zinc-100" : ""}`}
            />
            <div
              className={`h-full rounded-full transition-all ${step >= 2 ? "bg-zinc-900 dark:bg-zinc-100" : ""}`}
            />
            <div
              className={`h-full rounded-full transition-all ${step >= 3 ? "bg-zinc-900 dark:bg-zinc-100" : ""}`}
            />
            <div
              className={`h-full rounded-full transition-all ${step >= 4 ? "bg-zinc-900 dark:bg-zinc-100" : ""}`}
            />
          </div>
        </div>
      )}

      {/* Global Error Banner */}
      {error && (
        <div className="flex items-center gap-2 rounded-2xl bg-red-500/10 p-3.5 text-xs font-semibold text-red-700 dark:text-red-400 border border-red-500/20 shadow-xs animate-in fade-in duration-150">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ========================================================================= */}
        {/* CLIENT REGISTRATION FORM (FOCUSED 1-STEP)                                 */}
        {/* ========================================================================= */}
        {role === "CLIENT" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Primary Contact Name <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1.5">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Connor"
                  className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-10 pr-3.5 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Company / Organization Legal Name
              </label>
              <div className="relative mt-1.5">
                <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Vanguard Digital Lab"
                  className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-10 pr-3.5 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Work Email <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-10 pr-3.5 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-10 pr-3.5 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-xs font-bold text-white shadow-xs hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating Client Account...</span>
                </>
              ) : (
                <>
                  <span>Create Client Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* FREELANCER STEP 1: ACCOUNT CREDENTIALS                                    */}
        {/* ========================================================================= */}
        {role === "FREELANCER" && step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Full Legal Name <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1.5">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Noah Freelancer"
                  className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-10 pr-3.5 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Work Email <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="noah@example.com"
                  className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-10 pr-3.5 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-10 pr-3.5 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-100"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (validateStep1()) setStep(2);
              }}
              className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-xs font-bold text-white shadow-xs hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition"
            >
              <span>Continue to Role & Rate</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* FREELANCER STEP 2: ROLE, RATE & SENIORITY                                 */}
        {/* ========================================================================= */}
        {role === "FREELANCER" && step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Professional Headline <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Senior Full-Stack Engineer | Next.js 15 & PostgreSQL"
                className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-100"
              />
              <p className="mt-1 text-[11px] text-zinc-400">
                This title appears at the top of your public profile and on proposal submissions.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Hourly Rate ($/hr) <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1.5">
                  <DollarSign className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="number"
                    min="5"
                    max="1000"
                    required
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-10 pr-3.5 text-xs font-bold text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Years in Tech
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={yearsOfExperience}
                  onChange={(e) => setYearsOfExperience(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Seniority Level
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-100"
                >
                  <option value="ENTRY">Entry (1-2 yrs)</option>
                  <option value="INTERMEDIATE">Intermediate (3-5 yrs)</option>
                  <option value="EXPERT">Expert (6-9 yrs)</option>
                  <option value="PRINCIPAL">Principal (10+ yrs)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Work Availability
                </label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-100"
                >
                  <option value="AVAILABLE">Full & Part-Time</option>
                  <option value="PART_TIME">Part-Time (&lt;20 hrs)</option>
                  <option value="ADVISORY">Advisory Only</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 rounded-xl border border-zinc-200 py-3 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (validateStep2()) setStep(3);
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-xs font-bold text-white shadow-xs hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition"
              >
                <span>Continue to Bio & Tags</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* FREELANCER STEP 3: BIO & SPECIALIZATION TAGS                              */}
        {/* ========================================================================= */}
        {role === "FREELANCER" && step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Professional Bio & Technical Summary <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] font-mono text-zinc-400">
                  {bio.length} / 5,000 (min 30)
                </span>
              </div>
              <textarea
                rows={5}
                required
                minLength={30}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Describe your background, core architectural achievements, and the types of contracts you excel at delivering..."
                className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white p-3.5 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-100 font-sans leading-relaxed"
              />
            </div>

            {/* Specialization Tags */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Specialization Keywords
              </label>
              <div className="flex gap-2">
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
                  placeholder="Type tag (e.g. stripe-connect, nextjs15) & press Enter"
                  className="flex-1 rounded-xl border border-zinc-300 bg-white py-2 px-3 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-100"
                />
                <button
                  type="button"
                  onClick={() => handleAddTag()}
                  className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-800 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 transition"
                >
                  Add
                </button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 rounded-lg bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      <span>#{t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="text-zinc-400 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Suggestions */}
              <div className="flex flex-wrap gap-1 pt-1">
                {RECOMMENDED_TAGS.filter((rt) => !tags.includes(rt)).map((rt) => (
                  <button
                    type="button"
                    key={rt}
                    onClick={() => handleAddTag(rt)}
                    className="rounded-md border border-dashed border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] text-zinc-600 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
                  >
                    + {rt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-1/3 rounded-xl border border-zinc-200 py-3 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (validateStep3()) setStep(4);
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-xs font-bold text-white shadow-xs hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition"
              >
                <span>Continue to Skills & Links</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* FREELANCER STEP 4: SKILLS & ONLINE REPOSITORIES                           */}
        {/* ========================================================================= */}
        {role === "FREELANCER" && step === 4 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Core Technologies & Skills <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                  {selectedSkills.length} selected
                </span>
              </div>

              {/* Skill search */}
              <div className="relative mb-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                  placeholder="Filter skills (e.g. React, Next.js, Docker)..."
                  className="w-full rounded-xl border border-zinc-300 bg-white py-2 pl-9 pr-3 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>

              {/* Skills pills */}
              <div className="max-h-44 overflow-y-auto rounded-xl border border-zinc-200 bg-zinc-50/50 p-2.5 dark:border-zinc-800 dark:bg-zinc-950/40">
                <div className="flex flex-wrap gap-1.5">
                  {filteredSkills.map((s) => {
                    const isSel = selectedSkills.includes(s.id);
                    return (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => toggleSkill(s.id)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                          isSel
                            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                            : "bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800"
                        }`}
                      >
                        {isSel && "✓ "}
                        {s.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Optional Links */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                  GitHub Profile URL (Optional)
                </label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="mt-1 w-full rounded-xl border border-zinc-300 bg-white py-2 px-3 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                  LinkedIn URL (Optional)
                </label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="mt-1 w-full rounded-xl border border-zinc-300 bg-white py-2 px-3 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-1/3 rounded-xl border border-zinc-200 py-3 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-xs font-bold text-white shadow-xs hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating Profile...</span>
                  </>
                ) : (
                  <>
                    <span>Finish Setup & Launch</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Footer Navigation */}
      <div className="text-center text-xs text-zinc-500 pt-2 border-t border-zinc-100 dark:border-zinc-800">
        Already have a WorkWasl account?{" "}
        <Link
          href="/login"
          className="font-semibold text-zinc-900 underline hover:text-zinc-700 dark:text-zinc-100 dark:hover:text-zinc-300"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
