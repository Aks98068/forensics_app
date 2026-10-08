
"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  ArrowLeft,
  Check,
  CircleAlert,
  Info,
  Loader2,
  Mail,
  ShieldCheck,
} from "lucide-react";

export default function ResendResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      /*
       * Keep this endpoint aligned with your Go backend.
       * Change it only if your actual API route is different.
       */
      const response = await fetch(
        "/api/v1/auth/resend-reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: normalizedEmail,
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Unable to send a new password reset link."
        );
      }

      /*
       * Generic success message intentionally avoids revealing
       * whether an account exists for the supplied email.
       */
      setSuccessMessage(
        "If an account exists with this email, a new password reset link has been sent."
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to process your request."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F4EE] pt-20 text-[#171A1F]">
      <section className="px-4 pb-20 pt-8 sm:px-6 sm:pb-24 sm:pt-10 lg:px-8 lg:pb-28 lg:pt-12">
        <div className="mx-auto w-full max-w-6xl">

          {/* =====================================================
              TOP NAVIGATION / BACK LINK
          ====================================================== */}

          <div className="mb-6 sm:mb-8">
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-[#626A73] transition hover:text-[#F97316]"
            >
              <ArrowLeft
                size={16}
                className="transition-transform duration-200 group-hover:-translate-x-1"
              />

              Back to login
            </Link>
          </div>


          {/* =====================================================
              MAIN CARD
          ====================================================== */}

          <div className="mx-auto w-full max-w-md">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="mb-8 text-center">

              {/* Logo */}
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#171A1F] shadow-[0_10px_30px_rgba(23,26,31,0.12)]">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#F97316]/40">

                  <Mail
                    className="h-6 w-6 text-[#F97316]"
                    strokeWidth={1.8}
                  />

                </div>

              </div>


              <h1 className="text-3xl font-black tracking-tight text-[#171A1F] sm:text-[2rem]">
                Reset your password
              </h1>


              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#777773]">
                Request a new password reset link for your FORENSIQ
                account.
              </p>

            </div>


            {/* =================================================
                CARD
            ================================================= */}

            <div className="rounded-[1.5rem] border border-[#E2DED5] bg-white p-6 shadow-[0_20px_60px_rgba(23,26,31,0.07)] sm:p-8">

              {/* =================================================
                  INFORMATION BOX
              ================================================= */}

              <div className="mb-6 rounded-xl border border-[#E2DED5] bg-[#F7F4EE] p-4">

                <div className="flex gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FFF1E8] text-[#F97316]">

                    <Info
                      className="h-5 w-5"
                      strokeWidth={1.9}
                    />

                  </div>


                  <div>

                    <p className="text-sm font-bold text-[#171A1F]">
                      Need another reset link?
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#777773]">
                      Enter the email address associated with your
                      account. If an account exists, we&apos;ll send
                      a new password reset link.
                    </p>

                  </div>

                </div>

              </div>


              {/* =================================================
                  SUCCESS MESSAGE
              ================================================= */}

              {successMessage && (
                <div
                  className="mb-5 rounded-xl border border-[#0F766E]/20 bg-[#0F766E]/5 px-4 py-3"
                  role="status"
                  aria-live="polite"
                >

                  <div className="flex items-start gap-3">

                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-[#0F766E]">

                      <Check
                        className="h-4 w-4"
                        strokeWidth={2.5}
                      />

                    </span>


                    <div>

                      <p className="text-sm font-bold text-[#065F46]">
                        Reset link requested
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[#047857]">
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
                  className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
                  role="alert"
                  aria-live="assertive"
                >

                  <div className="flex items-start gap-3">

                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-red-600">

                      <CircleAlert
                        className="h-4 w-4"
                        strokeWidth={2}
                      />

                    </span>


                    <div>

                      <p className="text-sm font-bold text-red-800">
                        Unable to process request
                      </p>

                      <p className="mt-1 text-xs leading-5 text-red-700">
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

                {/* Email */}
                <div>

                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-bold text-[#171A1F]"
                  >
                    Email address
                  </label>


                  <div className="relative">

                    <Mail
                      className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#A6A39D]"
                      aria-hidden="true"
                    />


                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);

                        if (errorMessage) {
                          setErrorMessage("");
                        }

                        if (successMessage) {
                          setSuccessMessage("");
                        }
                      }}
                      autoComplete="email"
                      inputMode="email"
                      maxLength={255}
                      placeholder="you@example.com"
                      required
                      disabled={loading}
                      className="h-12 w-full rounded-xl border border-[#E2DED5] bg-[#F7F4EE] pl-11 pr-4 text-sm text-[#171A1F] outline-none transition placeholder:text-[#A6A39D] hover:border-[#C9C4BA] focus:border-[#F97316] focus:bg-white focus:ring-4 focus:ring-[#F97316]/10 disabled:cursor-not-allowed disabled:opacity-70"
                    />

                  </div>


                  <p className="mt-2 text-xs leading-5 text-[#777773]">
                    We&apos;ll send a new password reset link if the
                    account exists.
                  </p>

                </div>


                {/* =================================================
                    BUTTON
                ================================================= */}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#171A1F] px-4 text-sm font-bold text-white shadow-[0_8px_20px_rgba(23,26,31,0.12)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#252A31] hover:shadow-[0_12px_28px_rgba(23,26,31,0.16)] focus:outline-none focus:ring-4 focus:ring-[#F97316]/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >

                  {loading ? (
                    <>
                      <Loader2
                        className="h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />

                      <span>
                        Sending reset link...
                      </span>
                    </>
                  ) : (
                    <span>
                      Send new reset link
                    </span>
                  )}

                </button>

              </form>


              {/* =================================================
                  BACK TO LOGIN
              ================================================= */}

              <div className="mt-6 border-t border-[#E2DED5] pt-6 text-center">

                <Link
                  href="/login"
                  className="group inline-flex items-center gap-2 text-sm font-bold text-[#0F766E] transition hover:text-[#095C59]"
                >

                  <ArrowLeft
                    className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1"
                  />

                  Back to login

                </Link>

              </div>

            </div>


            {/* =================================================
                SECURITY NOTICE
            ================================================= */}

            <div className="mt-7 px-4 text-center">

              <div className="mb-3 flex items-center justify-center gap-2">

                <ShieldCheck
                  className="h-4 w-4 text-[#0F766E]"
                  strokeWidth={1.8}
                />

                <span className="text-xs font-semibold text-[#626A73]">
                  Secure password recovery
                </span>

              </div>


              <p className="text-[11px] leading-5 text-[#777773]">
                For your security, FORENSIQ does not reveal whether
                an email address is registered with the platform.
              </p>

            </div>


            {/* Bottom breathing room */}
            <div className="h-6 sm:h-8" />

          </div>

        </div>
      </section>
    </main>
  );
}

