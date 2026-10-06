"use client";

import Link from "next/link";
import { useState } from "react";

function MailIcon({
  size = 16,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M4 7l8 6 8-6" />
    </svg>
  );
}

function ArrowRightIcon({
  size = 16,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="M13 5l7 7-7 7" />
    </svg>
  );
}

function GithubIcon({
  size = 16,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.866-.014-1.7-2.782.604-3.369-1.342-3.369-1.342-.455-1.157-1.11-1.466-1.11-1.466-.908-.621.069-.608.069-.608 1.004.071 1.532 1.031 1.532 1.031.892 1.529 2.341 1.087 2.91.831.091-.647.35-1.087.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844a9.6 9.6 0 012.504.337c1.909-1.294 2.748-1.025 2.748-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.744 0 .267.18.578.688.48A10.001 10.001 0 0022 12C22 6.477 17.523 2 12 2z" />
    </svg>
  );
}

function LinkedinIcon({
  size = 16,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M6.94 8.5H3.56V20h3.38V8.5zM5.25 3A1.98 1.98 0 003.27 5c0 1.1.88 2 1.97 2 1.1 0 1.98-.9 1.98-2A1.98 1.98 0 005.25 3zM20.44 13.41c0-3.47-1.85-5.09-4.32-5.09-1.99 0-2.88 1.1-3.38 1.86V8.5H9.36V20h3.38v-6.17c0-1.63.31-3.2 2.32-3.2 1.98 0 2.01 1.86 2.01 3.31V20h3.37v-6.59z" />
    </svg>
  );
}

export default function Footer() {
  const [email, setEmail] = useState("");

  const platformLinks = [
    {
      label: "Evidence Storage",
      href: "/features/evidence-storage",
    },
    {
      label: "Chain of Custody",
      href: "/features/chain-of-custody",
    },
    {
      label: "Integrity Verification",
      href: "/features/integrity-verification",
    },
    {
      label: "Audit Trail",
      href: "/features/audit-trail",
    },
  ];

  const navigationLinks = [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "About",
      href: "/about",
    },
    {
      label: "Features",
      href: "/features",
    },
    {
      label: "Security",
      href: "/security",
    },
    {
      label: "Documentation",
      href: "/documentation",
    },
    {
      label: "Contact",
      href: "/contact",
    },
  ];

  const handleContact = () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      alert("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      alert("Please enter a valid email address.");
      return;
    }

    const subject = encodeURIComponent(
      "Forencis Platform — Contact Request"
    );

    const body = encodeURIComponent(
      `Hello Forencis Team,

I would like to get in touch regarding the Forencis digital evidence platform.

My email: ${trimmedEmail}

Thank you.`
    );

    window.location.href =
      `mailto:contact@forencis.com?subject=${subject}&body=${body}`;
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      handleContact();
    }
  };

  return (
    <footer className="bg-[#171A1F] text-[#F7F4EE]">
      <div className="mx-auto max-w-[1280px] px-6 pb-8 pt-16 lg:px-8">

        {/* =====================================================
            MAIN FOOTER
        ====================================================== */}

        <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">

          {/* =================================================
              BRAND
          ================================================== */}

          <div className="lg:col-span-2">

            <Link
              href="/"
              className="inline-flex items-center gap-2 transition-opacity hover:opacity-80"
            >
              <span className="font-mono text-lg font-bold tracking-tight">
                FORENCIS
              </span>

              <span className="h-2 w-2 rounded-full bg-[#F97316]" />
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#626A73]">
              A secure digital evidence platform designed for evidence
              storage, integrity verification, chain-of-custody tracking,
              and forensic auditability.
            </p>

            {/* Platform status */}

            <div className="mt-5 flex items-center gap-2 text-xs text-[#626A73]">
              <span className="h-2 w-2 rounded-full bg-[#22C55E]" />

              <span>
                Evidence integrity focused
              </span>
            </div>

            {/* Social / Platform Links */}

            <div className="mt-6 flex items-center gap-3">

              {/* GitHub */}

              <a
                href="https://github.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm border border-[#626A73]/30 p-2 text-[#626A73] transition-colors hover:border-[#F97316]/40 hover:text-[#F97316]"
                aria-label="GitHub"
              >
                <GithubIcon size={16} />
              </a>

              {/* LinkedIn */}

              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm border border-[#626A73]/30 p-2 text-[#626A73] transition-colors hover:border-[#F97316]/40 hover:text-[#F97316]"
                aria-label="LinkedIn"
              >
                <LinkedinIcon size={16} />
              </a>

              {/* Email */}

              <a
                href="mailto:contact@forencis.com"
                className="rounded-sm border border-[#626A73]/30 p-2 text-[#626A73] transition-colors hover:border-[#F97316]/40 hover:text-[#F97316]"
                aria-label="Email"
              >
                <MailIcon size={16} />
              </a>
            </div>
          </div>

          {/* =================================================
              PLATFORM
          ================================================== */}

          <div>
            <h4 className="mb-4 font-mono text-xs uppercase tracking-widest text-[#F97316]">
              Platform
            </h4>

            <nav className="flex flex-col gap-2">

              {platformLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-[#626A73] transition-colors hover:text-[#F7F4EE]"
                >
                  {link.label}
                </Link>
              ))}

            </nav>
          </div>

          {/* =================================================
              GET IN TOUCH
          ================================================== */}

          <div>

            <h4 className="mb-4 font-mono text-xs uppercase tracking-widest text-[#F97316]">
              GET IN TOUCH
            </h4>

            <p className="mb-4 text-base font-semibold text-[#F7F4EE]">
              Secure your evidence.
            </p>

            {/* Email Input */}

            <div className="flex items-center">

              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-w-0 flex-1 rounded-l-sm border border-[#626A73]/30 bg-[#626A73]/10 px-3 py-2 text-sm text-[#F7F4EE] placeholder-[#626A73] focus:border-[#F97316]/50 focus:outline-none"
                aria-label="Your email address"
              />

              <button
                type="button"
                onClick={handleContact}
                className="rounded-r-sm bg-[#F97316] p-2 text-white transition-colors hover:bg-[#EA6C0E]"
                aria-label="Send email"
              >
                <ArrowRightIcon size={16} />
              </button>

            </div>

            <p className="mt-2 text-xs text-[#626A73]">
              Enter your email and your mail client will open.
            </p>

            {/* Navigation */}

            <nav className="mt-6 flex flex-col gap-2">

              {navigationLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-[#626A73] transition-colors hover:text-[#F7F4EE]"
                >
                  {link.label}
                </Link>
              ))}

            </nav>

          </div>
        </div>

        {/* =====================================================
            BOTTOM BAR
        ====================================================== */}

        <div className="flex flex-col items-center justify-between gap-4 border-t border-[#626A73]/20 pt-8 sm:flex-row">

          <p className="text-sm text-[#626A73]">
            &copy; {new Date().getFullYear()} Forencis. All rights reserved.
          </p>

          <div className="flex items-center gap-5">

            <Link
              href="/privacy"
              className="text-xs text-[#626A73] transition-colors hover:text-[#F7F4EE]"
            >
              Privacy
            </Link>

            <Link
              href="/terms"
              className="text-xs text-[#626A73] transition-colors hover:text-[#F7F4EE]"
            >
              Terms
            </Link>

            <span className="font-mono text-xs uppercase tracking-widest text-[#626A73]/60">
              Digital Evidence Platform
            </span>

          </div>

        </div>
      </div>
    </footer>
  );
}