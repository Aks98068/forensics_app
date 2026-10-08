"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  CircleX,
  Mail,
  ShieldCheck,
} from "lucide-react";

type VerificationStatus =
  | "verifying"
  | "success"
  | "error"
  | "missing";

export default function VerifyEmailPage() {
  const [status, setStatus] =
    useState<VerificationStatus>("verifying");

  const [message, setMessage] = useState(
    "Please wait while FORENSIQ verifies your email address."
  );

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        /*
         * Get the verification token from:
         *
         * /verify-email?token=YOUR_TOKEN
         */
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (!token) {
          setStatus("missing");
          setMessage(
            "This verification link is missing the required verification token."
          );
          return;
        }

        /*
         * Send the token to your backend.
         */
        const response = await fetch(
          "/api/v1/auth/verify-email",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              token,
            }),
          }
        );

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          setStatus("error");

          setMessage(
            data?.message ||
              data?.error ||
              "This verification link is invalid, expired, or has already been used."
          );

          return;
        }

        /*
         * Backend successfully verified the email.
         */
        setStatus("success");

        setMessage(
          data?.message ||
            "Your email has been successfully verified."
        );
      } catch (error) {
        console.error("Email verification error:", error);

        setStatus("error");

        setMessage(
          "We could not verify your email right now. Please try again or request a new verification email."
        );
      }
    };

    verifyEmail();
  }, []);

  return (
    <main className="min-h-screen bg-[#F7F4EE] pt-20 text-[#171A1F]">
      <section className="px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10 lg:px-8 lg:pb-24 lg:pt-12">
        <div className="mx-auto w-full max-w-7xl">

          {/* =====================================================
              TOP NAVIGATION
          ====================================================== */}

          <div className="mb-6 flex items-center justify-between px-1">
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-[#626A73] transition hover:text-[#F97316]"
            >
              <ArrowLeft
                size={16}
                className="transition-transform group-hover:-translate-x-1"
              />

              Back to registration
            </Link>

            <div className="hidden items-center gap-2 text-xs font-semibold text-[#8A9097] sm:flex">
              <span
                className={`h-2 w-2 rounded-full ${
                  status === "success"
                    ? "bg-[#0F766E]"
                    : status === "error" ||
                        status === "missing"
                      ? "bg-red-500"
                      : "bg-[#F97316]"
                }`}
              />

              {status === "success"
                ? "Email verified"
                : status === "error" ||
                    status === "missing"
                  ? "Verification failed"
                  : "Secure account verification"}
            </div>
          </div>

          {/* =====================================================
              MAIN CARD
          ====================================================== */}

          <div className="grid min-h-[680px] overflow-hidden rounded-[2rem] border border-[#E2DED5] bg-white shadow-[0_30px_90px_rgba(23,26,31,0.10)] lg:grid-cols-2">

            {/* ===================================================
                LEFT PANEL
            ==================================================== */}

            <div className="relative hidden overflow-hidden bg-[#171A1F] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">

              {/* Decorative elements */}

              <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full border border-white/[0.05]" />

              <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full border border-[#F97316]/10" />

              <div className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full border border-[#F97316]/10" />

              <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-[#0F766E]/5 blur-3xl" />

              <div className="pointer-events-none absolute right-20 top-24 h-2 w-2 rounded-full bg-[#F97316] opacity-50" />

              <div className="pointer-events-none absolute bottom-28 left-16 h-2 w-2 rounded-full bg-[#0F766E] opacity-50" />

              <div className="relative z-10">

                {/* Badge */}

                <div className="mb-10 inline-flex items-center rounded-full border border-[#F97316]/30 bg-[#F97316]/10 px-3 py-1.5">
                  <span className="mr-2 h-1.5 w-1.5 rounded-full bg-[#F97316]" />

                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F97316]">
                    Digital Forensics Platform
                  </span>
                </div>

                {/* Dynamic heading */}

                <h1 className="max-w-lg text-4xl font-black leading-[1.05] tracking-[-0.04em] xl:text-5xl">
                  {status === "success" ? (
                    <>
                      Email verified.
                      <br />

                      <span className="text-[#0F766E]">
                        You&apos;re all set.
                      </span>
                    </>
                  ) : status === "error" ||
                    status === "missing" ? (
                    <>
                      Verification
                      <br />

                      <span className="text-[#F97316]">
                        could not be completed.
                      </span>
                    </>
                  ) : (
                    <>
                      One more step.
                      <br />

                      <span className="text-[#F97316]">
                        Verify your email.
                      </span>
                    </>
                  )}
                </h1>

                {/* Description */}

                <p className="mt-6 max-w-md text-base leading-7 text-white/55">
                  {status === "success"
                    ? "Your FORENSIQ account email has been verified successfully. You can now continue to your investigator workspace."
                    : status === "error" ||
                        status === "missing"
                      ? "The verification link could not be accepted. You can request a fresh verification email and try again."
                      : "Verify your email address to activate your FORENSIQ investigator account and gain access to your digital forensics workspace."}
                </p>

                {/* Status points */}

                <div className="mt-10 space-y-5">

                  <div className="flex items-center gap-3 text-sm text-white/80">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        status === "success"
                          ? "bg-[#0F766E]/10 text-[#5EEAD4]"
                          : "bg-white/[0.05] text-[#F97316]"
                      }`}
                    >
                      <Check size={16} />
                    </span>

                    <span>
                      Secure account activation
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-white/80">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-[#F97316]">
                      <ShieldCheck size={16} />
                    </span>

                    <span>
                      Protected investigator access
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-white/80">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-[#F97316]">
                      <Mail size={16} />
                    </span>

                    <span>
                      Verified email identity
                    </span>
                  </div>

                </div>

                {/* =================================================
                    ILLUSTRATION
                ================================================== */}

                <div className="mt-10 flex justify-center">

                  <svg
                    viewBox="0 0 420 240"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full max-w-[400px]"
                    aria-hidden="true"
                  >

                    <circle
                      cx="210"
                      cy="120"
                      r="94"
                      stroke="#FFFFFF"
                      strokeWidth="1"
                      strokeDasharray="4 5"
                      opacity="0.08"
                    />

                    <circle
                      cx="210"
                      cy="120"
                      r="70"
                      stroke="#FFFFFF"
                      strokeWidth="1"
                      opacity="0.05"
                    />

                    {/* Browser */}

                    <rect
                      x="110"
                      y="60"
                      width="200"
                      height="135"
                      rx="12"
                      fill="#20242A"
                      stroke="#FFFFFF"
                      strokeWidth="1.2"
                      strokeOpacity="0.10"
                    />

                    <rect
                      x="110"
                      y="60"
                      width="200"
                      height="34"
                      rx="12"
                      fill="#0F1317"
                    />

                    <rect
                      x="110"
                      y="82"
                      width="200"
                      height="12"
                      fill="#0F1317"
                    />

                    <circle
                      cx="127"
                      cy="77"
                      r="4"
                      fill="#F97316"
                    />

                    <circle
                      cx="141"
                      cy="77"
                      r="4"
                      fill="#0F766E"
                    />

                    <circle
                      cx="155"
                      cy="77"
                      r="4"
                      fill="#FFFFFF"
                      opacity="0.25"
                    />

                    {/* Email */}

                    <rect
                      x="143"
                      y="111"
                      width="134"
                      height="72"
                      rx="8"
                      fill="#171A1F"
                      stroke="#FFFFFF"
                      strokeWidth="1"
                      strokeOpacity="0.08"
                    />

                    <path
                      d="M146 116L210 155L274 116"
                      stroke="#F97316"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.8"
                    />

                    <path
                      d="M146 178L194 143"
                      stroke="#FFFFFF"
                      strokeWidth="1"
                      opacity="0.10"
                    />

                    <path
                      d="M274 178L226 143"
                      stroke="#FFFFFF"
                      strokeWidth="1"
                      opacity="0.10"
                    />

                    {/* Dynamic status */}

                    {status === "success" ? (
                      <>
                        <circle
                          cx="318"
                          cy="160"
                          r="28"
                          fill="#0F766E"
                          opacity="0.14"
                          stroke="#0F766E"
                          strokeWidth="1.5"
                        />

                        <circle
                          cx="318"
                          cy="160"
                          r="18"
                          fill="#171A1F"
                          stroke="#0F766E"
                          strokeWidth="1"
                        />

                        <path
                          d="M309 160l6 6 12-13"
                          stroke="#5EEAD4"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </>
                    ) : status === "error" ||
                      status === "missing" ? (
                      <>
                        <circle
                          cx="318"
                          cy="160"
                          r="28"
                          fill="#DC2626"
                          opacity="0.12"
                          stroke="#DC2626"
                          strokeWidth="1.5"
                        />

                        <circle
                          cx="318"
                          cy="160"
                          r="18"
                          fill="#171A1F"
                          stroke="#DC2626"
                          strokeWidth="1"
                        />

                        <path
                          d="M312 154L324 166M324 154L312 166"
                          stroke="#FCA5A5"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </>
                    ) : (
                      <>
                        <circle
                          cx="318"
                          cy="160"
                          r="28"
                          fill="#F97316"
                          opacity="0.10"
                          stroke="#F97316"
                          strokeWidth="1.5"
                        />

                        <circle
                          cx="318"
                          cy="160"
                          r="18"
                          fill="#171A1F"
                          stroke="#F97316"
                          strokeWidth="1"
                        />

                        <circle
                          cx="318"
                          cy="160"
                          r="7"
                          stroke="#F97316"
                          strokeWidth="2"
                          strokeDasharray="4 3"
                        />
                      </>
                    )}

                    {/* Lock */}

                    <circle
                      cx="85"
                      cy="160"
                      r="25"
                      fill="#171A1F"
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                      strokeOpacity="0.10"
                    />

                    <path
                      d="M77 157v-5c0-5 16-5 16 0v5"
                      stroke="#0F766E"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />

                    <rect
                      x="75"
                      y="157"
                      width="20"
                      height="16"
                      rx="3"
                      fill="#171A1F"
                      stroke="#F97316"
                      strokeWidth="1.3"
                    />

                    <circle
                      cx="85"
                      cy="165"
                      r="2"
                      fill="#F97316"
                    />

                    <line
                      x1="110"
                      y1="160"
                      x2="85"
                      y2="160"
                      stroke="#FFFFFF"
                      strokeWidth="1"
                      strokeDasharray="4 3"
                      opacity="0.15"
                    />

                    <line
                      x1="310"
                      y1="160"
                      x2="290"
                      y2="160"
                      stroke="#FFFFFF"
                      strokeWidth="1"
                      strokeDasharray="4 3"
                      opacity="0.15"
                    />

                  </svg>

                </div>

              </div>

              {/* Brand footer */}

              <div className="relative z-10 mt-10 flex items-center justify-between border-t border-white/10 pt-6">

                <div>
                  <p className="text-sm font-bold">
                    FORENSIQ
                  </p>

                  <p className="mt-1 text-xs text-white/40">
                    Digital Forensics Platform
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-white/40">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      status === "success"
                        ? "bg-[#0F766E]"
                        : status === "error" ||
                            status === "missing"
                          ? "bg-red-500"
                          : "bg-[#F97316]"
                    }`}
                  />

                  {status === "success"
                    ? "Verification complete"
                    : status === "error" ||
                        status === "missing"
                      ? "Verification failed"
                      : "Verifying email"}
                </div>

              </div>

            </div>

            {/* ===================================================
                RIGHT PANEL
            ==================================================== */}

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

                {/* =================================================
                    VERIFYING
                ================================================== */}

                {status === "verifying" && (
                  <div>
                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF1E8] text-[#F97316] shadow-sm">
                      <span className="h-7 w-7 animate-spin rounded-full border-2 border-[#F97316]/20 border-t-[#F97316]" />
                    </div>

                    <span className="inline-flex items-center gap-2 rounded-full border border-[#E2DED5] bg-[#F7F4EE] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#777773]">
                      Verification in progress
                    </span>

                    <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-[#171A1F]">
                      Verifying your email
                    </h2>

                    <p className="mt-4 leading-7 text-[#777773]">
                      Please wait while FORENSIQ verifies your
                      email address and activates your investigator
                      account.
                    </p>

                    <div className="mt-7 rounded-2xl border border-[#E2DED5] bg-[#FAF9F6] p-4 text-center text-xs font-medium text-[#777773]">
                      Please keep this page open.
                    </div>
                  </div>
                )}

                {/* =================================================
                    SUCCESS
                ================================================== */}

                {status === "success" && (
                  <div>
                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ECFDF5] text-[#0F766E] shadow-sm">
                      <Check size={32} strokeWidth={2.2} />
                    </div>

                    <span className="inline-flex items-center gap-2 rounded-full border border-[#A7F3D0] bg-[#ECFDF5] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#047857]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#0F766E]" />
                      Verification complete
                    </span>

                    <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-[#171A1F]">
                      Email verified
                    </h2>

                    <p className="mt-4 leading-7 text-[#777773]">
                      {message}
                    </p>

                    <Link
                      href="/login"
                      className="mt-7 flex h-13 w-full items-center justify-center rounded-xl bg-[#171A1F] px-5 text-sm font-bold text-white shadow-lg shadow-[#171A1F]/10 transition-all hover:-translate-y-0.5 hover:bg-[#F97316] hover:shadow-xl hover:shadow-[#F97316]/20"
                    >
                      Continue to FORENSIQ
                    </Link>
                  </div>
                )}

                {/* =================================================
                    ERROR
                ================================================== */}

                {(status === "error" ||
                  status === "missing") && (
                  <div>
                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FEF2F2] text-[#DC2626] shadow-sm">
                      <CircleX size={32} strokeWidth={2} />
                    </div>

                    <span className="inline-flex items-center gap-2 rounded-full border border-[#FECACA] bg-[#FEF2F2] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#B91C1C]">
                      Verification unsuccessful
                    </span>

                    <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-[#171A1F]">
                      Verification failed
                    </h2>

                    <p className="mt-4 leading-7 text-[#777773]">
                      {message}
                    </p>

                    <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">

                      <Link
                        href="/login"
                        className="flex h-12 items-center justify-center rounded-xl border border-[#E2DED5] bg-white px-4 text-sm font-bold text-[#171A1F] transition hover:bg-[#F7F4EE]"
                      >
                        Back to login
                      </Link>

                      <Link
                        href="/resend-verification"
                        className="flex h-12 items-center justify-center rounded-xl bg-[#171A1F] px-4 text-sm font-bold text-white shadow-lg shadow-[#171A1F]/10 transition hover:bg-[#F97316] hover:shadow-[#F97316]/20"
                      >
                        Resend email
                      </Link>

                    </div>
                  </div>
                )}

                {/* =================================================
                    SECURITY FOOTER
                ================================================== */}

                <div className="mt-10 border-t border-[#E2DED5] pt-6">
                  <div className="flex items-center justify-center gap-2 text-center text-xs font-semibold text-[#777773]">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F7F4EE] text-[#0F766E]">
                      <ShieldCheck size={15} />
                    </span>

                    Protected FORENSIQ account verification
                  </div>
                </div>

              </div>
            </div>

          </div>

          <div className="h-6 sm:h-8" />

          <div className="flex items-center justify-center gap-2 text-center text-xs text-[#8A9097]">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                status === "success"
                  ? "bg-[#0F766E]"
                  : status === "error" ||
                      status === "missing"
                    ? "bg-red-500"
                    : "bg-[#F97316]"
              }`}
            />

            {status === "success"
              ? "Your email has been verified successfully."
              : status === "error" ||
                  status === "missing"
                ? "The verification link could not be completed."
                : "Your account security is important to us."}
          </div>

        </div>
      </section>
    </main>
  );
}