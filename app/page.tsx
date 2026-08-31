"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  Globe2,
  GraduationCap,
  ShieldCheck,
  Users,
} from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Manuscript Preparation",
    text: "Prepare your manuscript according to JFER formatting guidelines and ensure all required sections are included.",
  },
  {
    step: "02",
    title: "Paper Submission",
    text: "Submit your manuscript through the journal portal or official editorial email.",
  },
  {
    step: "03",
    title: "Editorial Screening",
    text: "The editorial team verifies scope relevance, formatting, plagiarism compliance and submission completeness.",
  },
  {
    step: "04",
    title: "Peer Review Process",
    text: "Expert reviewers evaluate originality, technical quality, contribution and practical significance.",
  },
  {
    step: "05",
    title: "Author Revision",
    text: "Authors address reviewer comments and submit the revised manuscript.",
  },
  {
    step: "06",
    title: "Final Decision",
    text: "The editorial board issues acceptance, revision requests or rejection.",
  },
  {
    step: "07",
    title: "Publication Process",
    text: "Accepted papers undergo formatting, proofreading and publication preparation.",
  },
  {
    step: "08",
    title: "Online Availability",
    text: "Published papers become available through the journal archives.",
  },
];

const reviewStandards = [
  "Originality and novelty of the research",
  "Technical and scientific quality",
  "Relevance to engineering and interdisciplinary domains",
  "Clarity of presentation and organization",
  "Accuracy of methodology and analysis",
  "Practical significance and contribution to the field",
  "Proper citation and referencing practices",
  "Compliance with ethical publishing guidelines",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fafaf9] text-[#151515]">

      {/* =====================================================
          HERO SECTION
      ====================================================== */}
      <section className="relative overflow-hidden bg-[#fafaf9]">

        {/* Background decoration */}
        <div
          className="
            pointer-events-none
            absolute
            -top-40
            -right-40
            h-[420px]
            w-[420px]
            rounded-full
            bg-[#a48768]/[0.05]
            blur-3xl
          "
        />

        <div
          className="
            relative
            mx-auto
            max-w-7xl
            px-6
            pt-8
            pb-12
            md:px-8
            md:pt-12
            md:pb-16
          "
        >

          <div
            className="
              grid
              items-center
              gap-10
              lg:grid-cols-[1.1fr_0.9fr]
              lg:gap-16
            "
          >

            {/* =================================================
                HERO CONTENT
            ================================================== */}
            <div>

              {/* Eyebrow */}
              <div className="mb-5 flex items-center gap-3">

                <span className="h-px w-8 bg-[#a48768]" />

                <span
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.22em]
                    text-[#a48768]
                    md:text-xs
                  "
                >
                  International Open-Access Journal
                </span>

              </div>

              {/* Heading */}
              <h1
                className="
                  max-w-xl
                  text-[2.7rem]
                  font-semibold
                  leading-[0.8]
                  tracking-[-0.04em]
                  sm:text-2xl
                  lg:text-[4rem]
                "
              >
                Journal of Future
                <br />

                <span className="text-[#a48768]">
                  Engineering & Research
                </span>
              </h1>

              {/* Description */}
              <p
                className="
                  mt-2
                  max-w-xl
                  text-sm
                  leading-7
                  text-slate-600
                  md:text-base
                "
              >
                The Journal of Future Engineering and Research (JFER)
                publishes high-quality research across engineering,
                technology, and interdisciplinary sciences.
              </p>

              {/* Buttons */}
              {/* <div className="mt-7 flex flex-wrap gap-3">

                <Link
                  href="/archives"
                  className="
                    group
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    bg-[#151515]
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-white
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    hover:bg-[#292929]
                    hover:shadow-lg
                  "
                >
                  Latest Articles

                  <ArrowRight
                    className="
                      h-4
                      w-4
                      transition-transform
                      duration-300
                      group-hover:translate-x-1
                    "
                  />
                </Link>

                <Link
                  href="/submit"
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-black/10
                    bg-white
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    hover:border-black/20
                    hover:shadow-md
                  "
                >
                  Call for Papers

                  <ArrowUpRight className="h-4 w-4" />
                </Link>

              </div> */}

            </div>


            {/* =================================================
                HERO LOGO
            ================================================== */}
            <div className="flex justify-center lg:justify-end">

              <div
                className="
                  relative
                  flex
                  h-[230px]
                  w-[230px]
                  items-center
                  justify-center
                  rounded-[2rem]
                  border
                  border-black/[0.06]
                  bg-white
                  shadow-[0_20px_55px_rgba(0,0,0,0.08)]
                  sm:h-[350px]
                  sm:w-[350px]
                  md:h-[400px]
                  md:w-[400px]
                "
              >

                {/* Outer ring
                <div
                  className="
                    absolute
                    h-[78%]
                    w-[78%]
                    rounded-full
                    border
                    border-[#a48768]/20
                  "
                /> */}

                {/* Inner ring */}
                {/* <div
                  className="
                    absolute
                    h-[62%]
                    w-[62%]
                    rounded-full
                    border
                    border-[#a48768]/10
                  "
                /> */}

                {/* Logo */}
                <img
                  src="/Journel_logo.png"
                  alt="Journal of Future Engineering and Research"
                  className="
                    relative
                    z-10
                    h-[100%]
                    w-[100%]
                    object-contain
                  "
                />

                {/* JFER label */}
                {/* <div
                  className="
                    absolute
                    bottom-4
                    left-1/2
                    -translate-x-1/2
                    whitespace-nowrap
                    rounded-full
                    bg-[#151515]
                    px-4
                    py-1.5
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.18em]
                    text-white
                  "
                >
                  JFER
                </div> */}

              </div>

            </div>

          </div>
        </div>
      </section>


      {/* =====================================================
          QUICK NAVIGATION
      ====================================================== */}
      <section className="border-y border-black/[0.07] bg-white">

        <div
          className="
            mx-auto
            flex
            max-w-7xl
            flex-col
            items-start
            justify-between
            gap-5
            px-6
            py-5
            sm:flex-row
            sm:items-center
            md:px-8
          "
        >

          <div className="flex items-center gap-3">

            <BookOpen className="h-4 w-4 text-[#a48768]" />

            <p className="text-sm text-slate-600">
              Explore JFER research and submission resources
            </p>

          </div>

          <div className="flex flex-wrap gap-2">

            <QuickLink
              href="/archives"
              label="Latest Articles"
            />

            <QuickLink
              href="/submit"
              label="Call for Papers"
            />

          </div>

        </div>
      </section>


      {/* =====================================================
          SUBMISSION WORKFLOW
      ====================================================== */}
      <section className="relative py-20 md:py-24">

        <div className="mx-auto max-w-7xl px-6 md:px-8">

          <SectionHeader
            eyebrow="Submission Process"
            title="From manuscript to publication."
            description="JFER follows a transparent and systematic submission and review process to support the publication of high-quality research."
          />

          {/* Desktop */}
          <div className="mt-16 hidden lg:block">

            <div className="relative">

              {/* Top connector */}
              <div
                className="
                  absolute
                  left-[6%]
                  right-[6%]
                  top-[30px]
                  h-px
                  bg-black/10
                "
              />

              <div className="grid grid-cols-4 gap-8">

                {steps.slice(0, 4).map((item) => (
                  <WorkflowCard
                    key={item.step}
                    item={item}
                  />
                ))}

              </div>

              <div className="h-20" />

              {/* Bottom connector */}
              <div
                className="
                  absolute
                  bottom-[30px]
                  left-[6%]
                  right-[6%]
                  h-px
                  bg-black/10
                "
              />

              <div className="grid grid-cols-4 gap-8">

                {steps.slice(4).map((item) => (
                  <WorkflowCard
                    key={item.step}
                    item={item}
                    reverse
                  />
                ))}

              </div>

            </div>

          </div>


          {/* Mobile */}
          <div className="mt-10 space-y-3 lg:hidden">

            {steps.map((item) => (
              <details
                key={item.step}
                className="
                  group
                  overflow-hidden
                  rounded-2xl
                  border
                  border-black/[0.07]
                  bg-white
                  shadow-sm
                "
              >

                <summary
                  className="
                    flex
                    cursor-pointer
                    list-none
                    items-center
                    gap-4
                    p-5
                  "
                >

                  <span
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-[#151515]
                      text-xs
                      font-semibold
                      text-white
                    "
                  >
                    {item.step}
                  </span>

                  <span className="flex-1 text-sm font-semibold">
                    {item.title}
                  </span>

                  <ChevronDown
                    className="
                      h-4
                      w-4
                      text-slate-400
                      transition-transform
                      duration-300
                      group-open:rotate-180
                    "
                  />

                </summary>

                <div className="pb-5 pl-[76px] pr-5">

                  <p className="text-sm leading-7 text-slate-500">
                    {item.text}
                  </p>

                </div>

              </details>
            ))}

          </div>

        </div>
      </section>


      {/* =====================================================
          ACADEMIC LEADERSHIP
      ====================================================== */}
      <section className="bg-[#111111] py-20 text-white md:py-24">

        <div className="mx-auto max-w-7xl px-6 md:px-8">

          <SectionHeader
            dark
            eyebrow="Academic Leadership"
            title="Guided by expertise and academic integrity."
            description="JFER is guided by experienced academic and research professionals who contribute to the quality, direction, and integrity of the journal."
          />

          {/* Three leadership categories */}
          <div className="mt-12 grid gap-5 md:grid-cols-3">

            <LeadershipCard
              icon={<GraduationCap className="h-5 w-5" />}
              eyebrow="01"
              title="Chief Editor"
              description="Provides overall academic leadership, oversees editorial operations, maintains publication ethics, and makes final editorial decisions."
            />

            <LeadershipCard
              icon={<Users className="h-5 w-5" />}
              eyebrow="02"
              title="Associate Editor"
              description="Supports manuscript handling, coordinates peer review, evaluates submissions, and assists with editorial decisions."
            />

            <LeadershipCard
              icon={<ShieldCheck className="h-5 w-5" />}
              eyebrow="03"
              title="Advisory Member"
              description="Provides academic guidance, strategic advice, subject expertise, and supports the long-term development of the journal."
            />

          </div>

          <div className="mt-8">

            <Link
              href="/editorial"
              className="
                group
                inline-flex
                items-center
                gap-2
                text-sm
                font-semibold
                text-white
                transition-colors
                hover:text-[#c4a98a]
              "
            >
              Explore the Editorial Board

              <ArrowRight
                className="
                  h-4
                  w-4
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                "
              />
            </Link>

          </div>

        </div>
      </section>


      {/* =====================================================
          EDITORIAL & ETHICS
      ====================================================== */}
      <section className="py-20 md:py-24">

        <div className="mx-auto max-w-7xl px-6 md:px-8">

          <div className="grid gap-6 lg:grid-cols-2">

            {/* Editorial */}
            <InfoPanel
              icon={<Users className="h-5 w-5" />}
              eyebrow="Editorial Governance"
              title="Editorial & Reviewer Information"
            >

              <p>
                The Editor-in-Chief, Associate Editors, and Review Board
                Members are responsible for maintaining the academic quality,
                transparency, and integrity of the journal publication
                process.
              </p>

              <p>
                Reviewers are selected based on their subject expertise,
                research contributions, and academic experience in relevant
                engineering and technology domains.
              </p>

              <p>
                All manuscripts are evaluated through a fair, unbiased, and
                confidential review process, focusing on originality,
                technical quality, research significance, clarity, and
                relevance to the journal scope.
              </p>

            </InfoPanel>


            {/* Ethics */}
            <InfoPanel
              icon={<ShieldCheck className="h-5 w-5" />}
              eyebrow="Research Integrity"
              title="Publication Ethics"
            >

              <p>
                JFER is committed to maintaining ethical publishing practices
                and ensuring that every published article meets recognized
                academic and research standards.
              </p>

              <p>
                Editorial decisions are made independently based on academic
                merit, reviewer recommendations, ethical compliance, and the
                overall contribution of the work to the engineering and
                research community.
              </p>

            </InfoPanel>

          </div>

        </div>
      </section>


      {/* =====================================================
          REVIEW STANDARDS
      ====================================================== */}
      <section className="pb-20 md:pb-24">

        <div className="mx-auto max-w-7xl px-6 md:px-8">

          <div
            className="
              relative
              overflow-hidden
              rounded-[2.5rem]
              border
              border-black/[0.07]
              bg-white
              p-7
              shadow-[0_25px_70px_rgba(0,0,0,0.06)]
              md:p-12
            "
          >

            {/* Decoration */}
            <div
              className="
                pointer-events-none
                absolute
                -right-32
                -top-32
                h-72
                w-72
                rounded-full
                bg-[#a48768]/[0.06]
                blur-3xl
              "
            />

            <div className="relative">

              <div className="max-w-2xl">

                <div className="flex items-center gap-3">

                  <span className="h-px w-8 bg-[#a48768]" />

                  <span
                    className="
                      text-xs
                      font-semibold
                      uppercase
                      tracking-[0.24em]
                      text-[#a48768]
                    "
                  >
                    Quality Assurance
                  </span>

                </div>

                <h2
                  className="
                    mt-5
                    text-3xl
                    font-semibold
                    tracking-tight
                    md:text-4xl
                  "
                >
                  Journal Review Standards
                </h2>

                <p className="mt-5 text-sm leading-7 text-slate-500 md:text-base">
                  Every manuscript is evaluated against core academic,
                  technical, ethical, and presentation standards.
                </p>

              </div>


              {/* Standards */}
              <div className="mt-10 grid gap-3 md:grid-cols-2">

                {reviewStandards.map((item) => (
                  <div
                    key={item}
                    className="
                      group
                      flex
                      items-start
                      gap-4
                      rounded-2xl
                      border
                      border-black/[0.07]
                      bg-[#fafaf9]
                      p-4
                      transition-all
                      duration-300
                      hover:border-[#a48768]/30
                      hover:bg-white
                      hover:shadow-sm
                    "
                  >

                    <span
                      className="
                        flex
                        h-7
                        w-7
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-[#a48768]/10
                      "
                    >
                      <Check className="h-3.5 w-3.5 text-[#8f7054]" />
                    </span>

                    <span className="text-sm leading-6 text-slate-600">
                      {item}
                    </span>

                  </div>
                ))}

              </div>


              {/* Warning */}
              <div
                className="
                  mt-10
                  rounded-2xl
                  border
                  border-red-200
                  bg-red-50
                  p-5
                  md:p-6
                "
              >

                <div className="flex items-start gap-4">

                  <div
                    className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-red-100
                    "
                  >
                    <ShieldCheck className="h-4 w-4 text-red-600" />
                  </div>

                  <p className="text-sm leading-7 text-red-800">

                    <span className="font-bold uppercase tracking-wide">
                      Note:
                    </span>{" "}

                    Manuscripts identified with plagiarism, unethical
                    practices, duplicate publication, or poor research quality
                    may be rejected during the review process. Authors may be
                    requested to revise and resubmit manuscripts based on
                    reviewer recommendations. JFER aims to ensure a
                    transparent, professional, and timely review process while
                    promoting innovative and impactful engineering research.

                  </p>

                </div>

              </div>

            </div>
          </div>

        </div>
      </section>


      {/* =====================================================
          FINAL CTA
      ====================================================== */}
      <section className="pb-24">

        <div className="mx-auto max-w-7xl px-6 md:px-8">

          <div
            className="
              relative
              overflow-hidden
              rounded-[2.5rem]
              bg-[#151515]
              px-7
              py-12
              text-white
              md:px-12
              md:py-14
            "
          >

            {/* Decorative circles */}
            <div
              className="
                pointer-events-none
                absolute
                -right-20
                -top-20
                h-64
                w-64
                rounded-full
                border
                border-[#a48768]/20
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                -bottom-32
                -right-10
                h-72
                w-72
                rounded-full
                border
                border-white/5
              "
            />

            <div
              className="
                relative
                flex
                flex-col
                items-start
                justify-between
                gap-8
                md:flex-row
                md:items-center
              "
            >

              <div className="max-w-2xl">

                <div className="flex items-center gap-3">

                  <Globe2 className="h-4 w-4 text-[#c4a98a]" />

                  <span
                    className="
                      text-xs
                      uppercase
                      tracking-[0.22em]
                      text-[#c4a98a]
                    "
                  >
                    JFER
                  </span>

                </div>

                <h2 className="mt-4 text-2xl font-semibold md:text-3xl">
                  Ready to submit your research?
                </h2>

                <p className="mt-3 text-sm leading-6 text-white/50">
                  Prepare your manuscript and submit your research for
                  consideration by the JFER editorial team.
                </p>

              </div>

              <Link
                href="/submit"
                className="
                  group
                  inline-flex
                  shrink-0
                  items-center
                  gap-3
                  rounded-full
                  bg-white
                  px-6
                  py-3.5
                  text-sm
                  font-semibold
                  text-black
                  transition-all
                  duration-300
                  hover:scale-[1.03]
                  hover:shadow-xl
                "
              >
                Submit Your Paper

                <ArrowRight
                  className="
                    h-4
                    w-4
                    transition-transform
                    duration-300
                    group-hover:translate-x-1
                  "
                />
              </Link>

            </div>

          </div>

        </div>
      </section>

    </main>
  );
}


/* ============================================================
   HERO STAT
============================================================ */

function HeroStat({
  value,
  label,
  border = false,
}: {
  value: string;
  label: string;
  border?: boolean;
}) {
  return (
    <div
      className={`
        px-4
        ${border ? "border-l border-black/10" : ""}
      `}
    >

      <p className="text-lg font-semibold tracking-tight">
        {value}
      </p>

      <p
        className="
          mt-1
          text-[10px]
          uppercase
          tracking-[0.15em]
          text-slate-400
        "
      >
        {label}
      </p>

    </div>
  );
}


/* ============================================================
   QUICK LINK
============================================================ */

function QuickLink({
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
        inline-flex
        items-center
        gap-2
        rounded-full
        border
        border-black/10
        px-4
        py-2
        text-xs
        font-semibold
        transition-all
        duration-300
        hover:border-[#a48768]/40
        hover:bg-[#a48768]/5
      "
    >

      {label}

      <ArrowUpRight className="h-3.5 w-3.5" />

    </Link>
  );
}


/* ============================================================
   SECTION HEADER
============================================================ */

function SectionHeader({
  eyebrow,
  title,
  description,
  dark = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  dark?: boolean;
}) {
  return (
    <div className="max-w-3xl">

      <div className="flex items-center gap-3">

        <span
          className={`
            h-px
            w-9
            ${dark ? "bg-[#c4a98a]" : "bg-[#a48768]"}
          `}
        />

        <span
          className={`
            text-xs
            font-semibold
            uppercase
            tracking-[0.24em]
            ${dark ? "text-[#c4a98a]" : "text-[#a48768]"}
          `}
        >
          {eyebrow}
        </span>

      </div>

      <h2
        className={`
          mt-5
          text-3xl
          font-semibold
          leading-tight
          tracking-[-0.035em]
          md:text-5xl
          ${dark ? "text-white" : "text-[#151515]"}
        `}
      >
        {title}
      </h2>

      <p
        className={`
          mt-5
          text-sm
          leading-7
          md:text-base
          ${dark ? "text-white/50" : "text-slate-500"}
        `}
      >
        {description}
      </p>

    </div>
  );
}


/* ============================================================
   WORKFLOW CARD
============================================================ */

function WorkflowCard({
  item,
  reverse = false,
}: {
  item: (typeof steps)[number];
  reverse?: boolean;
}) {
  return (
    <div
      className={`
        group
        relative
        flex
        flex-col
        ${reverse ? "items-start" : ""}
      `}
    >

      {/* Number */}
      <div
        className="
          relative
          z-10
          flex
          h-[60px]
          w-[60px]
          items-center
          justify-center
          rounded-full
          border
          border-black/10
          bg-white
          text-sm
          font-semibold
          shadow-sm
          transition-all
          duration-300
          group-hover:border-[#151515]
          group-hover:bg-[#151515]
          group-hover:text-white
          group-hover:shadow-lg
        "
      >
        {item.step}
      </div>

      {/* Content */}
      <div className="mt-6 pr-5">

        <h3 className="text-base font-semibold leading-6">
          {item.title}
        </h3>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          {item.text}
        </p>

      </div>

    </div>
  );
}


/* ============================================================
   LEADERSHIP CARD
============================================================ */

function LeadershipCard({
  icon,
  eyebrow,
  title,
  description,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div
      className="
        group
        relative
        min-h-[250px]
        rounded-[1.75rem]
        border
        border-white/10
        bg-white/[0.045]
        p-7
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-white/15
        hover:bg-white/[0.075]
      "
    >

      {/* Number */}
      <span
        className="
          absolute
          right-6
          top-6
          text-[10px]
          font-semibold
          tracking-[0.2em]
          text-white/25
        "
      >
        {eyebrow}
      </span>

      {/* Icon */}
      <div
        className="
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-xl
          border
          border-[#a48768]/20
          bg-[#a48768]/10
          text-[#c4a98a]
        "
      >
        {icon}
      </div>

      {/* Title */}
      <h3 className="mt-8 text-xl font-semibold tracking-tight">
        {title}
      </h3>

      {/* Description */}
      <p className="mt-4 text-sm leading-7 text-white/45">
        {description}
      </p>

    </div>
  );
}


/* ============================================================
   INFO PANEL
============================================================ */

function InfoPanel({
  icon,
  eyebrow,
  title,
  children,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="
        group
        rounded-[2rem]
        border
        border-black/[0.07]
        bg-white
        p-7
        shadow-sm
        transition-all
        duration-300
        hover:border-black/10
        hover:shadow-xl
        md:p-10
      "
    >

      {/* Icon */}
      <div
        className="
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-xl
          bg-[#a48768]/10
          text-[#8f7054]
        "
      >
        {icon}
      </div>

      {/* Eyebrow */}
      <p
        className="
          mt-7
          text-xs
          font-semibold
          uppercase
          tracking-[0.2em]
          text-[#a48768]
        "
      >
        {eyebrow}
      </p>

      {/* Title */}
      <h3 className="mt-2 text-2xl font-semibold tracking-tight">
        {title}
      </h3>

      {/* Content */}
      <div className="mt-6 space-y-4 text-sm leading-7 text-slate-500">
        {children}
      </div>

    </div>
  );
}