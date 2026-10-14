
"use client";

import type { ComponentProps, ReactNode } from "react";
import DashboardSidebar from "@/components/dashboard-sidebar";

type Role = "USER" | "ANALYST" | "ADMIN";

type SidebarNavItem = NonNullable<
  ComponentProps<typeof DashboardSidebar>["navigationOverride"]
>[number];

type DashboardShellProps = {
  children: ReactNode;
  role: Role;
  title: string;
  description: string;
  navigation: SidebarNavItem[];
};

export default function DashboardShell({
  children,
  role,
  title,
  description,
  navigation,
}: DashboardShellProps) {
  const sidebarRole =
    role === "USER"
      ? "investigator"
      : role === "ANALYST"
        ? "analyst"
        : "admin";

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#171A1F] transition-colors duration-200 dark:bg-[#111418] dark:text-[#F3F4F6]">
      <DashboardSidebar
        role={sidebarRole}
        title={title}
        description={description}
        navigationOverride={navigation}
      />

      <div className="min-h-screen pt-16 lg:ml-72 lg:pt-[72px]">
        <main className="min-h-[calc(100vh-4rem)] p-4 bg-[var(--surface)] duration-200 sm:p-6 lg:min-h-[calc(100vh-72px)] lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
