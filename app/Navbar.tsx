"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Always show navbar at the very top
      if (currentScrollY <= 20) {
        setShowNavbar(true);
        lastScrollY = currentScrollY;
        return;
      }

      // Keep navbar visible while mobile menu is open
      if (menuOpen) {
        lastScrollY = currentScrollY;
        return;
      }

      // Scrolling DOWN → hide navbar
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setShowNavbar(false);
      }

      // Scrolling UP → show navbar
      if (currentScrollY < lastScrollY) {
        setShowNavbar(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [menuOpen]);

  return (
    <>
      {/* =====================================================
          NAVBAR SPACE
          Keeps page content from going underneath the navbar
      ====================================================== */}
      <div className="h-[100px] md:h-[116px]">
        <nav
          className={`
            fixed
            top-0
            left-0
            right-0
            z-50

            px-4
            pt-3
            md:pt-4

            transition-transform
            duration-500
            ease-[cubic-bezier(0.22,1,0.36,1)]

            ${
              showNavbar
                ? "translate-y-0"
                : "-translate-y-[120%]"
            }
          `}
        >
          <div className="max-w-7xl mx-auto flex items-center">

            {/* =================================================
                LOGO
            ================================================== */}
            <div
              className="
                relative
                z-10
                shrink-0

                -mr-8
                md:-mr-10
              "
            >
              <Link
                href="/"
                className="
                  w-[72px]
                  h-[72px]

                  md:w-[88px]
                  md:h-[88px]

                  rounded-full
                  bg-white

                  shadow-[0_12px_35px_rgba(0,0,0,0.25)]

                  flex
                  items-center
                  justify-center

                  overflow-hidden

                  transition-transform
                  duration-300

                  hover:scale-105
                "
              >
                <img
                  src="/Journel_logo.png"
                  alt="JFER Logo"
                  className="
                    w-full
                    h-full
                    object-contain
                  "
                />
              </Link>
            </div>

            {/* =================================================
                MAIN NAVBAR
            ================================================== */}
            <div
              className="
                flex-1

                h-[58px]
                md:h-[64px]

                rounded-full

                bg-black/85
                backdrop-blur-2xl

                border
                border-white/10

                shadow-[0_15px_45px_rgba(0,0,0,0.28)]

                flex
                items-center
                justify-between

                pl-12
                md:pl-16

                pr-2
                md:pr-3
              "
            >

              {/* =================================================
                  DESKTOP NAVIGATION
              ================================================== */}
              <div
                className="
                  hidden
                  md:flex
                  items-center

                  gap-7
                  lg:gap-9

                  text-sm
                  font-medium
                  text-white
                "
              >

                {/* HOME */}
                <NavLink href="/" label="Home" />

                {/* ABOUT */}
                <NavLink
                  href="/about"
                  label="About Us"
                />

                {/* EDITORIAL */}
                <NavLink
                  href="/editorial"
                  label="Editorial Board"
                />

                {/* ARTICLES */}
                <NavLink
                  href="/archives"
                  label="Articles"
                />

                {/* CONTACT */}
                <NavLink
                  href="/contact"
                  label="Contact Us"
                />

              </div>

              {/* =================================================
                  SUBMIT PAPER BUTTON
              ================================================== */}
              <Link
                href="/submit"
                className="
                  hidden
                  md:flex

                  items-center
                  justify-center

                  h-11

                  px-7

                  rounded-full

                  bg-white
                  text-black

                  text-sm
                  font-semibold

                  shadow-sm

                  transition-all
                  duration-300

                  hover:scale-[1.04]
                  hover:shadow-lg
                "
              >
                Submit Paper
              </Link>

              {/* =================================================
                  MOBILE MENU BUTTON
              ================================================== */}
              <button
                type="button"
                aria-label="Toggle navigation menu"
                aria-expanded={menuOpen}
                onClick={() => {
                  setMenuOpen((prev) => !prev);
                  setShowNavbar(true);
                }}
                className="
                  md:hidden

                  ml-auto
                  mr-3

                  relative

                  w-7
                  h-7

                  flex
                  items-center
                  justify-center
                "
              >

                {/* TOP LINE */}
                <span
                  className={`
                    absolute
                    left-0

                    w-7
                    h-[2px]

                    bg-white
                    rounded-full

                    transition-all
                    duration-300
                    ease-out

                    ${
                      menuOpen
                        ? "rotate-45 top-3"
                        : "top-1"
                    }
                  `}
                />

                {/* MIDDLE LINE */}
                <span
                  className={`
                    absolute
                    left-0
                    top-3

                    w-7
                    h-[2px]

                    bg-white
                    rounded-full

                    transition-all
                    duration-300

                    ${
                      menuOpen
                        ? "opacity-0"
                        : "opacity-100"
                    }
                  `}
                />

                {/* BOTTOM LINE */}
                <span
                  className={`
                    absolute
                    left-0

                    w-7
                    h-[2px]

                    bg-white
                    rounded-full

                    transition-all
                    duration-300
                    ease-out

                    ${
                      menuOpen
                        ? "-rotate-45 top-3"
                        : "top-5"
                    }
                  `}
                />

              </button>

            </div>
          </div>
        </nav>
      </div>

      {/* =====================================================
          MOBILE BACKDROP
      ====================================================== */}
      <div
        onClick={() => setMenuOpen(false)}
        className={`
          fixed
          inset-0

          z-40
          md:hidden

          bg-black/50
          backdrop-blur-sm

          transition-all
          duration-300

          ${
            menuOpen
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
          }
        `}
      />

      {/* =====================================================
          MOBILE MENU
      ====================================================== */}
      <div
        className={`
          fixed

          top-[88px]

          left-4
          right-4

          z-50
          md:hidden

          bg-black/95
          backdrop-blur-2xl

          border
          border-white/10

          rounded-3xl

          shadow-[0_20px_60px_rgba(0,0,0,0.45)]

          p-6

          transition-all
          duration-300
          ease-out

          ${
            menuOpen
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 -translate-y-4 scale-95 pointer-events-none"
          }
        `}
      >

        <div className="flex flex-col gap-5 text-white">

          {/* HOME */}
          <MobileNavLink
            href="/"
            label="Home"
            delay={50}
            menuOpen={menuOpen}
            onClick={() => setMenuOpen(false)}
          />

          {/* ARTICLES */}
          <MobileNavLink
            href="/archives"
            label="Articles"
            delay={100}
            menuOpen={menuOpen}
            onClick={() => setMenuOpen(false)}
          />

          {/* EDITORIAL */}
          <MobileNavLink
            href="/editorial"
            label="Editorial Board"
            delay={150}
            menuOpen={menuOpen}
            onClick={() => setMenuOpen(false)}
          />

          {/* ABOUT */}
          <MobileNavLink
            href="/about"
            label="About Us"
            delay={200}
            menuOpen={menuOpen}
            onClick={() => setMenuOpen(false)}
          />

          {/* CONTACT */}
          <MobileNavLink
            href="/contact"
            label="Contact Us"
            delay={250}
            menuOpen={menuOpen}
            onClick={() => setMenuOpen(false)}
          />

          {/* SUBMIT PAPER */}
          <Link
            href="/submit"
            onClick={() => setMenuOpen(false)}
            className="
              mt-3

              bg-white
              text-black

              text-center

              py-3

              rounded-full

              font-semibold

              transition-all
              duration-300

              hover:scale-[1.02]
            "
            style={{
              transitionDelay: menuOpen
                ? "300ms"
                : "0ms",
            }}
          >
            Submit Paper
          </Link>

        </div>
      </div>
    </>
  );
}

/* ============================================================
   DESKTOP NAV LINK
============================================================ */

function NavLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="
        relative
        py-2

        transition-colors
        duration-300

        hover:text-white/60

        after:absolute
        after:left-0
        after:-bottom-1

        after:h-[1px]
        after:w-0

        after:bg-white

        after:transition-all
        after:duration-300

        hover:after:w-full
      "
    >
      {label}
    </Link>
  );
}

/* ============================================================
   MOBILE NAV LINK
============================================================ */

function MobileNavLink({
  href,
  label,
  delay,
  menuOpen,
  onClick,
}: {
  href: string;
  label: string;
  delay: number;
  menuOpen: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="
        transition-all
        duration-300

        hover:text-gray-300
        hover:translate-x-2
      "
      style={{
        transitionDelay: menuOpen
          ? `${delay}ms`
          : "0ms",
      }}
    >
      {label}
    </Link>
  );
}