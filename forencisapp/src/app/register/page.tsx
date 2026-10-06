
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  FileCheck2,
  Fingerprint,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

type FormData = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const initialForm: FormData = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const updateField = (field: keyof FormData, value: string) => {
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
    const nextErrors: FormErrors = {};

    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const username = form.username.trim();
    const email = form.email.trim();

    if (!firstName) {
      nextErrors.firstName = "First name is required.";
    } else if (firstName.length < 2) {
      nextErrors.firstName = "Enter a valid first name.";
    }

    if (!lastName) {
      nextErrors.lastName = "Last name is required.";
    } else if (lastName.length < 2) {
      nextErrors.lastName = "Enter a valid last name.";
    }

    if (!username) {
      nextErrors.username = "Username is required.";
    } else if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
      nextErrors.username =
        "Use 3–30 characters with letters, numbers, or underscores.";
    }

    if (!email) {
      nextErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!form.password) {
      nextErrors.password = "Password is required.";
    } else if (form.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password.";
    } else if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const passwordScore = (() => {
    const password = form.password;

    if (!password) return 0;

    let score = 0;

    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    return score;
  })();

  const passwordLabel =
    passwordScore <= 1
      ? "Weak"
      : passwordScore === 2
        ? "Fair"
        : passwordScore === 3
          ? "Good"
          : "Strong";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setServerError("");

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          username: form.username.trim(),
          password: form.password,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
        }),
      });

      let data: {
        message?: string;
        error?: string;
      } = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        if (response.status === 409) {
          setServerError(
            data.message ||
              data.error ||
              "An account with these details already exists.",
          );
          return;
        }

        if (response.status === 400) {
          setServerError(
            data.message ||
              data.error ||
              "Please check your details and try again.",
          );
          return;
        }

        setServerError(
          data.message ||
            data.error ||
            "Something went wrong. Please try again.",
        );

        return;
      }

      router.push(
        `/verify-email?email=${encodeURIComponent(
          form.email.trim().toLowerCase(),
        )}`,
      );
    } catch {
      setServerError(
        "Unable to connect to the server. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (field: keyof FormData) =>
    `h-12 w-full rounded-xl border bg-white px-4 text-sm text-[#171A1F] outline-none transition placeholder:text-[#9A9A96] ${
      errors[field]
        ? "border-red-400 focus:border-red-500"
        : "border-[#deded8] focus:border-[#171A1F] focus:ring-2 focus:ring-[#171A1F]/5"
    }`;

  return (
    <main className="overflow-hidden bg-[#f5f5f2]">
      <section className="relative px-4 pb-14 pt-10 sm:px-6 sm:pb-18 sm:pt-14 lg:px-8 lg:pb-24 lg:pt-20">
        <div className="mx-auto w-full max-w-[1500px]">
          <div className="overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-[0_20px_70px_rgba(0,0,0,0.08)] lg:grid lg:grid-cols-[0.78fr_1.22fr]">
            {/* LEFT SIDE */}
            <div className="relative overflow-hidden bg-[#171A1F] px-7 py-10 text-white sm:px-10 sm:py-12 lg:px-14 lg:py-16">
              <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10" />
              <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full border border-white/10" />

              <div className="relative flex h-full flex-col">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F97316]">
                    <Fingerprint size={21} className="text-white" />
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

                <div className="mt-14 max-w-xl lg:mt-24">
                  <div className="mb-5 flex items-center gap-3">
                    <span className="h-px w-10 bg-[#F97316]" />
                    <span className="text-xs font-bold uppercase tracking-[0.24em] text-white/45">
                      Create Account
                    </span>
                  </div>

                  <h1 className="text-4xl font-black leading-[0.95] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                    Keep your
                    <span className="block text-white/35">
                      evidence organised.
                    </span>
                  </h1>

                  <p className="mt-7 max-w-lg text-sm leading-7 text-white/55 sm:text-base">
                    Create your Forencis account to manage digital evidence,
                    custody records, verification and investigation activity
                    from one place.
                  </p>
                </div>

                <div className="mt-12 space-y-4 lg:mt-auto lg:pt-24">
                  <div className="flex items-center gap-4 border-t border-white/10 pt-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5">
                      <FileCheck2 size={18} className="text-[#F97316]" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-white">
                        Evidence records
                      </p>
                      <p className="mt-1 text-xs text-white/40">
                        Keep important evidence details together.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 border-t border-white/10 pt-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5">
                      <ShieldCheck size={18} className="text-[#F97316]" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-white">
                        Chain of custody
                      </p>
                      <p className="mt-1 text-xs text-white/40">
                        Track changes and custody activity.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 border-t border-white/10 pt-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5">
                      <LockKeyhole size={18} className="text-[#F97316]" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-white">
                        Controlled access
                      </p>
                      <p className="mt-1 text-xs text-white/40">
                        Access your account securely.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="px-6 py-9 sm:px-10 sm:py-12 lg:px-14 lg:py-16">
              <div className="mx-auto w-full max-w-2xl">
                <div className="mb-8">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#F97316]">
                    Registration
                  </p>

                  <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] text-[#171A1F] sm:text-4xl">
                    Create your account
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-[#6B6B66]">
                    Enter your details to get started.
                  </p>
                </div>

                {serverError && (
                  <div
                    role="alert"
                    className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                  >
                    {serverError}
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  <div className="space-y-7">
                    {/* PERSONAL DETAILS */}
                    <div>
                      <div className="mb-4 flex items-center gap-3">
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#8A8A84]">
                          Personal details
                        </span>
                        <span className="h-px flex-1 bg-[#e7e7e1]" />
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <label
                            htmlFor="firstName"
                            className="mb-2 block text-xs font-bold text-[#343431]"
                          >
                            First name
                          </label>

                          <input
                            id="firstName"
                            name="firstName"
                            type="text"
                            autoComplete="given-name"
                            value={form.firstName}
                            onChange={(event) =>
                              updateField("firstName", event.target.value)
                            }
                            className={inputClass("firstName")}
                            placeholder="First name"
                            disabled={isSubmitting}
                          />

                          {errors.firstName && (
                            <p className="mt-1.5 text-xs text-red-600">
                              {errors.firstName}
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="lastName"
                            className="mb-2 block text-xs font-bold text-[#343431]"
                          >
                            Last name
                          </label>

                          <input
                            id="lastName"
                            name="lastName"
                            type="text"
                            autoComplete="family-name"
                            value={form.lastName}
                            onChange={(event) =>
                              updateField("lastName", event.target.value)
                            }
                            className={inputClass("lastName")}
                            placeholder="Last name"
                            disabled={isSubmitting}
                          />

                          {errors.lastName && (
                            <p className="mt-1.5 text-xs text-red-600">
                              {errors.lastName}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ACCOUNT DETAILS */}
                    <div>
                      <div className="mb-4 flex items-center gap-3">
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#8A8A84]">
                          Account details
                        </span>
                        <span className="h-px flex-1 bg-[#e7e7e1]" />
                      </div>

                      <div className="space-y-5">
                        <div>
                          <label
                            htmlFor="username"
                            className="mb-2 block text-xs font-bold text-[#343431]"
                          >
                            Username
                          </label>

                          <input
                            id="username"
                            name="username"
                            type="text"
                            autoComplete="username"
                            value={form.username}
                            onChange={(event) =>
                              updateField("username", event.target.value)
                            }
                            className={inputClass("username")}
                            placeholder="Choose a username"
                            disabled={isSubmitting}
                          />

                          {errors.username ? (
                            <p className="mt-1.5 text-xs text-red-600">
                              {errors.username}
                            </p>
                          ) : (
                            <p className="mt-1.5 text-xs text-[#999994]">
                              3–30 characters. Letters, numbers and underscores.
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="email"
                            className="mb-2 block text-xs font-bold text-[#343431]"
                          >
                            Email address
                          </label>

                          <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            value={form.email}
                            onChange={(event) =>
                              updateField("email", event.target.value)
                            }
                            className={inputClass("email")}
                            placeholder="you@example.com"
                            disabled={isSubmitting}
                          />

                          {errors.email && (
                            <p className="mt-1.5 text-xs text-red-600">
                              {errors.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* PASSWORD */}
                    <div>
                      <div className="mb-4 flex items-center gap-3">
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#8A8A84]">
                          Password
                        </span>
                        <span className="h-px flex-1 bg-[#e7e7e1]" />
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <label
                            htmlFor="password"
                            className="mb-2 block text-xs font-bold text-[#343431]"
                          >
                            Password
                          </label>

                          <div className="relative">
                            <input
                              id="password"
                              name="password"
                              type={showPassword ? "text" : "password"}
                              autoComplete="new-password"
                              value={form.password}
                              onChange={(event) =>
                                updateField("password", event.target.value)
                              }
                              className={`${inputClass(
                                "password",
                              )} pr-12`}
                              placeholder="Create a password"
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
                                setShowPassword((current) => !current)
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

                          {form.password && (
                            <div className="mt-3">
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((level) => (
                                  <span
                                    key={level}
                                    className={`h-1 flex-1 rounded-full ${
                                      level <= passwordScore
                                        ? "bg-[#171A1F]"
                                        : "bg-[#e4e4df]"
                                    }`}
                                  />
                                ))}
                              </div>

                              <p className="mt-1.5 text-xs text-[#888882]">
                                Password strength: {passwordLabel}
                              </p>
                            </div>
                          )}

                          {errors.password && (
                            <p className="mt-1.5 text-xs text-red-600">
                              {errors.password}
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="confirmPassword"
                            className="mb-2 block text-xs font-bold text-[#343431]"
                          >
                            Confirm password
                          </label>

                          <div className="relative">
                            <input
                              id="confirmPassword"
                              name="confirmPassword"
                              type={
                                showConfirmPassword ? "text" : "password"
                              }
                              autoComplete="new-password"
                              value={form.confirmPassword}
                              onChange={(event) =>
                                updateField(
                                  "confirmPassword",
                                  event.target.value,
                                )
                              }
                              className={`${inputClass(
                                "confirmPassword",
                              )} pr-12`}
                              placeholder="Repeat your password"
                              disabled={isSubmitting}
                            />

                            <button
                              type="button"
                              aria-label={
                                showConfirmPassword
                                  ? "Hide password"
                                  : "Show password"
                              }
                              onClick={() =>
                                setShowConfirmPassword(
                                  (current) => !current,
                                )
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[#777771] transition hover:bg-[#f2f2ed] hover:text-[#171A1F]"
                            >
                              {showConfirmPassword ? (
                                <EyeOff size={17} />
                              ) : (
                                <Eye size={17} />
                              )}
                            </button>
                          </div>

                          {errors.confirmPassword && (
                            <p className="mt-1.5 text-xs text-red-600">
                              {errors.confirmPassword}
                            </p>
                          )}
                        </div>
                      </div>

                      <p className="mt-3 text-xs leading-5 text-[#999994]">
                        Use at least 8 characters. A mix of letters, numbers
                        and symbols is recommended.
                      </p>
                    </div>

                    {/* TERMS */}
                    <div className="rounded-xl border border-[#e7e7e1] bg-[#fafaf7] p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-[#cfcfc8] bg-white">
                          <Check size={13} className="text-[#171A1F]" />
                        </div>

                        <p className="text-xs leading-5 text-[#6E6E68]">
                          By creating an account, you agree to the{" "}
                          <Link
                            href="/terms"
                            className="font-bold text-[#171A1F] underline underline-offset-2 hover:text-[#F97316]"
                          >
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link
                            href="/privacy"
                            className="font-bold text-[#171A1F] underline underline-offset-2 hover:text-[#F97316]"
                          >
                            Privacy Policy
                          </Link>
                          .
                        </p>
                      </div>
                    </div>

                    {/* SUBMIT */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group flex min-h-[52px] w-full items-center justify-center rounded-full bg-[#F97316] px-7 text-sm font-bold text-white transition duration-300 hover:bg-[#ea650b] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Creating account...
                        </>
                      ) : (
                        <>
                          Create account
                          <ArrowRight
                            size={18}
                            className="ml-2 transition-transform duration-300 group-hover:translate-x-1"
                          />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <div className="mt-8 border-t border-[#e7e7e1] pt-6 text-center">
                  <p className="text-sm text-[#777771]">
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="font-bold text-[#171A1F] transition hover:text-[#F97316]"
                    >
                      Sign in
                    </Link>
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

