"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  Check,
  CircleAlert,
  Mail,
  ShieldCheck,
  ArrowLeft,
  Loader2,
} from "lucide-react";

export default function ResendVerificationPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSuccess(false);
    setError("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/v1/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: trimmedEmail,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Unable to resend the verification email."
        );
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to resend the verification email."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F4EE] pt-20 text-[#171A1F]">
      <section className="px-4 pb-20 pt-8 sm:px-6 sm:pb-24 sm:pt-10 lg:px-8 lg:pb-28 lg:pt-12">
        <div className="mx-auto max-w-7xl">
          {/* Back navigation */}
          <div className="mb-6 sm:mb-8">
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-[#626A73] transition hover:text-[#F97316]"
            >
              <ArrowLeft
                size={16}
                className="transition-transform group-hover:-translate-x-1"
              />
              Back to login
            </Link>
          </div>

          {/* Main Card */}
          <div className="grid overflow-hidden rounded-[2rem] border border-[#E2DED5] bg-white shadow-[0_24px_80px_rgba(23,26,31,0.08)] lg:min-h-[650px] lg:grid-cols-2">
            {/* =====================================================
                BRAND PANEL
            ====================================================== */}
            <div className="relative hidden overflow-hidden bg-[#171A1F] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
              {/* Background effects */}
              <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#F97316]/10 blur-3xl" />

              <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-[#0F766E]/10 blur-3xl" />

              <div className="absolute right-16 top-1/2 h-32 w-32 rounded-full border border-white/5" />

              <div className="relative z-10">
                {/* Brand */}
                <Link
                  href="/"
                  aria-label="FORENSIQ home"
                  className="mb-14 inline-flex items-center gap-3"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F97316] text-lg font-black text-white shadow-lg shadow-[#F97316]/20">
                    F
                  </span>

                  <span className="text-xl font-bold tracking-tight">
                    FORENSIQ
                  </span>
                </Link>

                {/* Badge */}
                <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                  Account verification
                </div>

                {/* Heading */}
                <h1 className="mt-7 max-w-xl text-4xl font-black leading-[1.05] tracking-tight xl:text-5xl">
                  Didn&apos;t receive
                  <br />
                  <span className="text-[#F97316]">
                    your verification email?
                  </span>
                </h1>

                <p className="mt-6 max-w-md text-base leading-7 text-white/60">
                  No problem. Enter the email address associated with your
                  FORENSIQ account and we&apos;ll send you a new verification
                  link.
                </p>

                {/* Benefits */}
                <div className="mt-10 space-y-5">
                  <BenefitItem>
                    Activate your FORENSIQ account
                  </BenefitItem>

                  <BenefitItem>
                    Protect your investigation workspace
                  </BenefitItem>

                  <BenefitItem>
                    Secure your forensic investigation access
                  </BenefitItem>
                </div>
              </div>

              {/* Bottom brand status */}
              <div className="relative z-10 mt-12 flex items-center justify-between border-t border-white/10 pt-6">
                <div>
                  <p className="text-sm font-semibold">FORENSIQ</p>

                  <p className="mt-1 text-xs text-white/40">
                    Digital Forensics Platform
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-white/40">
                  <span className="h-2 w-2 rounded-full bg-[#0F766E]" />
                  Secure account verification
                </div>
              </div>
            </div>

            {/* =====================================================
                FORM PANEL
            ====================================================== */}
            <div className="flex items-center justify-center bg-white p-6 sm:p-10 lg:p-12 xl:p-16">
              <div className="w-full max-w-md">
                {/* Mobile brand */}
                <div className="mb-8 flex items-center gap-3 lg:hidden">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F97316] text-base font-black text-white">
                    F
                  </div>

                  <div>
                    <p className="font-bold tracking-tight text-[#171A1F]">
                      FORENSIQ
                    </p>

                    <p className="text-xs text-[#777773]">
                      Digital Forensics Platform
                    </p>
                  </div>
                </div>

                {/* Header */}
                <div className="mb-8">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF1E8] text-[#F97316]">
                    <Mail size={28} strokeWidth={2} />
                  </div>

                  <h2 className="text-3xl font-black tracking-tight text-[#171A1F]">
                    Resend verification
                  </h2>

                  <p className="mt-3 leading-7 text-[#626A73]">
                    Enter the email address associated with your FORENSIQ
                    account and we&apos;ll send you a new verification link.
                  </p>
                </div>

                {/* Success message */}
                {success && (
                  <div
                    className="mb-6 rounded-2xl border border-[#A7F3D0] bg-[#ECFDF5] p-4"
                    role="status"
                    aria-live="polite"
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-[#0F766E]">
                        <Check size={17} strokeWidth={2.5} />
                      </span>

                      <div>
                        <p className="text-sm font-bold text-[#065F46]">
                          Verification email sent
                        </p>

                        <p className="mt-1 text-sm leading-5 text-[#047857]">
                          If an account exists with this email, a new
                          verification email has been sent.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error message */}
                {error && (
                  <div
                    className="mb-6 rounded-2xl border border-[#FECACA] bg-[#FEF2F2] p-4"
                    role="alert"
                    aria-live="assertive"
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-[#DC2626]">
                        <CircleAlert size={17} strokeWidth={2} />
                      </span>

                      <div>
                        <p className="text-sm font-bold text-[#991B1B]">
                          Unable to resend email
                        </p>

                        <p className="mt-1 text-sm leading-5 text-[#B91C1C]">
                          {error}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form */}
                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                  noValidate
                >
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-semibold text-[#171A1F]"
                    >
                      Email address
                    </label>

                    <div className="relative">
                      <Mail
                        size={18}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                        aria-hidden="true"
                      />

                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(event) => {
                          setEmail(event.target.value);

                          if (error) {
                            setError("");
                          }

                          if (success) {
                            setSuccess(false);
                          }
                        }}
                        autoComplete="email"
                        inputMode="email"
                        maxLength={255}
                        required
                        placeholder="you@example.com"
                        disabled={loading}
                        className="h-12 w-full rounded-xl border border-[#D9D5CC] bg-white pl-11 pr-4 text-sm text-[#171A1F] outline-none transition placeholder:text-[#9CA3AF] hover:border-[#BDB8AE] focus:border-[#F97316] focus:ring-4 focus:ring-[#F97316]/10 disabled:cursor-not-allowed disabled:bg-[#F7F4EE]"
                      />
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#F97316] px-5 text-sm font-bold text-white shadow-lg shadow-[#F97316]/20 transition hover:bg-[#EA580C] hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#F97316]/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading && (
                      <Loader2
                        size={18}
                        className="animate-spin"
                        aria-hidden="true"
                      />
                    )}

                    <span>
                      {loading
                        ? "Sending verification email..."
                        : "Resend verification email"}
                    </span>
                  </button>
                </form>

                {/* Links */}
                <div className="mt-7 flex flex-col items-center gap-3 text-sm">
                  <Link
                    href="/verify-email"
                    className="font-semibold text-[#F97316] transition hover:text-[#EA580C]"
                  >
                    Back to email verification
                  </Link>

                  <Link
                    href="/login"
                    className="text-[#626A73] transition hover:text-[#171A1F]"
                  >
                    Back to login
                  </Link>
                </div>

                {/* Security footer */}
                <div className="mt-10 border-t border-[#E2DED5] pt-6">
                  <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#626A73]">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#F7F4EE] text-[#0F766E]">
                      <ShieldCheck size={14} />
                    </span>

                    Protected FORENSIQ account verification
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom breathing space / status */}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-[#777773]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0F766E]" />
            Secure account recovery
          </div>
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   BENEFIT ITEM
========================================================= */

function BenefitItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-sm text-white/80">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-[#F97316]">
        <Check size={16} strokeWidth={2.5} />
      </span>

      <span>{children}</span>
    </div>
  );
}