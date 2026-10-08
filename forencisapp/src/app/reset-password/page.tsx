"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  Check,
  CircleX,
  LockKeyhole,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  /*
   * Get reset token from URL.
   *
   * Example:
   * /reset-password?token=abc123
   */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token");

    if (urlToken) {
      setToken(urlToken);
    } else {
      setErrorMessage("Invalid or missing password reset link.");
    }
  }, []);

  const validateForm = () => {
    let valid = true;

    setPasswordError("");
    setConfirmPasswordError("");

    /*
     * IMPORTANT:
     *
     * We only check whether a password was entered.
     *
     * No:
     * - minimum length
     * - uppercase requirement
     * - lowercase requirement
     * - number requirement
     * - special-character requirement
     * - password strength requirement
     */

    if (!newPassword) {
      setPasswordError("New password is required.");
      valid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your password.");
      valid = false;
    }

    if (
      newPassword &&
      confirmPassword &&
      newPassword !== confirmPassword
    ) {
      setConfirmPasswordError("Passwords do not match.");
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    if (!validateForm()) {
      return;
    }

    if (!token) {
      setErrorMessage(
        "Invalid or missing password reset token.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        "/api/v1/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            token: token,

            /*
             * Send the actual password.
             *
             * Do NOT trim this value.
             * Any non-empty password is allowed by
             * this frontend validation.
             */
            newPassword: newPassword,
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
            "Unable to reset your password. Please try again.",
        );

        return;
      }

      setSuccessMessage(
        data.message ||
          "Your password has been reset successfully.",
      );

      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setErrorMessage(
        "Unable to connect to the server. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F4EE] pt-20 text-[#171A1F]">
      <section className="px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10 lg:px-8 lg:pb-24 lg:pt-12">
        <div className="mx-auto w-full max-w-6xl">

          {/* Top navigation */}
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
              Secure password recovery
            </div>
          </div>

          {/* Main card */}
          <div className="grid min-h-[620px] overflow-hidden rounded-[2rem] border border-[#E2DED5] bg-white shadow-[0_30px_90px_rgba(23,26,31,0.10)] lg:grid-cols-2">

            {/* LEFT PANEL */}
            <div className="relative hidden overflow-hidden bg-[#171A1F] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">

              <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#F97316]/10 blur-3xl" />

              <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-[#0F766E]/10 blur-3xl" />

              <div className="relative z-10">

                <Link
                  href="/"
                  className="mb-14 inline-flex items-center gap-3"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F97316] text-lg font-black text-white">
                    F
                  </span>

                  <span className="text-xl font-bold tracking-tight">
                    FORENSIQ
                  </span>
                </Link>

                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
                  <LockKeyhole size={13} />
                  Password recovery
                </div>

                <h1 className="mt-7 max-w-lg text-4xl font-black leading-[1.05] tracking-tight xl:text-5xl">
                  Create your
                  <br />

                  <span className="text-[#F97316]">
                    new password.
                  </span>
                </h1>

                <p className="mt-6 max-w-md text-base leading-7 text-white/55">
                  Choose a new password for your FORENSIQ
                  investigator account and continue securely.
                </p>

                <div className="mt-10 space-y-5">

                  <div className="flex items-center gap-3 text-sm text-white/80">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-[#F97316]">
                      <Check size={16} />
                    </span>

                    Secure password reset
                  </div>

                  <div className="flex items-center gap-3 text-sm text-white/80">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-[#F97316]">
                      <Check size={16} />
                    </span>

                    Protected reset token
                  </div>

                  <div className="flex items-center gap-3 text-sm text-white/80">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-[#F97316]">
                      <Check size={16} />
                    </span>

                    Restore investigation workspace access
                  </div>

                </div>
              </div>

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

            {/* RIGHT PANEL */}
            <div className="flex items-center justify-center p-6 sm:p-10 lg:p-12 xl:p-16">

              <div className="w-full max-w-md">

                {/* Mobile brand */}
                <div className="mb-8 flex items-center gap-3 lg:hidden">

                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F97316] text-lg font-black text-white">
                    F
                  </span>

                  <span className="text-lg font-bold">
                    FORENSIQ
                  </span>

                </div>

                {/* Header */}
                <div className="mb-8">

                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF1E8] text-[#F97316] shadow-sm">
                    <LockKeyhole size={27} />
                  </div>

                  <h2 className="text-3xl font-black tracking-tight sm:text-[2rem]">
                    Reset password
                  </h2>

                  <p className="mt-3 leading-7 text-[#626A73]">
                    Enter your new password below.
                  </p>

                </div>

                {/* SUCCESS */}
                {successMessage && (
                  <div
                    className="mb-6 rounded-2xl border border-[#A7F3D0] bg-[#ECFDF5] p-4"
                    role="status"
                  >
                    <div className="flex items-start gap-3">

                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-[#0F766E]">
                        <Check size={18} />
                      </span>

                      <div>
                        <p className="text-sm font-bold text-[#065F46]">
                          Password reset successful
                        </p>

                        <p className="mt-1 text-sm leading-5 text-[#047857]">
                          {successMessage}
                        </p>
                      </div>

                    </div>
                  </div>
                )}

                {/* ERROR */}
                {errorMessage && (
                  <div
                    className="mb-6 rounded-2xl border border-[#FECACA] bg-[#FEF2F2] p-4"
                    role="alert"
                  >
                    <div className="flex items-start gap-3">

                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-[#DC2626]">
                        <CircleX size={18} />
                      </span>

                      <div>
                        <p className="text-sm font-bold text-[#991B1B]">
                          Unable to reset password
                        </p>

                        <p className="mt-1 text-sm leading-5 text-[#B91C1C]">
                          {errorMessage}
                        </p>
                      </div>

                    </div>
                  </div>
                )}

                {/* FORM */}
                {!successMessage && (
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                    noValidate
                  >

                    {/* New password */}
                    <div>

                      <label
                        htmlFor="newPassword"
                        className="mb-2 block text-sm font-bold"
                      >
                        New password
                      </label>

                      <div className="relative">

                        <LockKeyhole
                          size={18}
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                        />

                        <input
                          id="newPassword"
                          name="newPassword"
                          type={
                            showPassword
                              ? "text"
                              : "password"
                          }
                          autoComplete="new-password"
                          value={newPassword}
                          onChange={(event) => {
                            setNewPassword(event.target.value);

                            if (passwordError) {
                              setPasswordError("");
                            }

                            if (errorMessage) {
                              setErrorMessage("");
                            }
                          }}
                          placeholder="Enter your new password"
                          disabled={isSubmitting}
                          className={`h-13 w-full rounded-xl border bg-white pl-11 pr-12 text-sm outline-none transition focus:ring-4 ${
                            passwordError
                              ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
                              : "border-[#D9D5CC] focus:border-[#F97316] focus:ring-[#F97316]/10"
                          }`}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword(
                              !showPassword,
                            )
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[#9CA3AF] transition hover:text-[#171A1F]"
                          aria-label={
                            showPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>

                      </div>

                      {passwordError && (
                        <p className="mt-1.5 text-xs font-medium text-red-600">
                          {passwordError}
                        </p>
                      )}

                      <p className="mt-2 text-xs text-[#777773]">
                        Enter any password you want to use.
                      </p>

                    </div>

                    {/* Confirm password */}
                    <div>

                      <label
                        htmlFor="confirmPassword"
                        className="mb-2 block text-sm font-bold"
                      >
                        Confirm password
                      </label>

                      <div className="relative">

                        <LockKeyhole
                          size={18}
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                        />

                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={
                            showConfirmPassword
                              ? "text"
                              : "password"
                          }
                          autoComplete="new-password"
                          value={confirmPassword}
                          onChange={(event) => {
                            setConfirmPassword(
                              event.target.value,
                            );

                            if (confirmPasswordError) {
                              setConfirmPasswordError("");
                            }

                            if (errorMessage) {
                              setErrorMessage("");
                            }
                          }}
                          placeholder="Enter your password again"
                          disabled={isSubmitting}
                          className={`h-13 w-full rounded-xl border bg-white pl-11 pr-12 text-sm outline-none transition focus:ring-4 ${
                            confirmPasswordError
                              ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
                              : "border-[#D9D5CC] focus:border-[#F97316] focus:ring-[#F97316]/10"
                          }`}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(
                              !showConfirmPassword,
                            )
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[#9CA3AF] transition hover:text-[#171A1F]"
                          aria-label={
                            showConfirmPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>

                      </div>

                      {confirmPasswordError && (
                        <p className="mt-1.5 text-xs font-medium text-red-600">
                          {confirmPasswordError}
                        </p>
                      )}

                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#F97316] px-5 text-sm font-bold text-white shadow-lg shadow-[#F97316]/20 transition-all hover:-translate-y-0.5 hover:bg-[#EA580C] hover:shadow-xl disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60"
                    >

                      {isSubmitting ? (
                        <>
                          <span className="h-[18px] w-[18px] animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Resetting...
                        </>
                      ) : (
                        "Reset password"
                      )}

                    </button>

                  </form>
                )}

                {/* Success login */}
                {successMessage && (
                  <Link
                    href="/login"
                    className="mt-6 flex h-13 w-full items-center justify-center rounded-xl bg-[#171A1F] px-5 text-sm font-bold text-white transition hover:bg-[#F97316]"
                  >
                    Continue to login
                  </Link>
                )}

                {/* Links */}
                <div className="mt-7 flex flex-col items-center gap-3 text-sm">

                  <Link
                    href="/login"
                    className="font-semibold text-[#F97316] transition hover:text-[#EA580C]"
                  >
                    Back to login
                  </Link>

                  {!successMessage && (
                    <Link
                      href="/forgot-password"
                      className="text-[#626A73] transition hover:text-[#171A1F]"
                    >
                      Request another reset link
                    </Link>
                  )}

                </div>

                {/* Security footer */}
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

          <div className="h-6 sm:h-8" />

          <div className="flex items-center justify-center gap-2 text-center text-xs text-[#8A9097]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0F766E]" />
            Your account security is important to us.
          </div>

        </div>
      </section>
    </main>
  );
}