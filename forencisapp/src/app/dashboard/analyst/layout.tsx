
"use client";

import type { ReactNode } from "react";
import {
  Activity,
  Database,
  FileSearch,
  FileText,
  FolderKanban,
  LayoutDashboard,
  UserRound,
} from "lucide-react";

import DashboardShell from "@/components/dashboard/dashboard-shell";

type Props = {
  children: ReactNode;
};

const navigation = [
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
];

export default function AnalystLayout({ children }: Props) {
  return (
    <DashboardShell
      role="ANALYST"
      title="Forensic Analyst"
      description="Review evidence, document findings, and prepare reports."
      navigation={navigation}
    >
      {children}
    </DashboardShell>
  );
}
