
"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Activity,
  Bell,
  BriefcaseBusiness,
  ClipboardList,
  Database,
  FileSearch,
  FileText,
  Fingerprint,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  UserCog,
  UserRound,
  Users,
  X,
} from "lucide-react";

import {
  getCurrentUser,
  getStoredUser,
  logout as logoutUser,
} from "@/lib/auth";

type Role = "investigator" | "analyst" | "admin";
type Theme = "light" | "dark";
type UserRecord = Record<string, unknown>;

type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<{
    size?: number;
    strokeWidth?: number;
    className?: string;
  }>;
};

type DashboardSidebarProps = {
  role: Role;
  title?: string;
  description?: string;
  navigationOverride?: NavItem[];
};

const ROLE_HOME: Record<Role, string> = {
  investigator: "/dashboard/investigator",
  analyst: "/dashboard/analyst",
  admin: "/dashboard/admin",
};

const ROLE_LABEL: Record<Role, string> = {
  investigator: "Investigator",
  analyst: "Forensic Analyst",
  admin: "Administrator",
};

const defaultNavigation: Record<Role, NavItem[]> = {
  investigator: [
    { label: "Dashboard", href: "/dashboard/investigator", icon: LayoutDashboard },
    { label: "My Cases", href: "/dashboard/investigator/cases", icon: BriefcaseBusiness },
    { label: "Evidence", href: "/dashboard/investigator/evidence", icon: Database },
    { label: "Forensic Search", href: "/dashboard/investigator/search", icon: Search },
    { label: "Activity", href: "/dashboard/investigator/activity", icon: Activity },
    { label: "My Profile", href: "/dashboard/investigator/profile", icon: UserRound },
  ],
  analyst: [
    { label: "Dashboard", href: "/dashboard/analyst", icon: LayoutDashboard },
    { label: "Investigations", href: "/dashboard/analyst/investigations", icon: FolderKanban },
    { label: "Evidence Review", href: "/dashboard/analyst/evidence", icon: Database },
    { label: "Forensic Search", href: "/dashboard/analyst/search", icon: FileSearch },
    { label: "Findings & Reports", href: "/dashboard/analyst/reports", icon: FileText },
    { label: "Activity", href: "/dashboard/analyst/activity", icon: Activity },
    { label: "My Profile", href: "/dashboard/analyst/profile", icon: UserRound },
  ],
  admin: [
    { label: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
    { label: "User Management", href: "/dashboard/admin/investigators", icon: Users },
    { label: "Case Management", href: "/dashboard/admin/cases", icon: BriefcaseBusiness },
    { label: "Team Assignments", href: "/dashboard/admin/assignments", icon: UserCog },
    { label: "Evidence Oversight", href: "/dashboard/admin/evidence", icon: Database },
    { label: "Findings & Reports", href: "/dashboard/admin/reports", icon: FileText },
    { label: "Audit Logs", href: "/dashboard/admin/audit", icon: ClipboardList },
    { label: "Security Events", href: "/dashboard/admin/security", icon: ShieldCheck },
    { label: "System Activity", href: "/dashboard/admin/activity", icon: Activity },
    { label: "Platform Settings", href: "/dashboard/admin/settings", icon: Settings },
    { label: "My Profile", href: "/dashboard/admin/profile", icon: UserRound },
  ],
};

function isRecord(value: unknown): value is UserRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function extractProfile(data: unknown): UserRecord | null {
  if (!isRecord(data)) return null;

  if (isRecord(data.user)) return data.user;

  if (isRecord(data.data)) {
    if (isRecord(data.data.user)) return data.data.user;
    return data.data;
  }

  return data;
}

function getAccountName(data: unknown): string {
  const user = extractProfile(data);
  if (!user) return "";

  const firstName = String(
    user.first_name ?? user.firstName ?? "",
  ).trim();

  const lastName = String(
    user.last_name ?? user.lastName ?? "",
  ).trim();

  const fullName = [firstName, lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (fullName) return fullName;

  for (const candidate of [
    user.full_name,
    user.fullName,
    user.name,
    user.username,
    user.email,
  ]) {
    if (
      typeof candidate === "string" &&
      candidate.trim()
    ) {
      return candidate.trim();
    }
  }

  return "";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;

  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

function getInitialTheme(): Theme {
  try {
    const saved = window.localStorage.getItem("forensiq-theme");

    if (saved === "dark" || saved === "light") {
      return saved;
    }

    // Respect the operating-system preference on first visit.
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
}

export default function DashboardSidebar({
  role,
  title = "Dashboard",
  description = "",
  navigationOverride,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  const roleHome = ROLE_HOME[role];
  const items = navigationOverride ?? defaultNavigation[role];

  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  const [themeReady, setThemeReady] = useState(false);

  const closeMobileMenu = useCallback(() => {
    setMobileOpen(false);
  }, []);

  // Restore the saved theme and apply it to the whole application.
  useEffect(() => {
    const initialTheme = getInitialTheme();
    setTheme(initialTheme);
    applyTheme(initialTheme);
    setThemeReady(true);
  }, []);

  const toggleTheme = useCallback(() => {
    const nextTheme: Theme =
      document.documentElement.classList.contains("dark")
        ? "light"
        : "dark";

    // Apply immediately so the whole dashboard updates.
    applyTheme(nextTheme);
    setTheme(nextTheme);

    try {
      window.localStorage.setItem("forensiq-theme", nextTheme);
    } catch (error) {
      console.error("FORENSIQ: Could not save theme preference.", error);
    }
  }, []);

  // Load the account name from the existing auth helpers.
  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const cachedUser = getStoredUser();
        const cachedName = getAccountName(cachedUser);

        if (cachedName && !cancelled) {
          setAccountName(cachedName);
        }

        const currentUser = await getCurrentUser();

        if (cancelled) return;

        const serverName = getAccountName(currentUser);
        if (serverName) setAccountName(serverName);
      } catch (error) {
        if (!cancelled) {
          console.error(
            "FORENSIQ: Could not load the authenticated profile.",
            error,
          );
        }
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMobileMenu();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen, closeMobileMenu]);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await logoutUser();
    } catch (error) {
      console.error("FORENSIQ: Sign out failed.", error);
      setLoggingOut(false);
    }
  }

  function isActive(href: string) {
    if (href === roleHome) return pathname === href;

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  }

  const profileHref = `${roleHome}/profile`;
  const initial = accountName
    ? accountName.charAt(0).toUpperCase()
    : "U";

  return (
    <>
      {/* Mobile header */}
      <header className="fixed inset-x-0 top-0 z-[60] flex h-16 items-center justify-between border-b border-[#2A2E34] bg-[#171A1F] px-3 text-white sm:px-5 lg:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            aria-controls="forensiq-sidebar"
            aria-expanded={mobileOpen}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#353A41] bg-[#20252B] hover:border-[#F97316] hover:text-[#F97316]"
          >
            <Menu size={21} />
          </button>

          <Link
            href={roleHome}
            className="flex min-w-0 items-center gap-2"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F97316]">
              <Fingerprint size={19} />
            </span>
            <span className="truncate text-sm font-black tracking-[0.16em]">
              FORENSIQ
            </span>
          </Link>
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          disabled={!themeReady}
          aria-label={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#353A41] bg-[#20252B] text-[#D9DDE2] hover:border-[#F97316] hover:text-[#F97316]"
        >
          {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
        </button>
      </header>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation backdrop"
          onClick={closeMobileMenu}
          className="fixed inset-0 z-[70] bg-black/65 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        id="forensiq-sidebar"
        aria-label={`${ROLE_LABEL[role]} navigation`}
        className={[
          "fixed inset-y-0 left-0 z-[80]",
          "flex h-dvh w-[min(86vw,320px)] flex-col",
          "border-r border-[#2A2E34] bg-[#171A1F] text-white",
          "shadow-2xl transition-transform duration-300 ease-out",
          "lg:w-72 lg:translate-x-0 lg:shadow-none",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Brand */}
        <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#2A2E34] px-4 sm:px-5">
          <Link
            href={roleHome}
            onClick={closeMobileMenu}
            className="flex min-w-0 items-center gap-3"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F97316]">
              <Fingerprint size={22} strokeWidth={2} />
            </span>

            <span className="truncate text-sm font-black tracking-[0.18em]">
              FORENSIQ
            </span>
          </Link>

          <button
            type="button"
            onClick={closeMobileMenu}
            aria-label="Close navigation"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#353A41] text-[#AEB4BB] hover:border-[#F97316] hover:text-[#F97316] lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        {/* Navigation: no workspace heading or extra role card */}
        <nav className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-3 py-4 [scrollbar-color:#353A41_transparent] [scrollbar-width:thin]">
          <div className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "group relative flex min-h-11 items-center gap-3",
                    "rounded-lg border px-3 py-2 text-sm font-medium",
                    "transition-colors duration-150",
                    active
                      ? "border-[#F97316]/35 bg-[#F97316]/10 text-white"
                      : "border-transparent text-[#AEB4BB] hover:border-[#353A41] hover:bg-[#20252B] hover:text-white",
                  ].join(" ")}
                >
                  {active && (
                    <span className="absolute bottom-1 left-0 top-1 w-[3px] rounded-r bg-[#F97316]" />
                  )}

                  <span
                    className={[
                      "shrink-0",
                      active
                        ? "text-[#F97316]"
                        : "text-[#858C94] group-hover:text-[#F97316]",
                    ].join(" ")}
                  >
                    <Icon size={19} strokeWidth={active ? 2.2 : 1.8} />
                  </span>

                  <span className="min-w-0 flex-1 truncate">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Single account display and controls */}
        <div className="shrink-0 border-t border-[#2A2E34] bg-[#171A1F] p-3 pb-[max(12px,env(safe-area-inset-bottom))]">
          <Link
            href="/notifications"
            onClick={closeMobileMenu}
            className="mb-2 flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-[#AEB4BB] hover:bg-[#20252B] hover:text-white"
          >
            <Bell size={18} />
            <span>Notifications</span>
          </Link>

          <button
            type="button"
            onClick={toggleTheme}
            disabled={!themeReady}
            aria-label={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
            className="mb-2 flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-[#AEB4BB] hover:bg-[#20252B] hover:text-white disabled:opacity-60"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
          </button>

          <Link
            href={profileHref}
            onClick={closeMobileMenu}
            className="mb-2 flex min-h-[58px] min-w-0 items-center gap-3 rounded-lg border border-[#2A2E34] bg-[#1D2228] px-3 hover:border-[#F97316]/50"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F97316] text-sm font-bold text-white">
              {initial}
            </span>

            <span className="min-w-0 flex-1">
              <span
                title={accountName || "Account"}
                className="block truncate text-sm font-semibold text-white"
              >
                {accountName || "Account"}
              </span>

              <span className="mt-1 block truncate text-[10px] uppercase tracking-[0.12em] text-[#8E959D]">
                {ROLE_LABEL[role]}
              </span>
            </span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex min-h-11 w-full items-center gap-3 rounded-lg border border-transparent px-3 text-sm font-medium text-[#AEB4BB] hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut size={18} className="shrink-0" />
            <span>{loggingOut ? "Signing out..." : "Sign out"}</span>
          </button>
        </div>
      </aside>

      {/* Desktop top bar */}
      <header className="fixed right-0 top-0 z-40 hidden h-[72px] items-center justify-between border-b border-[#E2DED5] bg-[var(--surface)] px-5 backdrop-blur-md transition-colors duration-200 dark:border-[#2A2E34] dark:bg-[#111418]/95 md:px-6 lg:left-72 lg:flex xl:px-8">
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold text-[#171A1F] dark:text-[#F3F4F6]">
            {title}
          </h1>
          {description && (
            <p className="truncate text-xs text-[#737A82]">
              {description}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            disabled={!themeReady}
            aria-label={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#D8D3C9] bg-white text-[#555C64] hover:border-[#F97316] hover:text-[#F97316] dark:border-[#353A41] dark:bg-[#20252B] dark:text-[#D9DDE2] disabled:opacity-60"
          >
            {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          <Link
            href="/notifications"
            aria-label="Notifications"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#D8D3C9] bg-white text-[#555C64] hover:border-[#F97316] hover:text-[#F97316] dark:border-[#353A41] dark:bg-[#20252B] dark:text-[#D9DDE2]"
          >
            <Bell size={19} />
          </Link>

          <Link
            href={profileHref}
            aria-label={`Profile: ${accountName || ROLE_LABEL[role]}`}
            className="flex h-10 max-w-[220px] items-center gap-3 rounded-lg border border-[#D8D3C9] bg-white px-3 hover:border-[#F97316] dark:border-[#353A41] dark:bg-[#20252B] xl:max-w-[280px]"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#171A1F] text-xs font-bold text-white">
              {initial}
            </span>
            <span className="truncate text-sm font-semibold text-[#171A1F] dark:text-[#F3F4F6]">
              {accountName || ROLE_LABEL[role]}
            </span>
          </Link>
        </div>
      </header>
    </>
  );
}
