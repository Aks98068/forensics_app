"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  BriefcaseBusiness,
  ClipboardCheck,
  Database,
  FileSearch,
  FolderSearch,
  Home,
  LogOut,
  Search,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

type Role = "user" | "analyst" | "admin";

type NavItem = {
  label: string;
  href: string;
  icon:
    | "home"
    | "cases"
    | "evidence"
    | "search"
    | "activity"
    | "reports"
    | "users"
    | "database"
    | "settings"
    | "audit"
    | "security";
};

const icons = {
  home: Home,
  cases: FolderSearch,
  evidence: Database,
  search: Search,
  activity: Activity,
  reports: BarChart3,
  users: Users,
  database: Database,
  settings: Settings,
  audit: ClipboardCheck,
  security: ShieldCheck,
};

const navigation: Record<Role, NavItem[]> = {
  user: [
    {
      label: "Dashboard",
      href: "/dashboard/user",
      icon: "home",
    },
    {
      label: "My Cases",
      href: "/dashboard/user/cases",
      icon: "cases",
    },
    {
      label: "Evidence",
      href: "/dashboard/user/evidence",
      icon: "evidence",
    },
    {
      label: "Search",
      href: "/dashboard/user/search",
      icon: "search",
    },
    {
      label: "Activity",
      href: "/dashboard/user/activity",
      icon: "activity",
    },
  ],

  analyst: [
    {
      label: "Dashboard",
      href: "/dashboard/analyst",
      icon: "home",
    },
    {
      label: "Investigations",
      href: "/dashboard/analyst/investigations",
      icon: "cases",
    },
    {
      label: "Evidence",
      href: "/dashboard/analyst/evidence",
      icon: "evidence",
    },
    {
      label: "Forensic Search",
      href: "/dashboard/analyst/search",
      icon: "search",
    },
    {
      label: "Reports",
      href: "/dashboard/analyst/reports",
      icon: "reports",
    },
    {
      label: "Activity",
      href: "/dashboard/analyst/activity",
      icon: "activity",
    },
  ],

  admin: [
    {
      label: "Dashboard",
      href: "/dashboard/admin",
      icon: "home",
    },
    {
      label: "Users",
      href: "/dashboard/admin/users",
      icon: "users",
    },
    {
      label: "Cases",
      href: "/dashboard/admin/cases",
      icon: "cases",
    },
    {
      label: "Evidence",
      href: "/dashboard/admin/evidence",
      icon: "evidence",
    },
    {
      label: "System Activity",
      href: "/dashboard/admin/activity",
      icon: "activity",
    },
    {
      label: "Audit Logs",
      href: "/dashboard/admin/audit",
      icon: "audit",
    },
    {
      label: "Security",
      href: "/dashboard/admin/security",
      icon: "security",
    },
    {
      label: "Settings",
      href: "/dashboard/admin/settings",
      icon: "settings",
    },
  ],
};

const roleNames: Record<Role, string> = {
  user: "Investigator",
  analyst: "Forensic Analyst",
  admin: "Administrator",
};

export default function DashboardSidebar({
  role,
}: {
  role: Role;
}) {
  const pathname = usePathname();

  const items = navigation[role];

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-[#E2DED5] bg-[#171A1F] text-white lg:flex lg:flex-col">
      {/* BRAND */}
      <div className="flex h-20 shrink-0 items-center border-b border-white/10 px-6">
        <Link
          href={`/dashboard/${role}`}
          className="flex items-center gap-3"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F97316] text-lg font-black">
            F
          </span>

          <div>
            <p className="text-sm font-black tracking-[0.12em]">
              FORENCIS
            </p>

            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
              Digital Evidence
            </p>
          </div>
        </Link>
      </div>

      {/* ROLE */}
      <div className="px-5 pt-6">
        <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
            Current role
          </p>

          <p className="mt-1 text-sm font-semibold text-white/85">
            {roleNames[role]}
          </p>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
          Workspace
        </p>

        <div className="space-y-1">
          {items.map((item) => {
            const Icon = icons[item.icon];

            const isActive =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-[#F97316] text-white shadow-lg shadow-[#F97316]/10"
                    : "text-white/55 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                <Icon
                  size={18}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  className="shrink-0"
                />

                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* BOTTOM */}
      <div className="border-t border-white/10 p-4">
        <Link
          href="/logout"
          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-white/50 transition hover:bg-white/[0.05] hover:text-white"
        >
          <LogOut size={18} />

          Sign out
        </Link>
      </div>
    </aside>
  );
}