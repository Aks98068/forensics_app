"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileSearch,
  FolderOpen,
  ShieldCheck,
  Users,
  Activity,
  Settings,
  LogOut,
  Menu,
  X,
  UserRound,
} from "lucide-react";
import { useState } from "react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

type DashboardShellProps = {
  children: React.ReactNode;
  role: "USER" | "ANALYST" | "ADMIN";
  title: string;
  description: string;
  navigation: NavItem[];
};

export default function DashboardShell({
  children,
  role,
  title,
  description,
  navigation,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const roleLabel =
    role === "ADMIN"
      ? "Administrator"
      : role === "ANALYST"
        ? "Forensic Analyst"
        : "Investigator";

  return (
    <div className="min-h-screen bg-[#F5F5F2] text-[#171A1F]">

      {/* =====================================================
          MOBILE OVERLAY
          ===================================================== */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close dashboard sidebar"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* =====================================================
          SIDEBAR
          ===================================================== */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col
          border-r border-[#E2DED5] bg-[#171A1F] text-white
          transition-transform duration-300
          lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >

        {/* Brand */}
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-white/10 px-6">

          <Link
            href="/"
            className="flex items-center gap-3"
            onClick={() => setMobileOpen(false)}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F97316] text-lg font-black">
              F
            </span>

            <div>
              <p className="text-sm font-black tracking-[0.16em]">
                FORENCIS
              </p>

              <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/40">
                Digital Evidence
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-white/50 hover:bg-white/5 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>

        </div>

        {/* Role */}
        <div className="px-5 py-5">

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F97316]/10 text-[#F97316]">
                <UserRound size={18} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold">
                  {roleLabel}
                </p>

                <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-white/35">
                  {role}
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4">

          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
            Workspace
          </p>

          <div className="space-y-1">

            {navigation.map((item) => {
              const Icon = item.icon;

              const isActive =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex items-center gap-3 rounded-xl px-3 py-3
                    text-sm font-semibold transition
                    ${
                      isActive
                        ? "bg-[#F97316] text-white shadow-lg shadow-[#F97316]/10"
                        : "text-white/55 hover:bg-white/[0.05] hover:text-white"
                    }
                  `}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

          </div>

        </nav>

        {/* Bottom */}
        <div className="shrink-0 border-t border-white/10 p-4">

          <Link
            href="/dashboard/settings"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-white/50 transition hover:bg-white/[0.05] hover:text-white"
          >
            <Settings size={18} />
            Settings
          </Link>

          <button
            type="button"
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-white/50 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={18} />
            Sign out
          </button>

        </div>

      </aside>

      {/* =====================================================
          MAIN AREA
          ===================================================== */}
      <div className="lg:pl-[270px]">

        {/* Dashboard top bar */}
        <header className="sticky top-0 z-30 h-20 border-b border-[#E2DED5] bg-[#F5F5F2]/95 backdrop-blur">

          <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">

            <div className="flex items-center gap-3">

              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="rounded-xl border border-[#E2DED5] bg-white p-2.5 text-[#626A73] hover:text-[#171A1F] lg:hidden"
                aria-label="Open dashboard sidebar"
              >
                <Menu size={20} />
              </button>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#F97316]">
                  {roleLabel}
                </p>

                <h1 className="mt-0.5 text-lg font-black sm:text-xl">
                  {title}
                </h1>
              </div>

            </div>

            <div className="hidden max-w-md text-right sm:block">
              <p className="text-xs leading-5 text-[#8A9097]">
                {description}
              </p>
            </div>

          </div>

        </header>

        {/* Page content */}
        <main className="min-h-[calc(100vh-5rem)] p-4 sm:p-6 lg:p-8">
          {children}
        </main>

      </div>

    </div>
  );
}