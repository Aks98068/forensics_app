
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  UserRound,
  Mail,
  ShieldCheck,
  BadgeCheck,
  CalendarDays,
  Clock3,
  Fingerprint,
  AtSign,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

type UserProfile = {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  role: string;
  status: string;
  email_verified: boolean;
  created_at: string;
  last_login_at: string | null;
};

type ProfileResponse = {
  user: UserProfile;
};

function formatDate(value: string | null | undefined): string {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getInitials(
  firstName: string,
  lastName: string,
  username: string
): string {
  const initials = (
    firstName.trim().charAt(0) + lastName.trim().charAt(0)
  ).toUpperCase();

  return initials || username.charAt(0).toUpperCase() || "U";
}

function InfoCard({
  label,
  value,
  icon: Icon,
  description,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  description?: string;
}) {
  return (
    <div className="group min-w-0 rounded-xl border border-[#E7E3DB] bg-white p-4 transition hover:border-[#F97316]/50 hover:shadow-sm sm:p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F7F4EE] text-[#F97316]">
          <Icon size={19} aria-hidden="true" />
        </div>

        <p className="text-sm font-medium text-gray-500">{label}</p>
      </div>

      <p className="mt-4 break-words text-base font-semibold text-[#171A1F]">
        {value}
      </p>

      {description && (
        <p className="mt-1 break-words text-xs text-gray-500">
          {description}
        </p>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error(
          "Access token not found. Please log in again."
        );
      }

      // Correct endpoint: GET /api/v1/protected/user/me
      const response = await fetch(
        `${API_BASE}/api/v1/protected/user/me`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Your session is invalid or expired. Please log in again."
          );
        }

        if (response.status === 403) {
          throw new Error(
            "You do not have permission to view this profile."
          );
        }

        if (response.status === 404) {
          throw new Error(
            "The profile API endpoint was not found. Check the deployed backend route."
          );
        }

        throw new Error(
          `Unable to load your profile (HTTP ${response.status}).`
        );
      }

      const data: ProfileResponse = await response.json();

      if (!data.user) {
        throw new Error(
          "The API response does not contain a user object."
        );
      }

      setUser(data.user);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  const fullName = user
    ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() ||
      user.username
    : "";

  const isActive = user?.status?.toUpperCase() === "ACTIVE";

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#F7F4EE] px-4">
        <div
          className="flex flex-col items-center gap-4 text-center"
          role="status"
          aria-live="polite"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#171A1F] text-[#F97316]">
            <RefreshCw size={25} className="animate-spin" />
          </div>

          <div>
            <p className="font-semibold text-[#171A1F]">
              Loading your profile
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Retrieving your account information...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error && !user) {
    return (
      <main className="min-h-[60vh] bg-[#F7F4EE] px-4 py-12 sm:px-8">
        <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-white p-6 text-center sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertCircle size={28} />
          </div>

          <h1 className="mt-4 text-xl font-bold text-[#171A1F]">
            Unable to load profile
          </h1>

          <p className="mt-2 break-words text-sm leading-6 text-gray-600">
            {error}
          </p>

          <button
            onClick={() => void fetchProfile()}
            className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#171A1F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2b3038] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] focus-visible:ring-offset-2"
          >
            <RefreshCw size={16} />
            Try again
          </button>
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-[#F7F4EE] px-4 py-6 text-[#171A1F] sm:px-6 sm:py-8 lg:px-10">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#0F766E]">
              <ShieldCheck size={16} />
              FORENSIQ / Account
            </div>

            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              My Profile
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-600 sm:text-base">
              View your identity, account information, and security status.
            </p>
          </div>

          <button
            onClick={() => void fetchProfile(true)}
            disabled={refreshing}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 self-start rounded-lg border border-[#DCD7CD] bg-white px-4 py-2.5 text-sm font-semibold transition hover:border-[#F97316] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:self-auto"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            {refreshing ? "Refreshing..." : "Refresh profile"}
          </button>
        </header>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-[#272C35] bg-[#171A1F] text-white shadow-sm">
          <div className="h-1.5 bg-gradient-to-r from-[#F97316] via-[#EA580C] to-[#0F766E]" />

          <div className="flex flex-col gap-6 p-5 sm:p-8 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-center gap-4 sm:gap-6">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-[#F97316] text-xl font-bold text-white sm:h-24 sm:w-24 sm:rounded-3xl sm:text-3xl">
                {getInitials(
                  user.first_name,
                  user.last_name,
                  user.username
                )}
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                  Authenticated user
                </p>

                <h2 className="mt-2 break-words text-xl font-bold sm:text-2xl lg:text-3xl">
                  {fullName}
                </h2>

                <p className="mt-1 break-all text-sm text-gray-400">
                  @{user.username}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F97316]/30 bg-[#F97316]/10 px-3 py-1 text-xs font-semibold text-orange-300">
                    <ShieldCheck size={14} />
                    {user.role}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                      isActive
                        ? "bg-emerald-400/10 text-emerald-300"
                        : "bg-red-400/10 text-red-300"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isActive ? "bg-emerald-400" : "bg-red-400"
                      }`}
                    />
                    {user.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.04] p-4 md:max-w-64">
              <div className="flex items-center gap-2 text-gray-400">
                <Fingerprint
                  size={18}
                  className="shrink-0 text-[#F97316]"
                />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Account identifier
                </span>
              </div>

              <p
                className="mt-2 break-all font-mono text-xs leading-5 text-gray-200"
                title={user.id}
              >
                {user.id}
              </p>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold sm:text-xl">
              Personal information
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Your profile details returned by the API.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <InfoCard
              label="First name"
              value={user.first_name || "Not provided"}
              icon={UserRound}
            />

            <InfoCard
              label="Last name"
              value={user.last_name || "Not provided"}
              icon={UserRound}
            />

            <InfoCard
              label="Username"
              value={user.username || "Not provided"}
              icon={AtSign}
            />

            <InfoCard
              label="Email address"
              value={user.email || "Not provided"}
              icon={Mail}
            />

            <InfoCard
              label="Account role"
              value={user.role || "Not assigned"}
              icon={ShieldCheck}
              description="Your assigned platform role"
            />

            <InfoCard
              label="Account status"
              value={user.status || "Unknown"}
              icon={BadgeCheck}
              description={
                isActive
                  ? "Your account is marked active"
                  : "Check your account status if access is restricted"
              }
            />
          </div>
        </section>

        <section className="rounded-2xl border border-[#E7E3DB] bg-white p-5 sm:p-7">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E6F3EF] text-[#0F766E]">
              <ShieldCheck size={23} />
            </div>

            <div>
              <h2 className="text-lg font-bold sm:text-xl">
                Security &amp; verification
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Review your account verification information.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col justify-between gap-4 rounded-xl border border-[#E7E3DB] p-4 sm:flex-row sm:items-center sm:p-5">
            <div className="flex items-start gap-3">
              {user.email_verified ? (
                <CheckCircle2
                  size={22}
                  className="mt-0.5 shrink-0 text-[#0F766E]"
                />
              ) : (
                <XCircle
                  size={22}
                  className="mt-0.5 shrink-0 text-orange-600"
                />
              )}

              <div>
                <p className="font-semibold">Email verification</p>
                <p className="mt-1 text-sm text-gray-500">
                  {user.email_verified
                    ? "Your email address is verified."
                    : "Your email address is not verified."}
                </p>
              </div>
            </div>

            <span
              className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                user.email_verified
                  ? "bg-[#E6F3EF] text-[#0F766E]"
                  : "bg-orange-50 text-orange-700"
              }`}
            >
              {user.email_verified ? "Verified" : "Not verified"}
            </span>
          </div>
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold sm:text-xl">
              Account activity
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Important dates associated with your account.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InfoCard
              label="Account created"
              value={formatDate(user.created_at)}
              icon={CalendarDays}
              description="Date and time your account was created"
            />

            <InfoCard
              label="Last login"
              value={
                user.last_login_at
                  ? formatDate(user.last_login_at)
                  : "Never logged in"
              }
              icon={Clock3}
              description="Most recent login recorded by the backend"
            />
          </div>
        </section>

        <div className="flex items-start gap-3 rounded-xl border border-[#E7E3DB] bg-white/70 p-4">
          <ShieldCheck
            size={19}
            className="mt-0.5 shrink-0 text-[#0F766E]"
          />
          <p className="text-xs leading-5 text-gray-500 sm:text-sm">
            Profile information is retrieved from the FORENSIQ backend.
            Account changes and security permissions should be validated
            by the server.
          </p>
        </div>
      </div>
    </main>
  );
}
