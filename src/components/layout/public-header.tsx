"use client";

import { useState } from "react";
import Link from "next/link";
import { WorkWaslLogo } from "@/components/ui/workwasl-logo";
import { NavLinks, type NavItem } from "@/components/layout/nav-links";
import { UserNavDropdown } from "@/components/layout/user-nav-dropdown";
import { Menu, X } from "lucide-react";

interface PublicHeaderProps {
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    roles?: string[];
    imageUrl?: string | null;
  } | null;
}

export function PublicHeader({ user }: PublicHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const roles = user?.roles ?? [];
  const isClient = roles.includes("CLIENT");
  const isFreelancer = roles.includes("FREELANCER");
  const isAdmin = roles.includes("ADMIN");

  const loggedInNavItems: NavItem[] = isFreelancer
    ? [
        { label: "Dashboard", href: "/freelancer" },
        { label: "Proposals", href: "/freelancer/proposals" },
        { label: "Contracts", href: "/freelancer/contracts" },
        { label: "Marketplace", href: "/jobs" },
        { label: "Messages", href: "/messages" },
      ]
    : isClient
      ? [
          { label: "Dashboard", href: "/client" },
          { label: "My Jobs", href: "/client/jobs" },
          { label: "Contracts", href: "/client/contracts" },
          { label: "Talent", href: "/freelancers" },
          { label: "Messages", href: "/messages" },
        ]
      : isAdmin
        ? [
            { label: "Dashboard", href: "/admin" },
            { label: "Categories", href: "/admin/categories" },
            { label: "Settings", href: "/admin/settings" },
            { label: "Messages", href: "/messages" },
          ]
        : [
            { label: "Dashboard", href: "/dashboard" },
            { label: "Marketplace", href: "/jobs" },
            { label: "Messages", href: "/messages" },
          ];

  const guestNavItems: NavItem[] = [
    { label: "Marketplace", href: "/jobs" },
    { label: "Talent", href: "/freelancers" },
    { label: "How It Works", href: "/#how-it-works" },
  ];

  const currentNavItems = user ? loggedInNavItems : guestNavItems;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/80 transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Desktop Navigation */}
        <div className="flex items-center gap-6">
          <WorkWaslLogo href="/" />

          {/* Desktop Navigation Links with Active State */}
          <div className="hidden md:flex pl-4 border-l border-zinc-200/80 dark:border-zinc-800">
            <NavLinks items={currentNavItems} />
          </div>
        </div>

        {/* Right CTA Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <UserNavDropdown user={user} />
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-xl px-3.5 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition"
              >
                Sign In
              </Link>

              <Link
                href="/register"
                className="rounded-xl bg-zinc-900 px-3.5 py-2 text-xs font-medium text-white shadow-2xs hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          {user ? (
            <UserNavDropdown user={user} />
          ) : (
            <Link
              href="/login"
              className="rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-medium dark:border-zinc-800"
            >
              Sign In
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="rounded-xl p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <NavLinks items={currentNavItems} mobile onItemClick={() => setMobileMenuOpen(false)} />

          {!user && (
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center rounded-xl border border-zinc-200 py-2 text-xs font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center rounded-xl bg-zinc-900 text-white py-2 text-xs font-medium dark:bg-zinc-100 dark:text-zinc-900"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
