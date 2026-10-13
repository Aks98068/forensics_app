
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
  Search,
  Settings,
  ShieldCheck,
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

type NormalizedRole = "investigator" | "analyst" | "admin";

type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<{
    size?: number;
    strokeWidth?: number;
  }>;
};

type UserRecord = Record<string, unknown>;

const ROLE_HOME: Record<NormalizedRole, string> = {
  investigator: "/dashboard/investigator",
  analyst: "/dashboard/analyst",
  admin: "/dashboard/admin",
};

const roleLabels: Record<NormalizedRole, string> = {
  investigator: "Investigator",
  analyst: "Forensic Analyst",
  admin: "Administrator",
};

const navigation: Record<NormalizedRole, NavItem[]> = {
  investigator: [
    {
      label: "Dashboard",
      href: "/dashboard/investigator",
      icon: LayoutDashboard,
    },
    {
      label: "My Cases",
      href: "/dashboard/investigator/cases",
      icon: BriefcaseBusiness,
    },
    {
      label: "Evidence",
      href: "/dashboard/investigator/evidence",
      icon: Database,
    },
    {
      label: "Forensic Search",
      href: "/dashboard/investigator/search",
      icon: Search,
    },
    {
      label: "Activity",
      href: "/dashboard/investigator/activity",
      icon: Activity,
    },
    {
      label: "My Profile",
      href: "/dashboard/investigator/profile",
      icon: UserRound,
    },
  ],

  analyst: [
    {
      label: "Dashboard",
      href: "/dashboard/analyst",
      icon: LayoutDashboard,
    },
    {
      label: "Investigations",
      href: "/dashboard/analyst/investigations",
      icon: FolderKanban,
    },
    {
      label: "Evidence Review",
      href: "/dashboard/analyst/evidence",
      icon: Database,
    },
    {
      label: "Forensic Search",
      href: "/dashboard/analyst/search",
      icon: FileSearch,
    },
    {
      label: "Findings & Reports",
      href: "/dashboard/analyst/reports",
      icon: FileText,
    },
    {
      label: "Activity",
      href: "/dashboard/analyst/activity",
      icon: Activity,
    },
    {
      label: "My Profile",
      href: "/dashboard/analyst/profile",
      icon: UserRound,
    },
  ],

  admin: [
    {
      label: "Dashboard",
      href: "/dashboard/admin",
      icon: LayoutDashboard,
    },
    {
      label: "User Management",
      href: "/dashboard/admin/investigators",
      icon: Users,
    },
    {
      label: "Case Management",
      href: "/dashboard/admin/cases",
      icon: BriefcaseBusiness,
    },
    {
      label: "Team Assignments",
      href: "/dashboard/admin/assignments",
      icon: UserCog,
    },
    {
      label: "Evidence Oversight",
      href: "/dashboard/admin/evidence",
      icon: Database,
    },
    {
      label: "Findings & Reports",
      href: "/dashboard/admin/reports",
      icon: FileText,
    },
    {
      label: "Audit Logs",
      href: "/dashboard/admin/audit",
      icon: ClipboardList,
    },
    {
      label: "Security Events",
      href: "/dashboard/admin/security",
      icon: ShieldCheck,
    },
    {
      label: "System Activity",
      href: "/dashboard/admin/activity",
      icon: Activity,
    },
    {
      label: "Platform Settings",
      href: "/dashboard/admin/settings",
      icon: Settings,
    },
    {
      label: "My Profile",
      href: "/dashboard/admin/profile",
      icon: UserRound,
    },
  ],
};

/**
 * Normalize the three supported frontend roles.
 * The Go backend may identify investigators as USER.
 */
function normalizeRole(role: string): NormalizedRole {
  switch (role.trim().toUpperCase()) {
    case "USER":
    case "INVESTIGATOR":
      return "investigator";

    case "ANALYST":
      return "analyst";

    case "ADMIN":
      return "admin";

    default:
      throw new Error(`Unsupported account role: ${role}`);
  }
}

function isRecord(value: unknown): value is UserRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

/**
 * Supports common user/profile response formats.
 */
function extractProfile(data: unknown): UserRecord | null {
  if (!isRecord(data)) {
    return null;
  }

  if (isRecord(data.user)) {
    return data.user;
  }

  if (isRecord(data.data)) {
    if (isRecord(data.data.user)) {
      return data.data.user;
    }

    return data.data;
  }

  return data;
}

function getAccountName(data: unknown): string {
  const user = extractProfile(data);

  if (!user) {
    return "";
  }

  const firstName = String(
    user.first_name ?? user.firstName ?? ""
  ).trim();

  const lastName = String(
    user.last_name ?? user.lastName ?? ""
  ).trim();

  const fullName = [firstName, lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (fullName) {
    return fullName;
  }

  const candidates = [
    user.full_name,
    user.fullName,
    user.name,
    user.username,
    user.email,
  ];

  for (const candidate of candidates) {
    if (
      typeof candidate === "string" &&
      candidate.trim()
    ) {
      return candidate.trim();
    }
  }

  return "";
}

function getAccountRole(data: unknown): string {
  const user = extractProfile(data);

  return typeof user?.role === "string"
    ? user.role.trim()
    : "";
}

export default function DashboardSidebar({
  role,
}: {
  role: Role;
}) {
  const pathname = usePathname();

  const activeRole = normalizeRole(role);
  const roleHome = ROLE_HOME[activeRole];
  const items = navigation[activeRole];

  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  const closeMobileMenu = useCallback(() => {
    setMobileOpen(false);
  }, []);

  /**
   * Load the authenticated profile using auth.ts.
   * auth.ts handles refreshing an expired access token.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      // Display the cached profile immediately if available.
      const cachedUser = getStoredUser();

      if (cachedUser && !cancelled) {
        const cachedName = getAccountName(cachedUser);

        if (cachedName) {
          setAccountName(cachedName);
        }
      }

      try {
        const user = await getCurrentUser();

        if (cancelled) {
          return;
        }

        const name = getAccountName(user);

        if (name) {
          setAccountName(name);
        }

        const serverRole = getAccountRole(user);

        if (serverRole) {
          try {
            const normalizedServerRole =
              normalizeRole(serverRole);

            if (normalizedServerRole !== activeRole) {
              console.warn(
                "FORENSIQ: The sidebar role differs from the /me role."
              );
            }
          } catch {
            console.error(
              "FORENSIQ: /me returned an unsupported role."
            );
          }
        }
      } catch (error) {
        if (!cancelled) {
          console.error(
            "FORENSIQ: Could not load the authenticated profile.",
            error
          );
        }
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [activeRole]);

  // Close the drawer after navigation.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock background scrolling while the mobile drawer is open.
  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  // Close the mobile drawer with Escape.
  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen]);

  /**
   * Use the shared logout implementation so that
   * token cleanup stays consistent across the application.
   */
  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      await logoutUser();
    } finally {
      setLoggingOut(false);
    }
  }

  function isActive(href: string): boolean {
    // Dashboard links match only the exact dashboard route.
    if (href === roleHome) {
      return pathname === href;
    }

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
      <header className="fixed inset-x-0 top-0 z-[60] flex h-16 items-center justify-between border-b border-[#2A2E34] bg-[#171A1F] px-3 sm:px-5 lg:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            aria-controls="forensiq-sidebar"
            aria-expanded={mobileOpen}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[#353A41] bg-[#20252B] text-white transition hover:border-[#F97316] hover:text-[#F97316] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]"
          >
            <Menu size={21} />
          </button>

          <Link
            href={roleHome}
            className="flex min-w-0 items-center gap-2"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F97316]">
              <Fingerprint size={19} className="text-white" />
            </span>

            <span className="truncate text-sm font-black tracking-[0.16em] text-white sm:text-base">
              FORENSIQ
            </span>
          </Link>
        </div>

        <Link
          href="/notifications"
          aria-label="Notifications"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[#353A41] bg-[#20252B] text-[#D9DDE2] transition hover:border-[#F97316] hover:text-[#F97316]"
        >
          <Bell size={19} />
        </Link>
      </header>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation backdrop"
          onClick={closeMobileMenu}
          className="fixed inset-0 z-[70] cursor-default bg-black/65 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        id="forensiq-sidebar"
        aria-label={`${roleLabels[activeRole]} navigation`}
        className={[
          "fixed inset-y-0 left-0 z-[80]",
          "flex h-dvh w-[min(86vw,320px)] flex-col",
          "border-r border-[#2A2E34] bg-[#171A1F]",
          "shadow-2xl transition-transform duration-300 ease-out",
          "lg:w-72 lg:translate-x-0 lg:shadow-none",
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full",
        ].join(" ")}
      >
        {/* Brand header */}
        <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#2A2E34] px-4 sm:px-5">
          <Link
            href={roleHome}
            onClick={closeMobileMenu}
            className="flex min-w-0 items-center gap-3"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F97316]">
              <Fingerprint
                size={22}
                strokeWidth={2}
                className="text-white"
              />
            </span>

            <span className="min-w-0">
              <span className="block truncate text-sm font-black tracking-[0.18em] text-white">
                FORENSIQ
              </span>

              <span className="mt-1 block truncate text-[10px] font-medium uppercase tracking-[0.13em] text-[#8E959D]">
                Digital Forensics
              </span>
            </span>
          </Link>

          <button
            type="button"
            onClick={closeMobileMenu}
            aria-label="Close navigation"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#353A41] text-[#AEB4BB] transition hover:border-[#F97316] hover:text-[#F97316] lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        {/* Scrollable navigation */}
        <nav className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-3 py-5 [scrollbar-width:thin] [scrollbar-color:#353A41_transparent]">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#737A82]">
            {activeRole === "admin"
              ? "Administration"
              : activeRole === "analyst"
                ? "Analysis Workspace"
                : "Investigation Workspace"}
          </p>

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
                    "rounded-md border px-3 py-2",
                    "text-sm font-medium transition-colors duration-150",
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
                      "shrink-0 transition-colors",
                      active
                        ? "text-[#F97316]"
                        : "text-[#858C94] group-hover:text-[#F97316]",
                    ].join(" ")}
                  >
                    <Icon
                      size={19}
                      strokeWidth={active ? 2.2 : 1.8}
                    />
                  </span>

                  <span className="min-w-0 flex-1 truncate">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Account footer */}
        <div className="shrink-0 border-t border-[#2A2E34] bg-[#171A1F] p-3 pb-[max(12px,env(safe-area-inset-bottom))]">
          <Link
            href="/notifications"
            onClick={closeMobileMenu}
            className="mb-2 flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-[#AEB4BB] transition hover:bg-[#20252B] hover:text-white"
          >
            <Bell size={18} />
            <span>Notifications</span>
          </Link>

          <Link
            href={profileHref}
            onClick={closeMobileMenu}
            className="mb-2 flex min-h-[58px] min-w-0 items-center gap-3 rounded-md border border-[#2A2E34] bg-[#1D2228] px-3 transition hover:border-[#F97316]/50"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F97316] text-sm font-bold text-white">
              {initial}
            </span>

            <span className="min-w-0 flex-1">
              <span
                title={accountName || "Loading profile"}
                className="block truncate text-sm font-semibold text-white"
              >
                {accountName || "Loading profile..."}
              </span>

              <span className="mt-1 block truncate text-[10px] uppercase tracking-[0.12em] text-[#8E959D]">
                {roleLabels[activeRole]}
              </span>
            </span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex min-h-11 w-full items-center gap-3 rounded-md border border-transparent px-3 text-sm font-medium text-[#AEB4BB] transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut size={18} className="shrink-0" />

            <span>
              {loggingOut ? "Signing out..." : "Sign out"}
            </span>
          </button>
        </div>
      </aside>

      {/* Desktop topbar */}
      <header className="fixed right-0 top-0 z-40 hidden h-[72px] items-center justify-between border-b border-[#E2DED5] bg-[#F7F4EE]/95 px-5 backdrop-blur-md md:px-6 lg:left-72 lg:flex xl:px-8">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#737A82]">
            FORENSIQ Workspace
          </p>

          <p className="mt-1 truncate text-sm font-semibold text-[#171A1F]">
            {roleLabels[activeRole]}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/notifications"
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-md border border-[#D8D3C9] bg-white text-[#555C64] transition hover:border-[#F97316] hover:text-[#F97316]"
          >
            <Bell size={19} />
          </Link>

          <Link
            href={profileHref}
            className="flex h-10 max-w-[220px] items-center gap-3 rounded-md border border-[#D8D3C9] bg-white px-3 transition hover:border-[#F97316] xl:max-w-[280px]"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#171A1F] text-xs font-bold text-white">
              {initial}
            </span>

            <span className="truncate text-sm font-semibold text-[#171A1F]">
              {accountName || "Loading profile..."}
            </span>
          </Link>
        </div>
      </header>
    </>
  );
}
