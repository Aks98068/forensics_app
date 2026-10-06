"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Features", href: "/features" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Security", href: "/security" },
  { label: "Documentation", href: "/documentation" },
  { label: "Contact", href: "/contact" },
];

/**
 * ForensicsLogo
 *
 * Simple text-based wordmark for the digital forensics platform.
 *
 * Desktop:
 * DIGITAL
 * FORENSICS
 *
 * Mobile:
 * DF
 */

interface ForensicsLogoProps {
  className?: string;
  compact?: boolean;
}

function ForensicsLogo({
  className = "",
  compact = false,
}: ForensicsLogoProps) {
  if (compact) {
    return (
      <svg
        viewBox="0 0 70 40"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Digital Forensics"
      >
        <text
          x="0"
          y="28"
          fontFamily="Arial, Helvetica, sans-serif"
          fontWeight="800"
          fontSize="28"
          letterSpacing="-1"
        >
          <tspan fill="#171A1F">D</tspan>
          <tspan fill="#F97316">F</tspan>
        </text>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 220 48"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Digital Forensics"
    >
      <text
        x="0"
        y="20"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="800"
        fontSize="15"
        letterSpacing="1.5"
        fill="#171A1F"
      >
        DIGITAL
      </text>

      <text
        x="0"
        y="38"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="800"
        fontSize="15"
        letterSpacing="1.5"
        fill="#F97316"
      >
        FORENSICS
      </text>

      {/* Small forensic accent line */}
      <path
        d="M122 41 C 150 45, 180 43, 207 37"
        stroke="#F97316"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /*
   * Detect page scrolling
   */
  useEffect(() => {
    const handler = () => {
      setScrolled(window.scrollY > 20);
    };

    handler();

    window.addEventListener("scroll", handler);

    return () => {
      window.removeEventListener("scroll", handler);
    };
  }, []);

  /*
   * Close mobile menu when navigating
   */
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  /*
   * Active navigation item
   */
  const isActive = (href: string) => {
    return href === "/"
      ? pathname === "/"
      : pathname.startsWith(href);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#F7F4EE]/95 backdrop-blur-sm border-b border-[#E2DED5] shadow-sm"
          : "bg-[#F7F4EE]/80 backdrop-blur-sm"
      }`}
    >
      <nav className="max-w-[1280px] mx-auto px-6 lg:px-8 flex items-center justify-between h-16">

        {/* =====================================================
            FORENSICS LOGO
        ====================================================== */}

        <Link
          href="/"
          className="shrink-0 transition-opacity hover:opacity-80"
          aria-label="Digital Forensics — Home"
        >
          {/* Mobile Logo */}
          <ForensicsLogo
            className="h-9 w-auto sm:hidden"
            compact
          />

          {/* Desktop Logo */}
          <ForensicsLogo
            className="hidden h-9 w-auto sm:block"
          />
        </Link>

        {/* =====================================================
            DESKTOP NAVIGATION
        ====================================================== */}

        <div className="hidden xl:flex items-center gap-1 mx-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative px-3 py-1.5 text-[13px] font-medium transition-colors rounded-sm ${
                isActive(link.href)
                  ? "text-[#F97316]"
                  : "text-[#626A73] hover:text-[#171A1F]"
              }`}
            >
              {link.label}

              {isActive(link.href) && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#F97316] rounded-full"
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}
            </Link>
          ))}
        </div>

        {/* =====================================================
            LOGIN / REGISTER
        ====================================================== */}

        <div className="hidden xl:flex items-center gap-2 shrink-0">

          <Link
            href="/login"
            className="inline-flex items-center px-4 py-1.5 text-[13px] font-semibold text-[#171A1F] rounded-sm hover:text-[#F97316] transition-colors duration-200"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="inline-flex items-center px-4 py-1.5 text-[13px] font-semibold border border-[#171A1F] text-[#171A1F] rounded-sm hover:bg-[#171A1F] hover:text-white transition-all duration-200"
          >
            Register
          </Link>

        </div>

        {/* =====================================================
            MOBILE HAMBURGER
        ====================================================== */}

        <button
          type="button"
          className="xl:hidden p-2 text-[#171A1F] rounded-sm hover:bg-[#E2DED5]/50 transition-colors"
          onClick={() => setOpen((prev) => !prev)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* =====================================================
          MOBILE MENU
      ====================================================== */}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{
              opacity: 0,
              height: 0,
            }}
            animate={{
              opacity: 1,
              height: "auto",
            }}
            exit={{
              opacity: 0,
              height: 0,
            }}
            transition={{
              duration: 0.2,
            }}
            className="xl:hidden overflow-hidden bg-[#F7F4EE] border-b border-[#E2DED5]"
          >
            <div className="max-w-[1280px] mx-auto px-6 py-4 flex flex-col gap-1">

              {/* Navigation Links */}

              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2.5 text-sm font-medium rounded-sm transition-colors ${
                    isActive(link.href)
                      ? "text-[#F97316] bg-orange-50"
                      : "text-[#171A1F] hover:bg-[#E2DED5]/40"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* =================================================
                  MOBILE AUTH BUTTONS
              ================================================== */}

              <div className="mt-2 grid grid-cols-2 gap-2">

                <Link
                  href="/login"
                  className="px-3 py-2.5 text-sm font-semibold border border-[#171A1F] text-[#171A1F] rounded-sm text-center hover:bg-[#171A1F] hover:text-white transition-all"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="px-3 py-2.5 text-sm font-semibold bg-[#F97316] border border-[#F97316] text-white rounded-sm text-center hover:bg-[#EA580C] hover:border-[#EA580C] transition-all"
                >
                  Register
                </Link>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}