import Link from "next/link";
import {
  ArrowUpRight,
  Mail,
  BookOpen,
  ShieldCheck,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative mt-20 bg-[#0d0d0d] text-white overflow-hidden">

      {/* =====================================================
          TOP DECORATIVE LINE
      ====================================================== */}
      <div className="absolute top-0 left-0 right-0 h-px bg-white/10" />

      {/* =====================================================
          MAIN FOOTER
      ====================================================== */}
      <div className="max-w-7xl mx-auto px-6 md:px-8">

        <div className="py-16 md:py-20">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-16">

            {/* =================================================
                JOURNAL INFORMATION
            ================================================== */}
            <div className="lg:col-span-6">

              {/* Small Label */}
              <div className="flex items-center gap-3 mb-5">
                <span className="w-8 h-px bg-[#a48768]" />

                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#a48768]">
                  JFER
                </p>
              </div>

              {/* Title */}
              <h2
                className="
                  text-2xl
                  md:text-3xl

                  font-semibold

                  leading-tight

                  tracking-tight

                  max-w-xl
                "
              >
                Journal of Future Engineering
                <br className="hidden md:block" />
                and Research
              </h2>

              {/* Description */}
              <p
                className="
                  mt-6

                  max-w-2xl

                  text-sm
                  md:text-[15px]

                  leading-7

                  text-gray-400
                "
              >
                The Journal of Future Engineering and Research (JFER) is an
                international peer-reviewed open-access journal dedicated to
                promoting innovative research in engineering, technology, and
                interdisciplinary sciences.
              </p>

              <p
                className="
                  mt-4

                  max-w-2xl

                  text-sm
                  md:text-[15px]

                  leading-7

                  text-gray-400
                "
              >
                JFER provides a platform for researchers, academicians,
                industry professionals, and students to publish original
                research, review articles, and technical studies that
                contribute to scientific and technological advancement.
              </p>

              {/* Journal Tags */}
              <div className="flex flex-wrap gap-2 mt-7">

                <span
                  className="
                    inline-flex
                    items-center
                    gap-2

                    rounded-full

                    border
                    border-white/10

                    bg-white/[0.03]

                    px-4
                    py-2

                    text-xs
                    text-gray-400
                  "
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Peer Reviewed
                </span>

                <span
                  className="
                    inline-flex
                    items-center
                    gap-2

                    rounded-full

                    border
                    border-white/10

                    bg-white/[0.03]

                    px-4
                    py-2

                    text-xs
                    text-gray-400
                  "
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Open Access
                </span>

                <span
                  className="
                    inline-flex
                    items-center

                    rounded-full

                    border
                    border-white/10

                    bg-white/[0.03]

                    px-4
                    py-2

                    text-xs
                    text-gray-400
                  "
                >
                  International Journal
                </span>

              </div>
            </div>

            {/* =================================================
                RESOURCES
            ================================================== */}
            <div className="lg:col-span-3">

              <h3
                className="
                  text-sm
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-white
                "
              >
                Resources
              </h3>

              <div className="w-8 h-px bg-[#a48768] mt-4 mb-6" />

              <div className="flex flex-col gap-4">

                <FooterLink
                  href="/manuscript template.docx"
                  label="Manuscript Template"
                />

                <FooterLink
                  href="/guidelines"
                  label="Author Guidelines"
                />

                <FooterLink
                  href="/archives"
                  label="Published Articles"
                />

                <FooterLink
                  href="/editorial"
                  label="Editorial Board"
                />

                <FooterLink
                  href="/admin"
                  label="Admin Panel"
                />

                <FooterLink
                  href="/login"
                  label="Reviewer Panel"
                />

              </div>
            </div>

            {/* =================================================
                CONTACT
            ================================================== */}
            <div className="lg:col-span-3">

              <h3
                className="
                  text-sm
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-white
                "
              >
                Contact
              </h3>

              <div className="w-8 h-px bg-[#a48768] mt-4 mb-6" />

              {/* Email */}
              <div className="flex items-start gap-3">

                <div
                  className="
                    shrink-0

                    w-9
                    h-9

                    rounded-xl

                    border
                    border-white/10

                    bg-white/[0.04]

                    flex
                    items-center
                    justify-center
                  "
                >
                  <Mail className="w-4 h-4 text-[#a48768]" />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                    Email
                  </p>

                  <a
                    href="mailto:editor@jfer.ac.in"
                    className="
                      block
                      text-sm
                      text-gray-300

                      transition-colors
                      duration-300

                      hover:text-white
                    "
                  >
                    editor@jfer.ac.in
                  </a>

                  <a
                    href="mailto:support@jfer.ac.in"
                    className="
                      block
                      mt-1

                      text-sm
                      text-gray-300

                      transition-colors
                      duration-300

                      hover:text-white
                    "
                  >
                    support@jfer.ac.in
                  </a>
                </div>

              </div>

              {/* Submission CTA */}
              <Link
                href="/submit"
                className="
                  group

                  inline-flex
                  items-center
                  justify-between

                  w-full

                  mt-8

                  rounded-2xl

                  border
                  border-white/10

                  bg-white/[0.04]

                  px-5
                  py-4

                  transition-all
                  duration-300

                  hover:bg-white/[0.08]
                  hover:border-white/20
                "
              >

                <div>
                  <p className="text-sm font-semibold text-white">
                    Submit your research
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Send your manuscript to JFER
                  </p>
                </div>

                <div
                  className="
                    w-20
                    h-10

                    rounded-full

                    bg-white

                    text-black

                    flex
                    items-center
                    justify-center

                    transition-transform
                    duration-300

                    group-hover:translate-x-1
                  "
                >
                  <ArrowUpRight className="w-4 h-4" />
                </div>

              </Link>

            </div>

          </div>
        </div>

        {/* =====================================================
            BOTTOM BAR
        ====================================================== */}
        <div
          className="
            border-t
            border-white/10

            py-6

            flex
            flex-col
            md:flex-row

            justify-between
            items-start
            md:items-center

            gap-4
          "
        >

          {/* Copyright */}
          <p
            className="
              text-xs
              md:text-sm

              text-gray-500

              leading-6
            "
          >
            © 2026 Journal of Future Engineering and Research (JFER).
            <br className="md:hidden" />
            {" "}All rights reserved.
          </p>

          {/* Right Side */}
          <div
            className="
              flex
              flex-wrap
              items-center

              gap-x-5
              gap-y-2

              text-xs
              md:text-sm

              text-gray-500
            "
          >
            <span>Peer-Reviewed</span>

            <span className="w-1 h-1 rounded-full bg-gray-700" />

            <span>Open Access</span>

            <span className="w-1 h-1 rounded-full bg-gray-700" />

            <span>International Journal</span>
          </div>

        </div>

      </div>
    </footer>
  );
}

/* ============================================================
   FOOTER LINK
============================================================ */

function FooterLink({
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
        group

        inline-flex
        items-center
        gap-2

        w-fit

        text-sm
        text-gray-400

        transition-colors
        duration-300

        hover:text-white
      "
    >
      <span
        className="
          w-0
          h-px

          bg-[#a48768]

          transition-all
          duration-300

          group-hover:w-5
        "
      />

      <span>{label}</span>
    </Link>
  );
}