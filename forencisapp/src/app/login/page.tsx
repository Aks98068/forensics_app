
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Fingerprint,
  LockKeyhole,
  ShieldCheck,
  Eye,
  EyeOff,
  FileCheck2,
} from "lucide-react";

type LoginForm = {
  identifier: string;
  password: string;
};

type LoginErrors = Partial<Record<keyof LoginForm, string>>;

type LoginResponse = {
  message?: string;
  error?: string;
  role?: string;
  user?: {
    role?: string;
  };
};

const initialForm: LoginForm = {
  identifier: "",
  password: "",
};

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState<LoginForm>(initialForm);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const updateField = (
    field: keyof LoginForm,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: "",
    }));

    if (serverError) {
      setServerError("");
    }
  };

  const validate = (): boolean => {
    const nextErrors: LoginErrors = {};

    const identifier = form.identifier.trim();

    if (!identifier) {
      nextErrors.identifier =
        "Email address or username is required.";
    } else if (identifier.length < 3) {
      nextErrors.identifier =
        "Enter a valid email address or username.";
    }

    if (!form.password) {
      nextErrors.password = "Password is required.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const getDashboardPath = (role: string | undefined) => {
    switch (role?.toUpperCase()) {
      case "ADMIN":
        return "/dashboard/admin";

      case "ANALYST":
        return "/dashboard/analyst";

      case "USER":
        return "/dashboard/user";

      default:
        return null;
    }
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setServerError("");

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          identifier: form.identifier.trim(),
          password: form.password,
        }),
      });

      let data: LoginResponse = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        if (response.status === 401) {
          setServerError(
            data.message ||
              data.error ||
              "Invalid email/username or password.",
          );
          return;
        }

        if (response.status === 400) {
          setServerError(
            data.message ||
              data.error ||
              "Please check your login details and try again.",
          );
          return;
        }

        setServerError(
          data.message ||
            data.error ||
            "Unable to sign in. Please try again.",
        );

        return;
      }

      /*
       * =========================================================
       * ROLE-BASED DASHBOARD REDIRECT
       * =========================================================
       *
       * Supports either of these backend responses:
       *
       * {
       *   "role": "ADMIN"
       * }
       *
       * OR:
       *
       * {
       *   "user": {
       *     "role": "ADMIN"
       *   }
       * }
       *
       */

      const role = data.role || data.user?.role;

      const dashboardPath = getDashboardPath(role);

      if (!dashboardPath) {
        setServerError(
          "Your account role could not be identified. Please contact an administrator.",
        );
        return;
      }

      /*
       * Refresh the application so the authenticated session/cookie
       * is available to the dashboard layouts and server components.
       */
      router.push(dashboardPath);
      router.refresh();
    } catch {
      setServerError(
        "Unable to connect to the server. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (field: keyof LoginForm) =>
    `h-12 w-full rounded-xl border bg-white px-4 text-sm text-[#171A1F] outline-none transition placeholder:text-[#9A9A96] ${
      errors[field]
        ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
        : "border-[#deded8] focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/10"
    }`;

  return (
    <main className="overflow-hidden bg-[#f5f5f2]">
      <section className="relative px-4 pb-14 pt-10 sm:px-6 sm:pb-18 sm:pt-14 lg:px-8 lg:pb-24 lg:pt-20">
        <div className="mx-auto w-full max-w-[1500px]">
          <div className="overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-[0_20px_70px_rgba(0,0,0,0.08)] lg:grid lg:grid-cols-[0.78fr_1.22fr]">

            {/* =====================================================
                LEFT SIDE
            ====================================================== */}

            <div className="relative overflow-hidden bg-[#171A1F] px-7 py-10 text-white sm:px-10 sm:py-12 lg:px-14 lg:py-16">

              <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10" />
              <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full border border-white/10" />
              <div className="absolute -bottom-32 -left-32 h-72 w-72 rounded-full border border-[#F97316]/10" />

              <div className="relative flex h-full flex-col">

                {/* Brand */}

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F97316]">
                    <Fingerprint
                      size={21}
                      className="text-white"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-black tracking-[0.18em] text-white">
                      FORENCIS
                    </p>

                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                      Digital Evidence
                    </p>
                  </div>
                </div>

                {/* Main heading */}

                <div className="mt-14 max-w-xl lg:mt-24">
                  <div className="mb-5 flex items-center gap-3">
                    <span className="h-px w-10 bg-[#F97316]" />

                    <span className="text-xs font-bold uppercase tracking-[0.24em] text-white/45">
                      Secure Access
                    </span>
                  </div>

                  <h1 className="text-4xl font-black leading-[0.95] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                    Investigate.

                    <span className="block text-white/35">
                      Preserve.
                    </span>

                    <span className="block text-[#F97316]">
                      Prove.
                    </span>
                  </h1>

                  <p className="mt-7 max-w-lg text-sm leading-7 text-white/55 sm:text-base">
                    Access your digital forensics workspace to manage
                    evidence, investigation records, verification and
                    chain-of-custody activity from one place.
                  </p>
                </div>

                {/* Features */}

                <div className="mt-12 space-y-4 lg:mt-auto lg:pt-24">

                  <div className="flex items-center gap-4 border-t border-white/10 pt-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5">
                      <FileCheck2
                        size={18}
                        className="text-[#F97316]"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-white">
                        Evidence integrity
                      </p>

                      <p className="mt-1 text-xs text-white/40">
                        Keep evidence records protected and traceable.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 border-t border-white/10 pt-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5">
                      <ShieldCheck
                        size={18}
                        className="text-[#F97316]"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-white">
                        Investigation workflow
                      </p>

                      <p className="mt-1 text-xs text-white/40">
                        Organize investigations and findings in one place.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 border-t border-white/10 pt-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5">
                      <LockKeyhole
                        size={18}
                        className="text-[#F97316]"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-white">
                        Controlled access
                      </p>

                      <p className="mt-1 text-xs text-white/40">
                        Access your workspace through secure authentication.
                      </p>
                    </div>
                  </div>

                </div>

                {/* Workspace preview */}

                <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.035] p-5 lg:mt-16">

                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/35">
                        Investigation Workspace
                      </p>

                      <p className="mt-1 text-xs font-semibold text-white/75">
                        Secure Access
                      </p>
                    </div>

                    <span className="rounded-full border border-[#0F766E]/30 bg-[#0F766E]/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#5EEAD4]">
                      Protected
                    </span>
                  </div>

                  <div className="space-y-2">

                    <div className="flex items-center justify-between rounded-lg bg-white/[0.035] px-3 py-2.5">
                      <span className="text-[10px] text-white/50">
                        Authentication
                      </span>

                      <span className="text-[10px] font-semibold text-[#5EEAD4]">
                        Secure
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-white/[0.035] px-3 py-2.5">
                      <span className="text-[10px] text-white/50">
                        Evidence Access
                      </span>

                      <span className="text-[10px] font-semibold text-[#5EEAD4]">
                        Controlled
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-white/[0.035] px-3 py-2.5">
                      <span className="text-[10px] text-white/50">
                        Workspace
                      </span>

                      <span className="text-[10px] font-semibold text-[#F97316]">
                        Ready
                      </span>
                    </div>

                  </div>
                </div>

              </div>
            </div>

            {/* =====================================================
                RIGHT SIDE
            ====================================================== */}

            <div className="px-6 py-9 sm:px-10 sm:py-12 lg:px-14 lg:py-16">
              <div className="mx-auto w-full max-w-xl">

                {/* Header */}

                <div className="mb-8">

                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#F97316]">
                    Secure Login
                  </p>

                  <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] text-[#171A1F] sm:text-4xl">
                    Welcome back.
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-[#6B6B66]">
                    Sign in to access your digital forensics workspace.
                  </p>

                </div>

                {/* Server error */}

                {serverError && (
                  <div
                    role="alert"
                    className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                  >
                    {serverError}
                  </div>
                )}

                {/* Login form */}

                <form
                  onSubmit={handleSubmit}
                  noValidate
                >
                  <div className="space-y-7">

                    {/* Account details */}

                    <div>
                      <div className="mb-4 flex items-center gap-3">
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#8A8A84]">
                          Account details
                        </span>

                        <span className="h-px flex-1 bg-[#e7e7e1]" />
                      </div>

                      <div className="space-y-5">

                        {/* Email or Username */}

                        <div>
                          <label
                            htmlFor="identifier"
                            className="mb-2 block text-xs font-bold text-[#343431]"
                          >
                            Email or username
                          </label>

                          <input
                            id="identifier"
                            name="identifier"
                            type="text"
                            autoComplete="username"
                            maxLength={255}
                            value={form.identifier}
                            onChange={(event) =>
                              updateField(
                                "identifier",
                                event.target.value,
                              )
                            }
                            className={inputClass("identifier")}
                            placeholder="Enter your email or username"
                            disabled={isSubmitting}
                          />

                          {errors.identifier && (
                            <p className="mt-1.5 text-xs text-red-600">
                              {errors.identifier}
                            </p>
                          )}
                        </div>

                        {/* Password */}

                        <div>
                          <div className="mb-2 flex items-center justify-between">

                            <label
                              htmlFor="password"
                              className="block text-xs font-bold text-[#343431]"
                            >
                              Password
                            </label>

                            <Link
                              href="/forgot-password"
                              className="text-xs font-semibold text-[#F97316] transition hover:text-[#ea650b]"
                            >
                              Forgot password?
                            </Link>

                          </div>

                          <div className="relative">

                            <input
                              id="password"
                              name="password"
                              type={
                                showPassword
                                  ? "text"
                                  : "password"
                              }
                              autoComplete="current-password"
                              maxLength={128}
                              value={form.password}
                              onChange={(event) =>
                                updateField(
                                  "password",
                                  event.target.value,
                                )
                              }
                              className={`${inputClass(
                                "password",
                              )} pr-12`}
                              placeholder="Enter your password"
                              disabled={isSubmitting}
                            />

                            <button
                              type="button"
                              aria-label={
                                showPassword
                                  ? "Hide password"
                                  : "Show password"
                              }
                              onClick={() =>
                                setShowPassword(
                                  (current) => !current,
                                )
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[#777771] transition hover:bg-[#f2f2ed] hover:text-[#171A1F]"
                            >
                              {showPassword ? (
                                <EyeOff size={17} />
                              ) : (
                                <Eye size={17} />
                              )}
                            </button>

                          </div>

                          {errors.password && (
                            <p className="mt-1.5 text-xs text-red-600">
                              {errors.password}
                            </p>
                          )}
                        </div>

                      </div>
                    </div>

                    {/* Security notice */}

                    <div className="rounded-xl border border-[#e7e7e1] bg-[#fafaf7] p-4">
                      <div className="flex items-start gap-3">

                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0F766E]/10">
                          <LockKeyhole
                            size={15}
                            className="text-[#0F766E]"
                          />
                        </div>

                        <div>
                          <p className="text-xs font-bold text-[#171A1F]">
                            Protected access
                          </p>

                          <p className="mt-1 text-[11px] leading-5 text-[#777771]">
                            Your investigator session is protected using
                            secure authentication controls.
                          </p>
                        </div>

                      </div>
                    </div>

                    {/* Submit */}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group flex min-h-[52px] w-full items-center justify-center rounded-full bg-[#F97316] px-7 text-sm font-bold text-white transition duration-300 hover:bg-[#ea650b] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          Sign in to workspace

                          <ArrowRight
                            size={18}
                            className="ml-2 transition-transform duration-300 group-hover:translate-x-1"
                          />
                        </>
                      )}
                    </button>

                  </div>
                </form>

                {/* Register */}

                <div className="mt-8 border-t border-[#e7e7e1] pt-6 text-center">
                  <p className="text-sm text-[#777771]">
                    Don&apos;t have an investigator account?{" "}

                    <Link
                      href="/register"
                      className="font-bold text-[#171A1F] transition hover:text-[#F97316]"
                    >
                      Create account
                    </Link>
                  </p>
                </div>

                {/* Mobile branding */}

                <div className="mt-8 text-center lg:hidden">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#AAA79F]">
                    FORENCIS
                  </p>

                  <p className="mt-1 text-xs text-[#777771]">
                    Digital Forensics Platform
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}

