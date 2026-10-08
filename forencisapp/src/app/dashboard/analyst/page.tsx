"use client";

import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileSearch,
  FolderSearch,
  ShieldAlert,
  Users,
} from "lucide-react";

const stats = [
  {
    title: "Assigned Cases",
    value: "24",
    icon: FolderSearch,
  },
  {
    title: "Pending Analysis",
    value: "08",
    icon: Clock3,
  },
  {
    title: "High Priority",
    value: "04",
    icon: AlertTriangle,
  },
  {
    title: "Completed",
    value: "37",
    icon: CheckCircle2,
  },
];

const investigations = [
  {
    id: "CASE-2026-011",
    title: "Corporate Endpoint Investigation",
    priority: "High",
    status: "In Analysis",
    analyst: "Assigned",
  },
  {
    id: "CASE-2026-014",
    title: "Suspicious Network Traffic",
    priority: "Medium",
    status: "Evidence Review",
    analyst: "Assigned",
  },
  {
    id: "CASE-2026-019",
    title: "Deleted File Recovery",
    priority: "Low",
    status: "Pending",
    analyst: "Assigned",
  },
];

export default function AnalystDashboardPage() {
  return (
    <main className="min-h-screen bg-[#F7F4EE] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <section className="rounded-3xl border border-[#E2DED5] bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#0F766E]">
                <ShieldAlert className="h-4 w-4" />
                Analyst Workspace
              </div>

              <h1 className="text-2xl font-bold text-[#171A1F] sm:text-3xl">
                Investigation Dashboard
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#687076]">
                Review assigned cases, analyze digital evidence, track
                investigation progress, and maintain forensic integrity.
              </p>
            </div>

            <Link
              href="/dashboard/analyst/cases"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#171A1F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#272B31]"
            >
              <FolderSearch className="h-4 w-4" />
              Investigations
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
              </div>
            );
          })}
        </section>

        {/* Investigation overview */}
        <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-3xl border border-[#E2DED5] bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#171A1F]">
                  Active Investigations
                </h2>

                <p className="mt-1 text-sm text-[#687076]">
                  Cases currently requiring analyst attention.
                </p>
              </div>

              <Link
                href="/dashboard/analyst/cases"
                className="inline-flex items-center gap-1 text-sm font-semibold text-[#0F766E]"
              >
                All cases
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {investigations.map((item) => (
                <Link
                  key={item.id}
                  href={`/dashboard/analyst/cases/${item.id}`}
                  className="block rounded-2xl border border-[#ECE8E0] p-4 transition hover:border-[#0F766E]/30 hover:bg-[#FAF9F6]"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#171A1F]">
                        {item.title}
                      </p>

                      <p className="mt-1 text-xs text-[#8A9197]">
                        {item.id}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          item.priority === "High"
                            ? "bg-red-50 text-red-700"
                            : item.priority === "Medium"
                              ? "bg-orange-50 text-orange-700"
                              : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {item.priority}
                      </span>

                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {item.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Analyst tools */}
          <div className="rounded-3xl bg-[#171A1F] p-6 text-white shadow-sm">
            <p className="text-sm font-medium text-[#F97316]">
              Analyst Tools
            </p>

            <h2 className="mt-2 text-xl font-bold">
              Investigation Toolkit
            </h2>

            <div className="mt-6 space-y-3">
              <Link
                href="/dashboard/analyst/evidence"
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10"
              >
                <span className="flex items-center gap-3 text-sm font-medium">
                  <FileSearch className="h-4 w-4 text-[#F97316]" />
                  Evidence Review
                </span>

                <ArrowRight className="h-4 w-4 text-white/40" />
              </Link>

              <Link
                href="/dashboard/analyst/cases"
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10"
              >
                <span className="flex items-center gap-3 text-sm font-medium">
                  <FolderSearch className="h-4 w-4 text-[#F97316]" />
                  Case Analysis
                </span>

                <ArrowRight className="h-4 w-4 text-white/40" />
              </Link>

              <Link
                href="/dashboard/analyst/audit"
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10"
              >
                <span className="flex items-center gap-3 text-sm font-medium">
                  <Activity className="h-4 w-4 text-[#F97316]" />
                  Audit Activity
                </span>

                <ArrowRight className="h-4 w-4 text-white/40" />
              </Link>
            </div>
          </div>
        </section>

        {/* Analyst workload */}
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[#E2DED5] bg-white p-5">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-[#0F766E]" />
              <span className="text-sm font-semibold text-[#171A1F]">
                Assigned workload
              </span>
            </div>

            <p className="mt-3 text-2xl font-bold text-[#171A1F]">24</p>
            <p className="mt-1 text-xs text-[#687076]">
              Active investigations
            </p>
          </div>

          <div className="rounded-2xl border border-[#E2DED5] bg-white p-5">
            <div className="flex items-center gap-3">
              <FileSearch className="h-5 w-5 text-[#0F766E]" />
              <span className="text-sm font-semibold text-[#171A1F]">
                Evidence reviewed
              </span>
            </div>

            <p className="mt-3 text-2xl font-bold text-[#171A1F]">183</p>
            <p className="mt-1 text-xs text-[#687076]">
              Evidence items this month
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-800">
                Integrity status
              </span>
            </div>

            <p className="mt-3 text-2xl font-bold text-emerald-800">
              Healthy
            </p>

            <p className="mt-1 text-xs text-emerald-700">
              Evidence verification operational
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}