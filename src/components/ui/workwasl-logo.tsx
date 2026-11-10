import Link from "next/link";

export interface WorkWaslIconProps {
  className?: string;
  size?: number;
}

/**
 * Pure SVG Logo Icon for WorkWasl.
 * Represents "Wasl" (connection & bridging) with an interlocking twin-ribbon geometric "W" escrow bond.
 * Rendered standalone without any enclosing background box.
 */
export function WorkWaslIcon({ className = "h-7 w-7", size = 28 }: WorkWaslIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-200 group-hover:scale-105 ${className}`}
      aria-label="WorkWasl Logo"
    >
      <defs>
        <linearGradient
          id="ww-left-flow"
          x1="2"
          y1="6"
          x2="18"
          y2="28"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#047857" />
          <stop offset="50%" stopColor="#059669" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        <linearGradient
          id="ww-right-flow"
          x1="30"
          y1="6"
          x2="14"
          y2="28"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#0f766e" />
          <stop offset="50%" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
        <linearGradient
          id="ww-core-node"
          x1="12"
          y1="12"
          x2="20"
          y2="24"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>

      {/* Left Interlocking Wing */}
      <path
        d="M 5 7 C 5 5.5 6.5 4.5 8 5.2 L 14 8.5 C 15.5 9.3 16.5 10.8 16.5 12.5 L 16.5 22.5 C 16.5 24.5 14.5 25.8 12.8 24.8 L 6.8 21.2 C 5.7 20.5 5 19.3 5 18 L 5 7 Z"
        fill="url(#ww-left-flow)"
      />

      {/* Right Interlocking Wing */}
      <path
        d="M 27 7 C 27 5.5 25.5 4.5 24 5.2 L 18 8.5 C 16.5 9.3 15.5 10.8 15.5 12.5 L 15.5 22.5 C 15.5 24.5 17.5 25.8 19.2 24.8 L 25.2 21.2 C 26.3 20.5 27 19.3 27 18 L 27 7 Z"
        fill="url(#ww-right-flow)"
        fillOpacity="0.92"
      />

      {/* Central Wasl Connection Bridge / Escrow Keystone */}
      <path d="M 16 11 L 20 13.5 L 16 16 L 12 13.5 Z" fill="url(#ww-core-node)" />
      <circle cx="16" cy="19.5" r="2.2" fill="#ffffff" />
    </svg>
  );
}

export interface WorkWaslLogoProps {
  href?: string;
  className?: string;
  iconSize?: number;
  showText?: boolean;
}

export function WorkWaslLogo({
  href = "/",
  className = "",
  iconSize = 28,
  showText = true,
}: WorkWaslLogoProps) {
  const content = (
    <div className={`group inline-flex items-center gap-2.5 ${className}`}>
      <WorkWaslIcon size={iconSize} />
      {showText && (
        <span className="text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-50">
          Work<span className="text-emerald-600 dark:text-emerald-400">Wasl</span>
        </span>
      )}
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href} className="inline-flex items-center">
      {content}
    </Link>
  );
}
