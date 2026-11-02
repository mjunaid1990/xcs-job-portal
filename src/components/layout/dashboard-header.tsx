"use client";

import { useState } from "react";
import Link from "next/link";
import { WorkWaslLogo } from "@/components/ui/workwasl-logo";
import { NavLinks, type NavItem } from "@/components/layout/nav-links";
import { CommandPalette } from "@/components/layout/command-palette";
import { UserNavDropdown } from "@/components/layout/user-nav-dropdown";
import { Bell, Menu, X } from "lucide-react";

interface DashboardHeaderProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    roles?: string[];
    imageUrl?: string | null;
  };
  navItems: NavItem[];
}

export function DashboardHeader({ user, navItems }: DashboardHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/80 transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Desktop Navigation */}
        <div className="flex items-center gap-6">
          <WorkWaslLogo href="/dashboard" />

          {/* Desktop Core Header Navigation with Active States */}
          <div className="hidden md:flex pl-4 border-l border-zinc-200 dark:border-zinc-800">
            <NavLinks items={navItems} />
          </div>
        </div>

        {/* User Profile & Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <CommandPalette />

          <Link
            href="/notifications"
            aria-label="Notifications"
            className="relative rounded-xl p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition"
          >
            <Bell className="h-4 w-4" />
          </Link>

          <div className="pl-1 sm:pl-2 border-l border-zinc-200 dark:border-zinc-800">
            <UserNavDropdown user={user} />
          </div>

          {/* Mobile Hamburger Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden rounded-xl p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950 animate-in fade-in slide-in-from-top-2 duration-150">
          <NavLinks items={navItems} mobile onItemClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </header>
  );
}
