
"use client";

import type { ReactNode } from "react";
import {
  Activity,
  BriefcaseBusiness,
  Database,
  LayoutDashboard,
  Search,
  UserRound,
} from "lucide-react";

import DashboardShell from "@/components/dashboard/dashboard-shell";

type Props = {
  children: ReactNode;
};

const navigation = [
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
];

export default function InvestigatorLayout({ children }: Props) {
  return (
    <DashboardShell
      role="USER"
      title="Investigator"
      description="Manage cases, examine evidence, and review activity."
      navigation={navigation}
    >
      {children}
    </DashboardShell>
  );
}
