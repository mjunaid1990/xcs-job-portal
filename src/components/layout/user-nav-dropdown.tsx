"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { logoutAction } from "@/server/actions/auth.actions";
import {
  User,
  Building2,
  ExternalLink,
  CreditCard,
  PlusCircle,
  Bell,
  LogOut,
  ChevronDown,
  FileText,
  AlertTriangle,
  Receipt,
  Users,
} from "lucide-react";

export interface UserNavDropdownProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    roles?: string[];
    imageUrl?: string | null;
  };
}

export function UserNavDropdown({ user }: UserNavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const roles = user.roles ?? [];
  const isClient = roles.includes("CLIENT");
  const isFreelancer = roles.includes("FREELANCER");
  const isAdmin = roles.includes("ADMIN");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  const roleLabel = isAdmin
    ? "Admin"
    : isClient
      ? "Client"
      : isFreelancer
        ? "Freelancer"
        : "Member";

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="group inline-flex items-center gap-2 rounded-xl border border-zinc-200/90 bg-white/80 p-1.5 pr-2.5 text-xs text-zinc-700 shadow-2xs hover:bg-zinc-50 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-300 dark:hover:bg-zinc-800 transition"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
          {initials}
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="max-w-[110px] truncate text-xs font-medium text-zinc-900 dark:text-zinc-100 leading-tight">
            {user.name}
          </span>
          <span className="text-[10px] text-zinc-400 leading-tight">{roleLabel}</span>
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-150 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-lg dark:border-zinc-800 dark:bg-zinc-900 z-50 animate-in fade-in zoom-in-95 duration-100">
          {/* User Info Header */}
          <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800 mb-1">
            <p className="truncate text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              {user.name}
            </p>
            <p className="truncate text-[11px] text-zinc-400">{user.email}</p>
          </div>

          {/* Role-Specific Non-Header & Profile Links */}
          <div className="space-y-0.5">
            {/* Freelancer Items */}
            {isFreelancer && (
              <>
                <Link
                  href="/freelancer/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  <User className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Profile</span>
                </Link>

                <Link
                  href={`/freelancers/${user.id}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Public View</span>
                </Link>

                <Link
                  href="/freelancer/payouts"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  <CreditCard className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Payouts</span>
                </Link>
              </>
            )}

            {/* Client Items */}
            {isClient && (
              <>
                <Link
                  href="/client/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  <Building2 className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Company Profile</span>
                </Link>

                <Link
                  href="/client/jobs/new"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  <PlusCircle className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Post Job</span>
                </Link>
              </>
            )}

            {/* Admin Items */}
            {isAdmin && (
              <>
                <Link
                  href="/admin/ledger"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  <Receipt className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Ledger</span>
                </Link>

                <Link
                  href="/admin/disputes"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  <AlertTriangle className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Disputes</span>
                </Link>

                <Link
                  href="/admin/reports"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  <FileText className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Reports</span>
                </Link>

                <Link
                  href="/admin/users"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  <Users className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Users</span>
                </Link>
              </>
            )}

            {/* General Alerts link */}
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              <Bell className="h-3.5 w-3.5 text-zinc-400" />
              <span>Alerts</span>
            </Link>
          </div>

          {/* Sign Out */}
          <div className="mt-1 pt-1 border-t border-zinc-100 dark:border-zinc-800">
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-red-600 hover:bg-red-50/50 dark:text-zinc-400 dark:hover:text-red-400 dark:hover:bg-red-950/20 transition"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
