"use client";

import Link from "next/link";
import {
  FileSearch,
  FolderOpen,
  ShieldCheck,
  Clock3,
  ArrowRight,
  Upload,
  Activity,
  CheckCircle2,
} from "lucide-react";

const stats = [
  {
    title: "My Cases",
    value: "12",
    description: "Total forensic cases",
    icon: FolderOpen,
  },
  {
    title: "Evidence Files",
    value: "48",
    description: "Files submitted",
    icon: FileSearch,
  },
  {
    title: "Verified Evidence",
    value: "39",
    description: "Integrity verified",
    icon: ShieldCheck,
  },
  {
    title: "Pending",
    value: "09",
    description: "Awaiting analysis",
    icon: Clock3,
  },
];

const recentCases = [
  {
    id: "CASE-2026-001",
    title: "Suspicious Network Activity",
    status: "Under Analysis",
    date: "08 Oct 2026",
  },
  {
    id: "CASE-2026-002",
    title: "Endpoint Investigation",
    status: "Evidence Submitted",
    date: "06 Oct 2026",
  },
  {
    id: "CASE-2026-003",
    title: "Email Forensics",
    status: "Completed",
    date: "02 Oct 2026",
  },
];

export default function UserDashboardPage() {
  return (
    <main className="min-h-screen bg-[#F7F4EE] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <section className="rounded-3xl border border-[#E2DED5] bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#0F766E]">
                <Activity className="h-4 w-4" />
                User Workspace
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-[#171A1F] sm:text-3xl">
                Welcome back
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#687076]">
                Manage your forensic cases, submit digital evidence, and
                monitor evidence integrity from your workspace.
              </p>
            </div>

            <Link
              href="/dashboard/user/cases/new"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F97316] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#EA580C]"
            >
              <Upload className="h-4 w-4" />
              New Case
            </Link>
          </div>
        </section>

        {/* Stats */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-2xl border border-[#E2DED5] bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#687076]">
                      {stat.title}
                    </p>

                    <p className="mt-2 text-3xl font-bold text-[#171A1F]">
                      {stat.value}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#F7F4EE] p-3">
                    <Icon className="h-5 w-5 text-[#0F766E]" />
                  </div>
                </div>

                <p className="mt-3 text-xs text-[#8A9197]">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </section>

        {/* Main content */}
        <section className="grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* Recent cases */}
          <div className="rounded-3xl border border-[#E2DED5] bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#171A1F]">
                  Recent Cases
                </h2>

                <p className="mt-1 text-sm text-[#687076]">
                  Your latest forensic investigations.
                </p>
              </div>

              <Link
                href="/dashboard/user/cases"
                className="inline-flex items-center gap-1 text-sm font-semibold text-[#0F766E] hover:text-[#115E59]"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentCases.map((item) => (
                <Link
                  key={item.id}
                  href={`/dashboard/user/cases/${item.id}`}
                  className="block rounded-2xl border border-[#ECE8E0] p-4 transition hover:border-[#0F766E]/30 hover:bg-[#FAF9F6]"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#171A1F]">
                        {item.title}
                      </p>

                      <p className="mt-1 text-xs text-[#8A9197]">
                        {item.id} · {item.date}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                        item.status === "Completed"
                          ? "bg-emerald-50 text-emerald-700"
                          : item.status === "Under Analysis"
                            ? "bg-orange-50 text-orange-700"
                            : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="rounded-3xl border border-[#E2DED5] bg-[#171A1F] p-6 text-white shadow-sm">
            <p className="text-sm font-medium text-[#F97316]">
              Quick Actions
            </p>

            <h2 className="mt-2 text-xl font-bold">
              Forensic Workspace
            </h2>

            <p className="mt-2 text-sm leading-6 text-white/60">
              Quickly access the tools you use most often.
            </p>

            <div className="mt-6 space-y-3">
              <Link
                href="/dashboard/user/cases/new"
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
              >
                <span className="flex items-center gap-3 text-sm font-medium">
                  <Upload className="h-4 w-4 text-[#F97316]" />
                  Submit Evidence
                </span>

                <ArrowRight className="h-4 w-4 text-white/40" />
              </Link>

              <Link
                href="/dashboard/user/evidence"
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
              >
                <span className="flex items-center gap-3 text-sm font-medium">
                  <FileSearch className="h-4 w-4 text-[#F97316]" />
                  Evidence Files
                </span>

                <ArrowRight className="h-4 w-4 text-white/40" />
              </Link>

              <Link
                href="/dashboard/user/verification"
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
              >
                <span className="flex items-center gap-3 text-sm font-medium">
                  <ShieldCheck className="h-4 w-4 text-[#F97316]" />
                  Verify Integrity
                </span>

                <ArrowRight className="h-4 w-4 text-white/40" />
              </Link>
            </div>
          </div>
        </section>

        {/* System status */}
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />

            <div>
              <p className="text-sm font-semibold text-emerald-800">
                Evidence integrity service operational
              </p>

              <p className="text-xs text-emerald-700">
                Your evidence verification services are currently available.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}