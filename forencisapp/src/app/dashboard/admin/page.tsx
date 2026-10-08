"use client";

import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileSearch,
  FolderSearch,
  Server,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

const stats = [
  {
    title: "Total Users",
    value: "284",
    icon: Users,
  },
  {
    title: "Active Analysts",
    value: "18",
    icon: ShieldCheck,
  },
  {
    title: "Total Cases",
    value: "426",
    icon: FolderSearch,
  },
  {
    title: "Evidence Items",
    value: "2,891",
    icon: FileSearch,
  },
];

const systemActivity = [
  {
    action: "New analyst account created",
    actor: "Administrator",
    time: "12 minutes ago",
    type: "User Management",
  },
  {
    action: "Case assigned to analyst",
    actor: "System",
    time: "28 minutes ago",
    type: "Case Management",
  },
  {
    action: "Evidence integrity verified",
    actor: "Analyst",
    time: "41 minutes ago",
    type: "Evidence",
  },
  {
    action: "Security configuration updated",
    actor: "Administrator",
    time: "1 hour ago",
    type: "Security",
  },
];

export default function AdminDashboardPage() {
  return (
    <main className="min-h-screen bg-[#F7F4EE] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <section className="rounded-3xl bg-[#171A1F] p-6 text-white shadow-sm sm:p-7">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#F97316]">
                <ShieldCheck className="h-4 w-4" />
                Administration
              </div>

              <h1 className="text-2xl font-bold sm:text-3xl">
                System Overview
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
                Monitor users, investigations, evidence, security activity,
                and overall FORENSIQ platform health.
              </p>
            </div>

            <Link
              href="/dashboard/admin/users"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F97316] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#EA580C]"
            >
              <Users className="h-4 w-4" />
              Manage Users
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

        {/* Main */}
        <section className="grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* Activity */}
          <div className="rounded-3xl border border-[#E2DED5] bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#171A1F]">
                  System Activity
                </h2>

                <p className="mt-1 text-sm text-[#687076]">
                  Recent platform and administrative events.
                </p>
              </div>

              <Link
                href="/dashboard/admin/audit"
                className="inline-flex items-center gap-1 text-sm font-semibold text-[#0F766E]"
              >
                Audit Log
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {systemActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex gap-4 rounded-2xl border border-[#ECE8E0] p-4"
                >
                  <div className="mt-0.5 rounded-xl bg-[#F7F4EE] p-2.5">
                    <Activity className="h-4 w-4 text-[#0F766E]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#171A1F]">
                      {activity.action}
                    </p>

                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#8A9197]">
                      <span>{activity.actor}</span>
                      <span>{activity.type}</span>
                      <span>{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Admin tools */}
          <div className="rounded-3xl border border-[#E2DED5] bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-[#0F766E]">
              Administration
            </p>

            <h2 className="mt-2 text-xl font-bold text-[#171A1F]">
              Management Tools
            </h2>

            <div className="mt-6 space-y-3">
              <Link
                href="/dashboard/admin/users"
                className="flex items-center justify-between rounded-xl border border-[#E2DED5] p-4 transition hover:bg-[#FAF9F6]"
              >
                <span className="flex items-center gap-3 text-sm font-semibold text-[#171A1F]">
                  <Users className="h-4 w-4 text-[#0F766E]" />
                  User Management
                </span>

                <ArrowRight className="h-4 w-4 text-[#8A9197]" />
              </Link>

              <Link
                href="/dashboard/admin/cases"
                className="flex items-center justify-between rounded-xl border border-[#E2DED5] p-4 transition hover:bg-[#FAF9F6]"
              >
                <span className="flex items-center gap-3 text-sm font-semibold text-[#171A1F]">
                  <FolderSearch className="h-4 w-4 text-[#0F766E]" />
                  Case Management
                </span>

                <ArrowRight className="h-4 w-4 text-[#8A9197]" />
              </Link>

              <Link
                href="/dashboard/admin/security"
                className="flex items-center justify-between rounded-xl border border-[#E2DED5] p-4 transition hover:bg-[#FAF9F6]"
              >
                <span className="flex items-center gap-3 text-sm font-semibold text-[#171A1F]">
                  <ShieldCheck className="h-4 w-4 text-[#0F766E]" />
                  Security
                </span>

                <ArrowRight className="h-4 w-4 text-[#8A9197]" />
              </Link>

              <Link
                href="/dashboard/admin/settings"
                className="flex items-center justify-between rounded-xl border border-[#E2DED5] p-4 transition hover:bg-[#FAF9F6]"
              >
                <span className="flex items-center gap-3 text-sm font-semibold text-[#171A1F]">
                  <Settings className="h-4 w-4 text-[#0F766E]" />
                  System Settings
                </span>

                <ArrowRight className="h-4 w-4 text-[#8A9197]" />
              </Link>
            </div>
          </div>
        </section>

        {/* Platform health */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-[#171A1F]">
              Platform Health
            </h2>

            <p className="mt-1 text-sm text-[#687076]">
              Current status of core FORENSIQ services.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />

                <span className="text-sm font-semibold text-emerald-800">
                  Database
                </span>
              </div>

              <p className="mt-3 text-xl font-bold text-emerald-800">
                Operational
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex items-center gap-3">
                <Server className="h-5 w-5 text-emerald-600" />

                <span className="text-sm font-semibold text-emerald-800">
                  API Services
                </span>
              </div>

              <p className="mt-3 text-xl font-bold text-emerald-800">
                Operational
              </p>
            </div>

            <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600" />

                <span className="text-sm font-semibold text-orange-800">
                  Security Alerts
                </span>
              </div>

              <p className="mt-3 text-xl font-bold text-orange-800">
                2 Alerts
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}