import { auth } from "@/server/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ProfileService } from "@/server/services/profile.service";
import { OrganizationService } from "@/server/services/organization.service";
import { ClientProfileForm } from "@/components/forms/client-profile-form";
import { OrganizationTeamCard } from "@/components/forms/organization-team-card";
import {
  ProfileCompletenessCard,
  ProfileSectionStatus,
} from "@/components/ui/profile-completeness-card";
import { Building, ShieldCheck, Users, ExternalLink } from "lucide-react";

export default async function ClientProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [profile, org] = await Promise.all([
    ProfileService.getClientProfile(session.user.id),
    OrganizationService.getOrganization(session.user.id),
  ]);

  const sections: ProfileSectionStatus[] = [
    { name: "Company Name", completed: Boolean(profile.companyName?.trim()) },
    { name: "Primary Industry", completed: Boolean(profile.industry?.trim()) },
    { name: "Company Size", completed: Boolean(profile.companySize?.trim()) },
    {
      name: "About Brief (30+ chars)",
      completed: Boolean(profile.about && profile.about.trim().length >= 30),
    },
    { name: "Website URL", completed: Boolean(profile.website?.trim()) },
    { name: "Payment Verified", completed: Boolean(profile.paymentVerified) },
  ];

  const completedCount = sections.filter((s) => s.completed).length;
  const totalCount = sections.length;
  const score =
    completedCount === totalCount ? 100 : Math.round((completedCount / totalCount) * 100);

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Company Profile & Team Workspace
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Manage your organization details, corporate team seats, hiring identity, and payment
            verification status.
          </p>
        </div>
        <Link
          href={`/clients/${session.user.id}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-800 shadow-2xs hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 transition"
        >
          <ExternalLink className="h-3.5 w-3.5 text-blue-500" />
          <span>Preview Public Page</span>
        </Link>
      </div>

      {/* Profile Completeness Score Card */}
      <ProfileCompletenessCard
        score={score}
        completedCount={completedCount}
        totalCount={totalCount}
        sections={sections}
        role="CLIENT"
      />

      {/* Verification Status Pill */}
      <div className="flex items-center justify-between rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-2.5">
          <Building className="h-4 w-4 text-blue-500" />
          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
            Employer Verification & Escrow Readiness
          </span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>{profile.paymentVerified ? "Verified Employer" : "Standard Account"}</span>
        </div>
      </div>

      {/* Organization Details Form (Separated Cards) */}
      <ClientProfileForm profile={profile} />

      {/* Enterprise Multi-Seat Team Workspace Card */}
      <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <div className="flex items-center gap-2 border-b border-zinc-100 pb-4 text-sm font-semibold text-zinc-900 dark:border-zinc-800 dark:text-zinc-100">
          <Users className="h-4 w-4 text-indigo-500" />
          <span>Multi-Seat Team Workspace & Compliance</span>
        </div>
        <div className="mt-6">
          <OrganizationTeamCard
            organizationName={org.organizationName}
            seatsUsed={org.seatsUsed}
            seatsLimit={org.seatsLimit}
            taxId={org.taxId}
            initialMembers={org.members}
          />
        </div>
      </div>
    </div>
  );
}
