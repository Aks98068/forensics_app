
"use client";

import type { ReactNode } from "react";
import {
  Activity,
  BriefcaseBusiness,
  ClipboardList,
  Database,
  FileText,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  UserCog,
  UserRound,
  Users,
} from "lucide-react";

import DashboardShell from "@/components/dashboard/dashboard-shell";

type Props = {
  children: ReactNode;
};

const navigation = [
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
];

export default function AdminLayout({ children }: Props) {
  return (
    <DashboardShell
      role="ADMIN"
      title="Administration"
      description="Manage users, oversee cases, and monitor security."
      navigation={navigation}
    >
      {children}
    </DashboardShell>
  );
}
