
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Fingerprint,
} from "lucide-react";
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
 * FORENCIS LOGO
 *
 * Same logo style used in the dashboard sidebar.
 *
 * Desktop:
 * [ Fingerprint ] FORENCIS
 *                 Digital Evidence
 *
 * Mobile:
 * [ Fingerprint ] FORENCIS
 */
interface ForensicsLogoProps {
  className?: string;
  compact?: boolean;
}

function ForensicsLogo({
  className = "",
  compact = false,
}: ForensicsLogoProps) {
  return (
    <div className={`flex items-center ${compact ? "gap-2" : "gap-3"} ${className}`}>
      {/* Logo Icon */}
      <div
        className={`
          flex shrink-0 items-center justify-center
          rounded-xl bg-[#F97316]
          ${compact ? "h-9 w-9" : "h-10 w-10"}
        `}
      >
        <Fingerprint
          size={compact ? 19 : 21}
          strokeWidth={2}
          className="text-white"
        />
      </div>

      {/* Wordmark */}
      <div className="min-w-0">
        <p
          className={`
            truncate font-black tracking-[0.18em]
            text-[#171A1F]
            ${compact ? "text-xs" : "text-sm"}
          `}
        >
          FORENCIS
        </p>

        {!compact && (
          <p className="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8A84]">
            Digital Evidence
          </p>
        )}
      </div>
    </div>
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
      <nav className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-6 lg:px-8">

        {/* =====================================================
            FORENCIS LOGO
        ====================================================== */}

        <Link
          href="/"
          className="shrink-0 transition-opacity hover:opacity-80"
          aria-label="FORENCIS — Digital Evidence Platform"
        >
          {/* Mobile Logo */}
          <ForensicsLogo
            className="sm:hidden"
            compact
          />

          {/* Desktop Logo */}
          <ForensicsLogo
            className="hidden sm:flex"
          />
        </Link>

        {/* =====================================================
            DESKTOP NAVIGATION
        ====================================================== */}

        <div className="mx-4 hidden items-center gap-1 xl:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative rounded-sm px-3 py-1.5 text-[13px] font-medium transition-colors ${
                isActive(link.href)
                  ? "text-[#F97316]"
                  : "text-[#626A73] hover:text-[#171A1F]"
              }`}
            >
              {link.label}

              {isActive(link.href) && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-[#F97316]"
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

        <div className="hidden shrink-0 items-center gap-2 xl:flex">

          <Link
            href="/login"
            className="inline-flex items-center rounded-sm px-4 py-1.5 text-[13px] font-semibold text-[#171A1F] transition-colors duration-200 hover:text-[#F97316]"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="inline-flex items-center rounded-sm border border-[#171A1F] px-4 py-1.5 text-[13px] font-semibold text-[#171A1F] transition-all duration-200 hover:bg-[#171A1F] hover:text-white"
          >
            Register
          </Link>

        </div>

        {/* =====================================================
            MOBILE HAMBURGER
        ====================================================== */}

        <button
          type="button"
          className="rounded-sm p-2 text-[#171A1F] transition-colors hover:bg-[#E2DED5]/50 xl:hidden"
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
            className="overflow-hidden border-b border-[#E2DED5] bg-[#F7F4EE] xl:hidden"
          >
            <div className="mx-auto flex max-w-[1280px] flex-col gap-1 px-6 py-4">

              {/* Mobile Navigation Links */}

              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-sm px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "bg-orange-50 text-[#F97316]"
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
                  className="rounded-sm border border-[#171A1F] px-3 py-2.5 text-center text-sm font-semibold text-[#171A1F] transition-all hover:bg-[#171A1F] hover:text-white"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="rounded-sm border border-[#F97316] bg-[#F97316] px-3 py-2.5 text-center text-sm font-semibold text-white transition-all hover:border-[#EA580C] hover:bg-[#EA580C]"
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

