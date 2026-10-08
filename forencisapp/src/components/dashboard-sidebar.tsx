"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  Bell,
  BriefcaseBusiness,
  ClipboardList,
  Database,
  FileSearch,
  Fingerprint,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

type Role = "user" | "analyst" | "admin";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
  }>;
};

const navigation: Record<Role, NavItem[]> = {
  user: [
    {
      label: "Dashboard",
      href: "/dashboard/user",
      icon: LayoutDashboard,
    },
    {
      label: "My Cases",
      href: "/dashboard/user/cases",
      icon: BriefcaseBusiness,
    },
    {
      label: "Evidence",
      href: "/dashboard/user/evidence",
      icon: Database,
    },
    {
      label: "Search",
      href: "/dashboard/user/search",
      icon: Search,
    },
    {
      label: "Activity",
      href: "/dashboard/user/activity",
      icon: Activity,
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
      label: "Evidence",
      href: "/dashboard/analyst/evidence",
      icon: Database,
    },
    {
      label: "Forensic Search",
      href: "/dashboard/analyst/search",
      icon: FileSearch,
    },
    {
      label: "Reports",
      href: "/dashboard/analyst/reports",
      icon: ClipboardList,
    },
    {
      label: "Activity",
      href: "/dashboard/analyst/activity",
      icon: Activity,
    },
  ],

  admin: [
    {
      label: "Dashboard",
      href: "/dashboard/admin",
      icon: LayoutDashboard,
    },
    {
      label: "Users",
      href: "/dashboard/admin/users",
      icon: Users,
    },
    {
      label: "Cases",
      href: "/dashboard/admin/cases",
      icon: BriefcaseBusiness,
    },
    {
      label: "Evidence",
      href: "/dashboard/admin/evidence",
      icon: Database,
    },
    {
      label: "System Activity",
      href: "/dashboard/admin/activity",
      icon: Activity,
    },
    {
      label: "Audit Logs",
      href: "/dashboard/admin/audit",
      icon: ClipboardList,
    },
    {
      label: "Security",
      href: "/dashboard/admin/security",
      icon: ShieldCheck,
    },
    {
      label: "Settings",
      href: "/dashboard/admin/settings",
      icon: Settings,
    },
  ],
};

const roleLabels: Record<Role, string> = {
  user: "User",
  analyst: "Forensic Analyst",
  admin: "Administrator",
};

export default function DashboardSidebar({
  role,
}: {
  role: Role;
}) {
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountName, setAccountName] = useState("User Account");

  /*
   * Fetch the logged-in user's name.
   *
   * The parser supports several common response shapes so the
   * sidebar does not depend on one exact API wrapper structure.
   */
  useEffect(() => {
    let mounted = true;

    async function loadAccount() {
      try {
        const response = await fetch(
          "/api/v1/protected/user/me",
          {
            method: "GET",
            credentials: "include",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
          },
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        const user =
          data?.user ??
          data?.data?.user ??
          data?.data ??
          data;

        const name =
          user?.name ??
          user?.full_name ??
          user?.fullName ??
          user?.username ??
          user?.email;

        if (mounted && name) {
          setAccountName(String(name));
        }
      } catch {
        // Keep the fallback account name.
      }
    }

    loadAccount();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * Close the mobile drawer whenever the route changes.
   */
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  /*
   * Prevent body scrolling while the mobile drawer is open.
   */
  useEffect(() => {
    if (!mobileOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  /*
   * Allow ESC to close the mobile sidebar.
   */
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

  const handleLogout = async () => {
    try {
      await fetch("/api/v1/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });
    } finally {
      window.location.replace("/login");
    }
  };

  const isActive = (href: string) => {
    if (href === `/dashboard/${role}`) {
      return pathname === href;
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };

  return (
    <>
      {/* =========================================================
          MOBILE TOPBAR
      ========================================================= */}
      <header
        className="
          fixed inset-x-0 top-0 z-[60]
          flex h-[68px] items-center justify-between
          border-b border-[#2A2E34]
          bg-[#171A1F]
          px-4
          lg:hidden
        "
      >
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open dashboard menu"
            aria-expanded={mobileOpen}
            className="
              flex h-10 w-10 shrink-0 items-center justify-center
              border border-[#353A41]
              bg-[#20252B]
              text-white
              transition
              hover:border-[#F97316]
              hover:text-[#F97316]
              focus:outline-none
              focus:ring-2
              focus:ring-[#F97316]/40
            "
          >
            <Menu size={21} strokeWidth={2} />
          </button>

          <Link
            href={`/dashboard/${role}`}
            className="flex min-w-0 items-center gap-2"
          >
            {/* UPDATED LOGO */}
            <span
              className="
                flex h-8 w-8 shrink-0 items-center justify-center
                rounded-lg
                bg-[#F97316]
              "
            >
              <Fingerprint
                size={18}
                strokeWidth={2.1}
                className="text-white"
              />
            </span>

            <span className="truncate text-sm font-bold tracking-[0.18em] text-white">
              FORENCIS
            </span>
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/notifications"
            aria-label="Notifications"
            className="
              flex h-10 w-10 items-center justify-center
              border border-[#353A41]
              bg-[#20252B]
              text-[#D9DDE2]
              transition
              hover:border-[#F97316]
              hover:text-[#F97316]
            "
          >
            <Bell size={19} strokeWidth={1.9} />
          </Link>

          <div
            className="
              hidden
              max-w-[140px]
              truncate
              border border-[#353A41]
              bg-[#20252B]
              px-3 py-2
              text-xs font-medium text-[#E5E7EB]
              sm:block
            "
          >
            {accountName}
          </div>
        </div>
      </header>

      {/* =========================================================
          MOBILE OVERLAY
      ========================================================= */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close dashboard menu"
          onClick={() => setMobileOpen(false)}
          className="
            fixed inset-0 z-[70]
            bg-black/60
            backdrop-blur-[2px]
            lg:hidden
          "
        />
      )}

      {/* =========================================================
          SIDEBAR
      ========================================================= */}
      <aside
        className={`
          fixed left-0 top-0 z-[80]
          flex h-dvh w-[280px] flex-col
          border-r border-[#2A2E34]
          bg-[#171A1F]
          shadow-2xl
          transition-transform duration-300 ease-out
          lg:w-72
          lg:translate-x-0
          lg:shadow-none
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* ---------------------------------------------------------
            SIDEBAR HEADER
        --------------------------------------------------------- */}
        <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-[#2A2E34] px-5">
          <Link
            href={`/dashboard/${role}`}
            onClick={() => setMobileOpen(false)}
            className="flex min-w-0 items-center gap-3"
          >
            {/* UPDATED LOGO */}
            <span
              className="
                flex h-10 w-10 shrink-0 items-center justify-center
                rounded-xl
                bg-[#F97316]
              "
            >
              <Fingerprint
                size={21}
                strokeWidth={2}
                className="text-white"
              />
            </span>

            <div className="min-w-0">
              <div className="truncate text-sm font-black tracking-[0.2em] text-white">
                FORENCIS
              </div>

              <div className="mt-0.5 truncate text-[10px] font-medium uppercase tracking-[0.16em] text-[#8E959D]">
                Digital Evidence
              </div>
            </div>
          </Link>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close dashboard menu"
            className="
              flex h-9 w-9 shrink-0 items-center justify-center
              border border-[#353A41]
              text-[#AEB4BB]
              transition
              hover:border-[#F97316]
              hover:text-[#F97316]
              lg:hidden
            "
          >
            <X size={19} />
          </button>
        </div>

        {/* ---------------------------------------------------------
            NAVIGATION
        --------------------------------------------------------- */}
        <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
          <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#737A82]">
            Workspace
          </div>

          <div className="space-y-1">
            {navigation[role].map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    group
                    relative flex min-h-[46px] items-center gap-3
                    border px-3
                    text-sm font-medium
                    transition-all duration-150
                    ${
                      active
                        ? "border-[#F97316]/40 bg-[#F97316]/10 text-white"
                        : "border-transparent text-[#AEB4BB] hover:border-[#353A41] hover:bg-[#20252B] hover:text-white"
                    }
                  `}
                >
                  {active && (
                    <span
                      className="
                        absolute left-0 top-0 h-full w-[3px]
                        bg-[#F97316]
                      "
                    />
                  )}

                  <span
                    className={
                      active
                        ? "text-[#F97316]"
                        : "text-[#858C94] group-hover:text-[#F97316]"
                    }
                  >
                    <Icon
                      size={19}
                      strokeWidth={active ? 2.2 : 1.8}
                    />
                  </span>

                  <span className="truncate">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* ---------------------------------------------------------
            ACCOUNT + LOGOUT
        --------------------------------------------------------- */}
        <div className="shrink-0 border-t border-[#2A2E34] p-3">
          <Link
            href="/notifications"
            onClick={() => setMobileOpen(false)}
            className="
              mb-1 flex min-h-[44px] items-center gap-3
              border border-transparent
              px-3
              text-sm font-medium text-[#AEB4BB]
              transition
              hover:border-[#353A41]
              hover:bg-[#20252B]
              hover:text-white
            "
          >
            <Bell size={18} strokeWidth={1.8} />
            <span>Notifications</span>
          </Link>

          <div
            className="
              mb-1 flex min-h-[52px] items-center gap-3
              border border-[#2A2E34]
              bg-[#1D2228]
              px-3
            "
          >
            <div
              className="
                flex h-9 w-9 shrink-0 items-center justify-center
                bg-[#F97316]
                text-sm font-bold text-white
              "
            >
              {accountName.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {accountName}
              </p>

              <p className="truncate text-[10px] uppercase tracking-[0.12em] text-[#737A82]">
                {roleLabels[role]}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="
              flex min-h-[44px] w-full items-center gap-3
              border border-transparent
              px-3
              text-sm font-medium text-[#AEB4BB]
              transition
              hover:border-red-500/30
              hover:bg-red-500/10
              hover:text-red-400
            "
          >
            <LogOut size={18} strokeWidth={1.8} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* =========================================================
          DESKTOP TOPBAR
      ========================================================= */}
      <header
        className="
          fixed right-0 top-0 z-40
          hidden h-[76px]
          border-b border-[#E2DED5]
          bg-[#F7F4EE]/95
          backdrop-blur-md
          lg:left-72
          lg:flex
          items-center justify-between
          px-8
        "
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#737A82]">
            FORENCIS Workspace
          </p>

          <p className="mt-1 text-sm font-semibold text-[#171A1F]">
            {roleLabels[role]}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/notifications"
            aria-label="Notifications"
            className="
              flex h-10 w-10 items-center justify-center
              border border-[#D8D3C9]
              bg-white
              text-[#555C64]
              transition
              hover:border-[#F97316]
              hover:text-[#F97316]
            "
          >
            <Bell size={19} strokeWidth={1.8} />
          </Link>

          <div
            className="
              flex h-10 items-center gap-3
              border border-[#D8D3C9]
              bg-white
              px-3
            "
          >
            <div
              className="
                flex h-7 w-7 items-center justify-center
                bg-[#171A1F]
                text-xs font-bold text-white
              "
            >
              {accountName.charAt(0).toUpperCase()}
            </div>

            <span className="max-w-[180px] truncate text-sm font-semibold text-[#171A1F]">
              {accountName}
            </span>
          </div>
        </div>
      </header>
    </>
  );
}