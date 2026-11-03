import { ShieldCheck } from "lucide-react";

interface ProfileVerificationBadgeProps {
  isVerified?: boolean;
  label?: string;
  size?: "sm" | "md";
  className?: string;
}

export function ProfileVerificationBadge({
  isVerified = true,
  label = "Verified Specialist",
  size = "sm",
  className = "",
}: ProfileVerificationBadgeProps) {
  if (!isVerified) return null;

  const sizeClasses = {
    sm: "px-2.5 py-0.5 text-xs gap-1",
    md: "px-3 py-1 text-xs gap-1.5 font-semibold",
  };

  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-500/20 font-medium ${sizeClasses[size]} ${className}`}
      title="Verified identity & escrow standing"
    >
      <ShieldCheck
        className={`${iconSizes[size]} text-emerald-600 dark:text-emerald-400 shrink-0`}
      />
      <span>{label}</span>
    </span>
  );
}
