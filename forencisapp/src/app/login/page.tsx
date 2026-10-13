
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  AlertCircle,
  LoaderCircle,
  ArrowRight,
  Fingerprint,
} from "lucide-react";
import { login as authenticate } from "@/lib/auth";

const DASHBOARD_ROUTES: Record<string, string> = {
  ADMIN: "/dashboard/admin",
  ANALYST: "/dashboard/analyst",
  USER: "/dashboard/investigator",
  INVESTIGATOR: "/dashboard/investigator",
};

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) return;

    setError("");

    if (!identifier.trim() || !password) {
      setError("Enter your email or username and password.");
      return;
    }

    setLoading(true);

    try {
      // auth.ts stores the access token and refresh token.
      const data = await authenticate(
        identifier.trim(),
        password
      );

      const user = data.user;

      if (
        !user ||
        typeof user.role !== "string" ||
        !user.role.trim()
      ) {
        throw new Error(
          "Your account role was not returned by the server."
        );
      }

      const role = user.role.trim().toUpperCase();
      const dashboardRoute = DASHBOARD_ROUTES[role];

      if (!dashboardRoute) {
        throw new Error(
          "Your account has an unrecognized role. Please contact the administrator."
        );
      }

      // Honor a safe, same-origin relative return path if supplied.
      const params = new URLSearchParams(
        window.location.search
      );
      const returnTo = params.get("returnTo");

      if (
        returnTo &&
        returnTo.startsWith("/") &&
        !returnTo.startsWith("//") &&
        !returnTo.includes("\\")
      ) {
        window.location.replace(returnTo);
      } else {
        window.location.replace(dashboardRoute);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the authentication server."
      );

      setLoading(false);
    }
  }

  return (
    <main className="relative isolate min-h-screen overflow-x-clip bg-[#F7F4EE] px-4 pb-12 pt-28 sm:px-6 sm:pb-16 sm:pt-32 lg:px-8 lg:pb-20 lg:pt-36">
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -left-32 top-40 h-72 w-72 rounded-full bg-orange-200/30 blur-3xl sm:h-96 sm:w-96" />
        <div className="absolute -right-32 bottom-16 h-72 w-72 rounded-full bg-teal-200/30 blur-3xl sm:h-96 sm:w-96" />

        <div
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "radial-gradient(#777 0.7px, transparent 0.7px)",
            backgroundSize: "22px 22px",
          }}
        />
      </div>

      {/* Page heading */}
      <div className="mx-auto mb-7 max-w-5xl text-center sm:mb-9">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E7E3DB] bg-white/80 px-4 py-2 text-xs font-bold tracking-[0.12em] text-[#0F766E] shadow-sm">
          <ShieldCheck size={15} />
          SECURE FORENSIQ ACCESS
        </div>

        <h1 className="text-3xl font-black tracking-tight text-[#171A1F] sm:text-4xl lg:text-5xl">
          Welcome back
          <span className="text-[#F97316]">.</span>
        </h1>

        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-600 sm:text-base sm:leading-7">
          Sign in to access your FORENSIQ digital forensics
          workspace, investigations, and evidence management tools.
        </p>
      </div>

      {/* Login card */}
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-2xl border border-[#E7E3DB] bg-white shadow-xl shadow-[#171A1F]/10 sm:rounded-3xl lg:grid-cols-[0.9fr_1.1fr]">
        {/* Branding panel */}
        <section className="relative hidden overflow-hidden bg-[#171A1F] p-8 text-white sm:p-10 lg:flex lg:flex-col lg:justify-between xl:p-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-20 h-80 w-80 rounded-full border border-[#F97316]/20"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-6 h-52 w-52 rounded-full border border-[#F97316]/20"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-[#0F766E]/20 blur-3xl"
          />

          <Link
            href="/"
            className="relative z-10 inline-flex w-fit items-center gap-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F97316]">
              <Fingerprint size={27} />
            </div>

            <div>
              <p className="text-lg font-extrabold tracking-wide">
                FORENSIQ
              </p>
              <p className="text-xs text-gray-400">
                Digital Forensics Platform
              </p>
            </div>
          </Link>

          <div className="relative z-10 my-12">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#F97316]/30 bg-[#F97316]/10 px-3 py-2 text-xs font-semibold text-orange-300">
              <LockKeyhole size={14} />
              SECURE INVESTIGATION PORTAL
            </p>

            <h2 className="max-w-md text-3xl font-extrabold leading-tight xl:text-4xl">
              Investigate with confidence.
              <span className="mt-1 block text-[#F97316]">
                Protect every detail.
              </span>
            </h2>

            <p className="mt-5 max-w-md text-sm leading-7 text-gray-400">
              A dedicated workspace for managing digital forensic
              cases, organizing evidence, and documenting
              investigations.
            </p>

            <div className="mt-8 space-y-4">
              {[
                "Digital forensic case management",
                "Evidence and investigation records",
                "Secure, role-based workspace access",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3"
                >
                  <ShieldCheck
                    size={18}
                    className="shrink-0 text-[#F97316]"
                  />
                  <span className="text-sm text-gray-300">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="relative z-10 text-xs text-gray-500">
            FORENSIQ · Digital Forensics &amp; Investigation
          </p>
        </section>

        {/* Form panel */}
        <section className="flex min-w-0 items-center justify-center p-5 sm:p-8 md:p-10 lg:p-10 xl:p-14">
          <div className="w-full max-w-md">
            <Link
              href="/"
              className="mb-8 inline-flex items-center gap-2 lg:hidden"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF0E3] text-[#EA580C]">
                <Fingerprint size={22} />
              </span>
              <span className="font-extrabold tracking-wide text-[#171A1F]">
                FORENSIQ
              </span>
            </Link>

            <div className="mb-7">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF0E3] text-[#EA580C]">
                <ShieldCheck size={25} />
              </div>

              <h2 className="text-2xl font-extrabold tracking-tight text-[#171A1F] sm:text-3xl">
                Sign in to your account
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Use your registered email address or username.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
              >
                <AlertCircle
                  size={19}
                  className="mt-0.5 shrink-0"
                />
                <p>{error}</p>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="identifier"
                  className="mb-2 block text-sm font-semibold text-[#171A1F]"
                >
                  Email or username
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="identifier"
                    name="identifier"
                    type="text"
                    autoComplete="username"
                    value={identifier}
                    onChange={(event) =>
                      setIdentifier(event.target.value)
                    }
                    placeholder="Enter your email or username"
                    required
                    disabled={loading}
                    className="min-h-12 w-full rounded-xl border border-[#DCD7CD] bg-[#FCFBF8] py-3 pl-11 pr-4 text-sm text-[#171A1F] outline-none transition placeholder:text-gray-400 focus:border-[#F97316] focus:ring-4 focus:ring-[#F97316]/10 disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-[#171A1F]"
                  >
                    Password
                  </label>

                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-[#0F766E] transition hover:text-[#F97316] sm:text-sm"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                    className="min-h-12 w-full rounded-xl border border-[#DCD7CD] bg-[#FCFBF8] py-3 pl-11 pr-12 text-sm text-[#171A1F] outline-none transition placeholder:text-gray-400 focus:border-[#F97316] focus:ring-4 focus:ring-[#F97316]/10 disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((value) => !value)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    aria-pressed={showPassword}
                    className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition hover:bg-orange-50 hover:text-[#EA580C] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#171A1F] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-black/10 transition hover:bg-[#2B3038] focus:outline-none focus:ring-4 focus:ring-[#F97316]/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <LoaderCircle
                      size={18}
                      className="animate-spin"
                    />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in securely
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#E7E3DB]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Secure access
              </span>
              <div className="h-px flex-1 bg-[#E7E3DB]" />
            </div>

            <p className="text-center text-xs leading-6 text-gray-500">
              Your credentials are verified by the FORENSIQ
              authentication server.
            </p>

            <p className="mt-5 text-center text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-bold text-[#0F766E] transition hover:text-[#F97316]"
              >
                Create account
              </Link>
            </p>
          </div>
        </section>
      </div>

      <p className="mx-auto mt-7 max-w-2xl text-center text-xs leading-5 text-gray-500 sm:mt-9">
        Authorized users only. Access to investigation data is
        subject to your account permissions.
      </p>
    </main>
  );
}
