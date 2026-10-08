"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Fingerprint, Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/SocialIcons";

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
      "Forencis Platform — Contact Request",
    );

    const body = encodeURIComponent(`Hello Forencis Team,

I would like to get in touch regarding the Forencis digital evidence platform.

My email: ${trimmedEmail}

Thank you.`);

    window.location.href =
      `mailto:contact@forencis.com?subject=${subject}&body=${body}`;
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter") {
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
              className="inline-flex items-center gap-3 transition-opacity hover:opacity-80"
              aria-label="Forencis — Home"
            >
              {/* FORENCIS LOGO */}
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F97316]">
                <Fingerprint
                  size={21}
                  strokeWidth={2}
                  className="text-white"
                />
              </div>

              <div>
                <p className="text-sm font-black tracking-[0.18em] text-white">
                  FORENCIS
                </p>

                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                  Digital Evidence
                </p>
              </div>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-relaxed text-[#626A73]">
              A secure digital evidence platform designed for evidence
              storage, integrity verification, chain-of-custody tracking,
              and forensic auditability.
            </p>

            {/* Platform status */}
            <div className="mt-5 flex items-center gap-2 text-xs text-[#626A73]">
              <span className="h-2 w-2 rounded-full bg-[#22C55E]" />

              <span>Evidence integrity focused</span>
            </div>

            {/* Social / Platform Links */}
            <div className="mt-6 flex items-center gap-3">

              {/* GitHub */}
              <a
                href="https://github.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="
                  rounded-sm
                  border border-[#626A73]/30
                  p-2
                  text-[#626A73]
                  transition-colors
                  hover:border-[#F97316]/40
                  hover:text-[#F97316]
                "
                aria-label="GitHub"
              >
                <GithubIcon size={16} />
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="
                  rounded-sm
                  border border-[#626A73]/30
                  p-2
                  text-[#626A73]
                  transition-colors
                  hover:border-[#F97316]/40
                  hover:text-[#F97316]
                "
                aria-label="LinkedIn"
              >
                <LinkedinIcon size={16} />
              </a>

              {/* Email */}
              <a
                href="mailto:contact@forencis.com"
                className="
                  rounded-sm
                  border border-[#626A73]/30
                  p-2
                  text-[#626A73]
                  transition-colors
                  hover:border-[#F97316]/40
                  hover:text-[#F97316]
                "
                aria-label="Email"
              >
                <Mail size={16} strokeWidth={1.8} />
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
                  className="
                    text-sm
                    text-[#626A73]
                    transition-colors
                    hover:text-[#F7F4EE]
                  "
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
                onChange={(event) => setEmail(event.target.value)}
                onKeyDown={handleKeyDown}
                className="
                  min-w-0
                  flex-1
                  rounded-l-sm
                  border border-[#626A73]/30
                  bg-[#626A73]/10
                  px-3 py-2
                  text-sm
                  text-[#F7F4EE]
                  placeholder-[#626A73]
                  focus:border-[#F97316]/50
                  focus:outline-none
                "
                aria-label="Your email address"
              />

              <button
                type="button"
                onClick={handleContact}
                className="
                  rounded-r-sm
                  bg-[#F97316]
                  p-2
                  text-white
                  transition-colors
                  hover:bg-[#EA6C0E]
                "
                aria-label="Send email"
              >
                <ArrowRight size={16} />
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
                  className="
                    text-sm
                    text-[#626A73]
                    transition-colors
                    hover:text-[#F7F4EE]
                  "
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
        <div
          className="
            flex
            flex-col
            items-center
            justify-between
            gap-4
            border-t
            border-[#626A73]/20
            pt-8
            sm:flex-row
          "
        >
          <p className="text-sm text-[#626A73]">
            &copy; {new Date().getFullYear()} Forencis. All rights reserved.
          </p>

          <div className="flex items-center gap-5">
            <Link
              href="/privacy"
              className="
                text-xs
                text-[#626A73]
                transition-colors
                hover:text-[#F7F4EE]
              "
            >
              Privacy
            </Link>

            <Link
              href="/terms"
              className="
                text-xs
                text-[#626A73]
                transition-colors
                hover:text-[#F7F4EE]
              "
            >
              Terms
            </Link>

            <span
              className="
                font-mono
                text-xs
                uppercase
                tracking-widest
                text-[#626A73]/60
              "
            >
              Digital Evidence Platform
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}