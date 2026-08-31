"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import Navbar from "@/app/Navbar";
import Footer from "@/components/Footer";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();

    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const isLoginPage = pathname === "/login";

  const isAdminPage =
    pathname === "/admin" ||
    pathname.startsWith("/admin/");

  const isReviewerPage =
    pathname === "/reviewer" ||
    pathname.startsWith("/reviewer/");

  /*
   * Login, Admin and Reviewer pages are desktop-only.
   */
  const isDesktopOnlyPage =
    isLoginPage ||
    isAdminPage ||
    isReviewerPage;

  /*
   * Mobile restriction
   */
  if (isDesktopOnlyPage && isMobile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect
                x="3"
                y="4"
                width="18"
                height="13"
                rx="2"
              />

              <path d="M8 21h8" />
              <path d="M12 17v4" />
            </svg>
          </div>

          <h1 className="text-2xl font-semibold text-gray-900">
            Desktop View Required
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            This section of the Journal system is available only
            on desktop and laptop screens.
          </p>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Please open this page on a desktop or laptop to continue.
          </p>
        </div>
      </div>
    );
  }

  /*
   * Login, Admin and Reviewer pages:
   * No public Navbar/Footer.
   */
  if (isDesktopOnlyPage) {
    return <>{children}</>;
  }

  /*
   * Public pages:
   * Show Navbar and Footer.
   */
  return (
    <>
      <Navbar />

      {children}

      <Footer />
    </>
  );
}