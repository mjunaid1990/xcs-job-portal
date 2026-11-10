import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  showCount?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

export function StarRating({
  rating,
  reviewCount,
  showCount = true,
  size = "sm",
  className = "",
}: StarRatingProps) {
  const iconSizes = {
    xs: "h-3 w-3",
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const textSizes = {
    xs: "text-[11px]",
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base font-bold",
  };

  const safeRating = Math.max(0, Math.min(5, Math.round(rating * 10) / 10));

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-0.5 text-amber-500">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${iconSizes[size]} ${
              star <= Math.round(safeRating)
                ? "fill-amber-400 text-amber-400"
                : "fill-zinc-200 text-zinc-200 dark:fill-zinc-700 dark:text-zinc-700"
            }`}
          />
        ))}
      </div>

      <span className={`font-bold text-zinc-900 dark:text-zinc-100 ${textSizes[size]}`}>
        {safeRating.toFixed(1)}
      </span>

      {showCount && reviewCount !== undefined && (
        <span className="text-xs font-normal text-zinc-400 dark:text-zinc-500">
          ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
        </span>
      )}
    </div>
  );
}

