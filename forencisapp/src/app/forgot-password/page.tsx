
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  Check,
  CircleX,
  LockKeyhole,
  ShieldCheck,
  ArrowLeft,
  Mail,
  UserRound,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [identifierError, setIdentifierError] = useState("");

  const validateIdentifier = () => {
    const value = identifier.trim();

    if (!value) {
      setIdentifierError("Email address or username is required.");
      return false;
    }

    /*
     * Allow either:
     * - Email: user@example.com
     * - Username: 3–30 characters, letters/numbers/underscore
     */
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    const isUsername = /^[a-zA-Z0-9_]{3,30}$/.test(value);

    if (!isEmail && !isUsername) {
      setIdentifierError(
        "Enter a valid email address or username.",
      );
      return false;
    }

    setIdentifierError("");
    return true;
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    if (!validateIdentifier()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        "/api/v1/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            identifier: identifier.trim(),
          }),
        },
      );

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
        setErrorMessage(
          data.message ||
            data.error ||
            "Unable to process your request. Please try again.",
        );

        return;
      }

      setSuccessMessage(
        data.message ||
          "If an account exists with this identifier, a password reset link has been sent.",
      );

      setIdentifier("");
    } catch {
      setErrorMessage(
        "Unable to connect to the server. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F4EE] pt-20">
      {/* =========================================================
          PAGE CONTENT
          ========================================================= */}

      <section className="px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10 lg:px-8 lg:pb-24 lg:pt-12">
        <div className="mx-auto w-full max-w-6xl">

          {/* Top spacing / breadcrumb */}

          <div className="mb-6 flex items-center justify-between px-1">
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-[#626A73] transition hover:text-[#F97316]"
            >
              <ArrowLeft
                size={16}
                className="transition-transform group-hover:-translate-x-1"
              />

              Back to login
            </Link>

            <div className="hidden items-center gap-2 text-xs font-medium text-[#8A9097] sm:flex">
              <span className="h-2 w-2 rounded-full bg-[#0F766E]" />
              Secure account recovery
            </div>
          </div>

          {/* =====================================================
              MAIN CARD
              ===================================================== */}

          <div className="grid min-h-[620px] overflow-hidden rounded-[2rem] border border-[#E2DED5] bg-white shadow-[0_30px_90px_rgba(23,26,31,0.10)] lg:grid-cols-2">

            {/* ===================================================
                LEFT PANEL
                =================================================== */}

            <div className="relative hidden overflow-hidden bg-[#171A1F] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">

              {/* Decorative background */}

              <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#F97316]/10 blur-3xl" />

              <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-[#0F766E]/10 blur-3xl" />

              <div className="pointer-events-none absolute right-16 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full border border-white/[0.04]" />

              <div className="pointer-events-none absolute right-24 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full border border-white/[0.04]" />

              <div className="relative z-10">

                {/* Brand */}

                <Link
                  href="/"
                  className="mb-14 inline-flex items-center gap-3"
                  aria-label="FORENSIQ home"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F97316] text-lg font-black text-white shadow-lg shadow-[#F97316]/20">
                    F
                  </span>

                  <span className="text-xl font-bold tracking-tight">
                    FORENSIQ
                  </span>
                </Link>

                {/* Badge */}

                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
                  <LockKeyhole size={13} />
                  Password recovery
                </div>

                {/* Heading */}

                <h1 className="mt-7 max-w-lg text-4xl font-black leading-[1.05] tracking-tight xl:text-5xl">
                  Forgot your
                  <br />

                  <span className="text-[#F97316]">
                    password?
                  </span>
                </h1>

                <p className="mt-6 max-w-md text-base leading-7 text-white/55">
                  Enter the email address or username associated
                  with your FORENSIQ account. We'll send you a
                  secure link to create a new password.
                </p>

                {/* Features */}

                <div className="mt-10 space-y-5">

                  <div className="flex items-center gap-3 text-sm text-white/80">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-[#F97316]">
                      <Check size={16} />
                    </span>

                    <span>
                      Secure password recovery
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-white/80">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-[#F97316]">
                      <Check size={16} />
                    </span>

                    <span>
                      Protected reset link
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-white/80">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-[#F97316]">
                      <Check size={16} />
                    </span>

                    <span>
                      Restore investigation workspace access
                    </span>
                  </div>

                </div>
              </div>

              {/* Bottom information */}

              <div className="relative z-10 mt-12 flex items-center justify-between border-t border-white/10 pt-6">

                <div>
                  <p className="text-sm font-semibold">
                    FORENSIQ
                  </p>

                  <p className="mt-1 text-xs text-white/35">
                    Digital Forensics Platform
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-white/35">
                  <span className="h-2 w-2 rounded-full bg-[#0F766E]" />
                  Protected recovery
                </div>

              </div>
            </div>

            {/* ===================================================
                RIGHT FORM PANEL
                =================================================== */}

            <div className="flex items-center justify-center p-6 sm:p-10 lg:p-12 xl:p-16">

              <div className="w-full max-w-md">

                {/* Mobile brand */}

                <div className="mb-8 flex items-center gap-3 lg:hidden">

                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F97316] text-lg font-black text-white">
                    F
                  </span>

                  <span className="text-lg font-bold text-[#171A1F]">
                    FORENSIQ
                  </span>

                </div>

                {/* Header */}

                <div className="mb-8">

                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF1E8] text-[#F97316] shadow-sm">
                    <LockKeyhole
                      size={27}
                      strokeWidth={2}
                    />
                  </div>

                  <h2 className="text-3xl font-black tracking-tight text-[#171A1F] sm:text-[2rem]">
                    Forgot password?
                  </h2>

                  <p className="mt-3 max-w-md leading-7 text-[#626A73]">
                    Enter your FORENSIQ username or email and
                    we'll send you a secure password reset link.
                  </p>

                </div>

                {/* =================================================
                    SUCCESS MESSAGE
                    ================================================= */}

                {successMessage && (
                  <div
                    className="mb-6 rounded-2xl border border-[#A7F3D0] bg-[#ECFDF5] p-4 shadow-sm"
                    role="status"
                    aria-live="polite"
                  >
                    <div className="flex items-start gap-3">

                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-[#0F766E] shadow-sm">
                        <Check size={18} />
                      </span>

                      <div>

                        <p className="text-sm font-bold text-[#065F46]">
                          Reset link sent
                        </p>

                        <p className="mt-1 text-sm leading-5 text-[#047857]">
                          {successMessage}
                        </p>

                      </div>

                    </div>
                  </div>
                )}

                {/* =================================================
                    ERROR MESSAGE
                    ================================================= */}

                {errorMessage && (
                  <div
                    className="mb-6 rounded-2xl border border-[#FECACA] bg-[#FEF2F2] p-4 shadow-sm"
                    role="alert"
                    aria-live="assertive"
                  >
                    <div className="flex items-start gap-3">

                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-[#DC2626] shadow-sm">
                        <CircleX size={18} />
                      </span>

                      <div>

                        <p className="text-sm font-bold text-[#991B1B]">
                          Unable to send reset link
                        </p>

                        <p className="mt-1 text-sm leading-5 text-[#B91C1C]">
                          {errorMessage}
                        </p>

                      </div>

                    </div>
                  </div>
                )}

                {/* =================================================
                    FORM
                    ================================================= */}

                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                  noValidate
                >

                  <div>

                    <label
                      htmlFor="identifier"
                      className="mb-2 block text-sm font-bold text-[#171A1F]"
                    >
                      Username or email address
                    </label>

                    <div className="relative">

                      <UserRound
                        size={18}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                      />

                      <input
                        id="identifier"
                        name="identifier"
                        type="text"
                        autoComplete="username"
                        maxLength={255}
                        required
                        value={identifier}
                        onChange={(event) => {
                          setIdentifier(event.target.value);

                          if (identifierError) {
                            setIdentifierError("");
                          }

                          if (errorMessage) {
                            setErrorMessage("");
                          }

                          if (successMessage) {
                            setSuccessMessage("");
                          }
                        }}
                        placeholder="Username or you@example.com"
                        disabled={isSubmitting}
                        aria-invalid={Boolean(identifierError)}
                        aria-describedby={
                          identifierError
                            ? "identifier-error"
                            : "identifier-help"
                        }
                        className={`h-13 w-full rounded-xl border bg-white pl-11 pr-4 text-sm text-[#171A1F] outline-none transition-all placeholder:text-[#9CA3AF] focus:ring-4 disabled:cursor-not-allowed disabled:bg-[#F7F4EE] ${
                          identifierError
                            ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
                            : "border-[#D9D5CC] hover:border-[#BDB8AE] focus:border-[#F97316] focus:ring-[#F97316]/10"
                        }`}
                      />

                    </div>

                    {identifierError ? (
                      <p
                        id="identifier-error"
                        className="mt-1.5 text-xs font-medium text-red-600"
                      >
                        {identifierError}
                      </p>
                    ) : (
                      <p
                        id="identifier-help"
                        className="mt-2 text-xs leading-5 text-[#8A9097]"
                      >
                        You can use either your registered username
                        or email address.
                      </p>
                    )}

                  </div>

                  {/* Submit */}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#F97316] px-5 text-sm font-bold text-white shadow-lg shadow-[#F97316]/20 transition-all hover:-translate-y-0.5 hover:bg-[#EA580C] hover:shadow-xl hover:shadow-[#F97316]/25 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="h-[18px] w-[18px] animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Sending...
                      </>
                    ) : (
                      "Send reset link"
                    )}
                  </button>

                </form>

                {/* =================================================
                    LINKS
                    ================================================= */}

                <div className="mt-7 flex flex-col items-center gap-3 text-sm">

                  <Link
                    href="/login"
                    className="font-semibold text-[#F97316] transition hover:text-[#EA580C]"
                  >
                    Back to login
                  </Link>

                  <Link
                    href="/register"
                    className="text-[#626A73] transition hover:text-[#171A1F]"
                  >
                    Create a FORENSIQ account
                  </Link>

                </div>

                {/* =================================================
                    SECURITY FOOTER
                    ================================================= */}

                <div className="mt-10 border-t border-[#E2DED5] pt-6">

                  <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#626A73]">

                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F7F4EE] text-[#0F766E]">
                      <ShieldCheck size={15} />
                    </span>

                    Protected FORENSIQ password recovery

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* Space between card and footer */}

          <div className="h-6 sm:h-8" />

          {/* Small bottom status */}

          <div className="flex items-center justify-center gap-2 text-center text-xs text-[#8A9097]">

            <span className="h-1.5 w-1.5 rounded-full bg-[#0F766E]" />

            Your account security is important to us.

          </div>

        </div>
      </section>
    </main>
  );
}

