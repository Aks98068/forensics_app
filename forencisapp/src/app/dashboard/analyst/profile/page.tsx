
"use client";

import {
  useCallback,
  useEffect,
  useState,
  type ElementType,
} from "react";
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
  ArrowUpRight,
  Activity,
  LockKeyhole,
  Copy,
  Check,
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

  if (Number.isNaN(date.getTime())) return "Not available";

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
    firstName.trim().charAt(0) +
    lastName.trim().charAt(0)
  ).toUpperCase();

  return initials || username.charAt(0).toUpperCase() || "U";
}

function statusClass(status: string): string {
  switch (status.toUpperCase()) {
    case "ACTIVE":
    case "VERIFIED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400";

    case "PENDING":
    case "NOT VERIFIED":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400";

    case "SUSPENDED":
    case "DISABLED":
    case "INACTIVE":
      return "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400";

    default:
      return "border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)]";
  }
}

function InfoCard({
  label,
  value,
  icon: Icon,
  description,
}: {
  label: string;
  value: string;
  icon: ElementType;
  description?: string;
}) {
  return (
    <article className="group min-w-0 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors duration-200 hover:border-[var(--accent)]/40 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-light)] text-[var(--accent)]">
          <Icon size={17} aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-xs font-medium text-[var(--text-muted)]">
            {label}
          </p>

          <p className="mt-1.5 break-words text-sm font-semibold leading-5 text-[var(--text)]">
            {value}
          </p>
        </div>
      </div>

      {description && (
        <p className="mt-3 border-t border-[var(--border)] pt-3 text-xs leading-5 text-[var(--text-muted)]">
          {description}
        </p>
      )}
    </article>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
        {eyebrow}
      </p>

      <h2 className="mt-1 text-lg font-semibold tracking-tight text-[var(--text)]">
        {title}
      </h2>

      <p className="mt-1 text-sm leading-5 text-[var(--text-muted)]">
        {description}
      </p>
    </div>
  );
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

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
            "Profile API endpoint not found. Check the backend route."
          );
        }

        throw new Error(
          `Unable to load your profile (HTTP ${response.status}).`
        );
      }

      const result: ProfileResponse = await response.json();

      if (!result.user) {
        throw new Error(
          "The API response does not contain a user object."
        );
      }

      setUser(result.user);
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

  const copyIdentifier = useCallback(async () => {
    if (!user?.id) return;

    try {
      await navigator.clipboard.writeText(user.id);
      setCopied(true);

      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Unable to copy the account identifier.");
    }
  }, [user?.id]);

  const fullName = user
    ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() ||
      user.username
    : "";

  const isActive = user?.status?.toUpperCase() === "ACTIVE";

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--surface-muted)] px-4 py-8 sm:px-6 lg:px-7">
        <div className="mx-auto max-w-6xl">
          <div className="animate-pulse space-y-6">
            <div className="space-y-2">
              <div className="h-3 w-28 rounded bg-[var(--border)]" />
              <div className="h-8 w-56 rounded bg-[var(--border)]" />
              <div className="h-4 w-72 max-w-full rounded bg-[var(--border)]" />
            </div>

            <div className="h-48 rounded-xl border border-[var(--border)] bg-[var(--surface)]" />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-28 rounded-xl border border-[var(--border)] bg-[var(--surface)]"
                />
              ))}
            </div>
          </div>

          <p
            className="mt-6 flex items-center gap-2 text-sm text-[var(--text-muted)]"
            role="status"
            aria-live="polite"
          >
            <RefreshCw size={15} className="animate-spin" />
            Loading account information...
          </p>
        </div>
      </main>
    );
  }

  if (error && !user) {
    return (
      <main className="min-h-screen bg-[var(--surface-muted)] px-4 py-10 sm:px-6 lg:px-7">
        <div className="mx-auto max-w-lg rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
            <AlertCircle size={22} />
          </div>

          <h1 className="mt-4 text-xl font-semibold text-[var(--text)]">
            Unable to load profile
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
            {error}
          </p>

          <button
            type="button"
            onClick={() => void fetchProfile()}
            className="mt-6 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            <RefreshCw size={15} />
            Try again
          </button>
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-[var(--surface)] px-4 py-6 text-[var(--text)] sm:px-6 sm:py-8 lg:px-7">
      <div className="mx-auto w-full max-w-6xl space-y-7">

        {/* Page header */}
        <header className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
              <UserRound size={14} />
              <span>Account</span>
              <span>/</span>
              <span className="text-[var(--accent)]">My Profile</span>
            </div>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--text)] sm:text-3xl">
              My Profile
            </h1>

            <p className="mt-1.5 max-w-xl text-sm leading-6 text-[var(--text-muted)]">
              Manage your identity details and review your account security.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void fetchProfile(true)}
            disabled={refreshing}
            className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm font-medium text-[var(--text)] transition hover:border-[var(--accent)]/50 hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
          >
            <RefreshCw
              size={15}
              className={refreshing ? "animate-spin" : ""}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </header>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Identity panel */}
        <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex h-1 bg-[var(--accent)]" />

          <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center lg:p-7">
            <div className="flex min-w-0 items-start gap-4 sm:items-center sm:gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-light)] text-xl font-bold text-[var(--accent)] ring-1 ring-inset ring-[var(--accent)]/10 sm:h-[76px] sm:w-[76px] sm:text-2xl">
                {getInitials(
                  user.first_name,
                  user.last_name,
                  user.username
                )}
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  Account identity
                </p>

                <h2 className="mt-1.5 break-words text-xl font-bold tracking-tight text-[var(--text)] sm:text-2xl">
                  {fullName}
                </h2>

                <p className="mt-1 break-all text-sm text-[var(--text-muted)]">
                  @{user.username}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-medium text-[var(--text)]">
                    <ShieldCheck size={13} className="text-[var(--accent)]" />
                    {user.role}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium ${statusClass(user.status)}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isActive ? "bg-emerald-500" : "bg-current"
                      }`}
                    />
                    {user.status}
                  </span>

                  {user.email_verified && (
                    <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <BadgeCheck size={13} />
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Account identifier */}
            <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <Fingerprint size={17} className="shrink-0 text-[var(--accent)]" />
                  <span className="text-xs font-semibold text-[var(--text-muted)]">
                    Account identifier
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => void copyIdentifier()}
                  title="Copy account identifier"
                  aria-label="Copy account identifier"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] transition hover:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>

              <p className="mt-3 break-all font-mono text-xs leading-5 text-[var(--text)]">
                {user.id}
              </p>

              {copied && (
                <p className="mt-2 text-xs font-medium text-emerald-600">
                  Identifier copied
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Personal information */}
        <section>
          <SectionHeading
            eyebrow="Identity"
            title="Personal Information"
            description="Your registered account details."
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
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
              description="Registered email address"
            />

            <InfoCard
              label="Account role"
              value={user.role || "Not assigned"}
              icon={ShieldCheck}
              description="Your assigned platform permissions"
            />

            <InfoCard
              label="Account status"
              value={user.status || "Unknown"}
              icon={Activity}
              description={
                isActive
                  ? "Your account is marked active."
                  : "Contact your administrator if access is restricted."
              }
            />
          </div>
        </section>

        {/* Security and verification */}
        <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-4 sm:px-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-light)] text-[var(--accent)]">
              <LockKeyhole size={18} />
            </div>

            <div>
              <h2 className="text-base font-semibold text-[var(--text)]">
                Security &amp; Verification
              </h2>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                Review the verification status of your account.
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="flex flex-col gap-4 rounded-lg border border-[var(--border)] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    user.email_verified
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                      : "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                  }`}
                >
                  {user.email_verified ? (
                    <CheckCircle2 size={19} />
                  ) : (
                    <XCircle size={19} />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--text)]">
                    Email verification
                  </p>

                  <p className="mt-1 text-sm leading-5 text-[var(--text-muted)]">
                    {user.email_verified
                      ? "Your email address has been verified."
                      : "Your email address has not been verified."}
                  </p>
                </div>
              </div>

              <span
                className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold ${statusClass(
                  user.email_verified ? "VERIFIED" : "NOT VERIFIED"
                )}`}
              >
                {user.email_verified ? (
                  <CheckCircle2 size={13} />
                ) : (
                  <AlertCircle size={13} />
                )}
                {user.email_verified ? "Verified" : "Not verified"}
              </span>
            </div>
          </div>
        </section>

        {/* Account activity */}
        <section>
          <SectionHeading
            eyebrow="Account history"
            title="Account Activity"
            description="Important timestamps recorded by the backend."
          />

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <InfoCard
              label="Account created"
              value={formatDate(user.created_at)}
              icon={CalendarDays}
              description="When your account was registered"
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

        {/* Security note */}
        <footer className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-light)] text-[var(--accent)]">
            <ShieldCheck size={18} />
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-[var(--text)]">
              Your account security
            </h3>

            <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
              Profile details are retrieved from the FORENSIQ backend.
              Account permissions and security-sensitive changes must be
              validated by the server.
            </p>

            <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
              <ArrowUpRight size={13} />
              Account information is displayed using the current session.
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
