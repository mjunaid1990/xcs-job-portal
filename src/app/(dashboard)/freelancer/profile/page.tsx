import { auth } from "@/server/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ProfileService } from "@/server/services/profile.service";
import { FreelancerProfileForm } from "@/components/forms/freelancer-profile-form";
import { PortfolioList } from "@/components/forms/portfolio-list";
import { EducationList } from "@/components/forms/education-list";
import {
  ProfileCompletenessCard,
  ProfileSectionStatus,
} from "@/components/ui/profile-completeness-card";
import { FolderGit2, ExternalLink, GraduationCap } from "lucide-react";

export default async function FreelancerProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [profile, taxonomy] = await Promise.all([
    ProfileService.getFreelancerProfile(session.user.id),
    ProfileService.getTaxonomy(),
  ]);

  const sections: ProfileSectionStatus[] = [
    { name: "Professional Headline", completed: Boolean(profile.headline?.trim()) },
    {
      name: "Overview Bio (30+ chars)",
      completed: Boolean(profile.bio && profile.bio.trim().length >= 30),
    },
    {
      name: "Hourly Rate ($/hr)",
      completed: Boolean(profile.hourlyRateCents && profile.hourlyRateCents > 0),
    },
    { name: "Core Skills (1+)", completed: Boolean(profile.skills && profile.skills.length > 0) },
    { name: "Experience Level", completed: Boolean(profile.experienceLevel) },
    {
      name: "Portfolio Deliverable",
      completed: Boolean(profile.portfolioItems && profile.portfolioItems.length > 0),
    },
    {
      name: "Education & Degree",
      completed: Boolean(profile.educationItems && profile.educationItems.length > 0),
    },
  ];

  const completedCount = sections.filter((s) => s.completed).length;
  const totalCount = sections.length;
  const score =
    completedCount === totalCount ? 100 : Math.round((completedCount / totalCount) * 100);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Professional Profile Settings
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Showcase your skills, set your hourly rate, and manage your portfolio and credentials to
            win contracts.
          </p>
        </div>
        <Link
          href={`/freelancers/${session.user.id}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-800 shadow-2xs hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 transition"
        >
          <ExternalLink className="h-3.5 w-3.5 text-zinc-500" />
          <span>Preview Public Profile</span>
        </Link>
      </div>

      {/* Profile Completeness Score Card */}
      <ProfileCompletenessCard
        score={score}
        completedCount={completedCount}
        totalCount={totalCount}
        sections={sections}
        role="FREELANCER"
      />

      {/* Structured Profile Information Forms (Separated Cards) */}
      <FreelancerProfileForm profile={profile} skills={taxonomy.skills} />

      {/* Portfolio Showcase Card */}
      <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <div className="flex items-center gap-2 border-b border-zinc-100 pb-4 text-sm font-semibold text-zinc-900 dark:border-zinc-800 dark:text-zinc-100">
          <FolderGit2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>Portfolio & Work Deliverables</span>
        </div>
        <div className="mt-6">
          <PortfolioList items={profile.portfolioItems} />
        </div>
      </div>

      {/* Education & Academic Credentials Card */}
      <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <div className="flex items-center gap-2 border-b border-zinc-100 pb-4 text-sm font-semibold text-zinc-900 dark:border-zinc-800 dark:text-zinc-100">
          <GraduationCap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>Education & Academic Credentials</span>
        </div>
        <div className="mt-6">
          <EducationList items={profile.educationItems} />
        </div>
      </div>
    </div>
  );
}
