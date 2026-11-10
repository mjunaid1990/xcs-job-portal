"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItem {
  label: string;
  href: string;
  badge?: number;
}

interface NavLinksProps {
  items: NavItem[];
  className?: string;
  mobile?: boolean;
  onItemClick?: () => void;
}

export function NavLinks({ items, className = "", mobile = false, onItemClick }: NavLinksProps) {
  const pathname = usePathname();

  return (
    <nav className={`flex ${mobile ? "flex-col space-y-1" : "items-center gap-1"} ${className}`}>
      {items.map((item) => {
        // Active route matching
        const isRootDashboard =
          item.href === "/freelancer" ||
          item.href === "/client" ||
          item.href === "/dashboard" ||
          item.href === "/admin";

        const isActive = isRootDashboard
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={`relative flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs transition-all ${
              mobile ? "w-full py-2.5" : ""
            } ${
              isActive
                ? "bg-zinc-100 text-zinc-950 font-semibold dark:bg-zinc-800 dark:text-zinc-50 shadow-2xs"
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/60 font-medium"
            }`}
          >
            <span>{item.label}</span>
            {typeof item.badge === "number" && item.badge > 0 && (
              <span
                className={`flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold ${
                  isActive
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200"
                }`}
              >
                {item.badge}
              </span>
            )}
            {!mobile && isActive && (
              <span className="absolute bottom-0 left-2.5 right-2.5 h-[2px] rounded-full bg-emerald-600 dark:bg-emerald-400" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
