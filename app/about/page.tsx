"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  FileText,
  Globe2,
  GraduationCap,
  Scale,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

/* ============================================================
   DATA
============================================================ */

const researchAreas = [
  "Computer Science and Engineering",
  "Artificial Intelligence & Machine Learning",
  "Data Science & Big Data Analytics",
  "Electronics & Communication Engineering",
  "Electrical & Electronics Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Information Technology",
  "Internet of Things (IoT)",
  "Cyber Security",
  "Cloud Computing",
  "Embedded Systems",
  "Robotics & Automation",
  "Image Processing & Computer Vision",
  "Wireless Communication",
  "Renewable Energy Systems",
  "Blockchain Technology",
  "Biomedical Engineering",
  "Smart Systems & Industry 4.0",
  "Interdisciplinary Engineering Research",
];

const objectives = [
  "To publish original and high-quality research in engineering, technology, and interdisciplinary sciences.",
  "To encourage innovation and the exchange of new ideas among researchers worldwide.",
  "To provide a reliable platform for researchers, academicians, industry professionals, and students to share their work.",
  "To support research that addresses real-world challenges and contributes to technological progress.",
  "To promote ethical publishing and a fair, transparent peer-review process.",
  "To encourage collaboration between academia, industry, and research organizations.",
  "To make quality research freely accessible to the global scientific community.",
  "To contribute to the advancement of engineering and technology through impactful research.",
];

const acceptanceCriteria = [
  "Presents original and unpublished research.",
  "Falls within the scope of the journal.",
  "Demonstrates scientific and technical quality.",
  "Follows the journal's formatting and ethical guidelines.",
  "Successfully addresses the reviewers' comments and editorial recommendations.",
];

const checklist = [
  "The manuscript is original and has not been published or submitted elsewhere.",
  "The manuscript is prepared using the JFER Manuscript Template.",
  "The title, abstract, keywords, figures, and tables are complete and properly formatted.",
  "All authors' names, affiliations, and email addresses are correctly provided.",
  "References are formatted according to the journal guidelines.",
  "All figures and tables are properly numbered and cited in the text.",
  "Ethical approval and informed consent statements are included where applicable.",
  "A Conflict-of-Interest Declaration has been provided.",
  "The manuscript complies with the journal's plagiarism policy.",
  "All required documents have been uploaded before submission.",
];

const publicationPolicies = [
  "Publication Ethics",
  "Peer Review Policy",
  "Open Access Policy",
  "Copyright Policy",
  "Retraction and Correction Policy",
  "Data Availability Policy",
];

const timeline = [
  {
    stage: "Initial Editorial Screening",
    duration: "5 Days",
  },
  {
    stage: "Double-Blind Peer Review",
    duration: "4–6 Weeks",
  },
  {
    stage: "Revision by Authors",
    duration: "1–3 Weeks",
  },
  {
    stage: "Final Editorial Decision",
    duration: "1 Week",
  },
  {
    stage: "Online Publication",
    duration: "Within 1–2 Weeks after Acceptance",
  },
];

const ethicsPolicies = [
  {
    title: "Publication Ethics Policy",
    text: "JFER is committed to publishing original, high-quality research while maintaining integrity, transparency, and ethical standards throughout the editorial and publication process.",
  },
  {
    title: "Peer Review Policy",
    text: "All submitted manuscripts undergo a rigorous Double-Blind Peer Review by independent experts. Editorial decisions are based solely on the originality, scientific quality, and relevance of the manuscript.",
  },
  {
    title: "COPE Guidelines",
    text: "JFER follows the principles and best practices of the Committee on Publication Ethics (COPE) to ensure ethical publishing and responsible editorial practices.",
  },
  {
    title: "Open Access Policy",
    text: "JFER provides immediate and free access to all published articles, enabling researchers worldwide to read, download, and share scholarly work without subscription or access fees.",
  },
  {
    title: "Plagiarism Policy",
    text: "Every manuscript is screened using plagiarism detection software before peer review. Manuscripts containing plagiarism, duplicate publication, or excessive similarity will be rejected.",
  },
  {
    title: "Authorship Policy",
    text: "Only individuals who have made significant intellectual contributions to the research should be listed as authors. All authors must approve the final manuscript before submission.",
  },
  {
    title: "Conflict of Interest Policy",
    text: "Authors, reviewers, and editors must disclose any financial, professional, or personal relationships that could influence the review or publication process.",
  },
  {
    title: "Copyright Policy",
    text: "Authors retain the copyright of their work while granting JFER the right to publish and distribute the accepted manuscript according to the journal's publication policy.",
  },
  {
    title: "Data Availability Policy",
    text: "Authors should maintain accurate research data and provide supporting data when requested by the editors or reviewers, wherever applicable.",
  },
  {
    title: "AI-Assisted Content Policy",
    text: "Authors may use AI-based tools only for language improvement or writing assistance. AI tools must not be listed as authors, and authors remain fully responsible for the originality, accuracy, and integrity of the submitted work.",
  },
  {
    title: "Duplicate Submission Policy",
    text: "Manuscripts submitted to JFER must not be under review or published elsewhere. Simultaneous submissions to multiple journals are considered unethical and will result in immediate rejection.",
  },
  {
    title: "Research Misconduct Policy",
    text: "JFER strictly prohibits research misconduct, including plagiarism, data fabrication, data falsification, image manipulation, citation manipulation, and unethical research practices.",
  },
  {
    title: "Retraction and Correction Policy",
    text: "If significant errors or ethical concerns are identified after publication, JFER may issue corrections, expressions of concern, or retract the article in accordance with accepted publishing standards.",
  },
  {
    title: "Appeals and Complaints Policy",
    text: "Authors may appeal editorial decisions by submitting a justified request to the Editor-in-Chief. All appeals and complaints will be reviewed fairly, transparently, and independently.",
  },
  {
    title: "Privacy Policy",
    text: "Personal information collected during manuscript submission, peer review, and publication is used solely for journal operations. JFER protects user data and does not share personal information with third parties except where required by law.",
  },
];

/* ============================================================
   PAGE
============================================================ */

export default function AboutPage() {
  const [showActionPopup, setShowActionPopup] = useState(false);

  useEffect(() => {
    const showTimer = window.setTimeout(() => {
      setShowActionPopup(true);
    }, 1800);

    const hideTimer = window.setTimeout(() => {
      setShowActionPopup(false);
    }, 13800);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fafaf9] text-[#151515]">

      {/* ========================================================
          HERO
      ======================================================== */}

      <section className="relative overflow-hidden border-b border-black/[0.06] bg-[#fafaf9]">

        <div className="pointer-events-none absolute -right-40 -top-40 h-[420px] w-[420px] rounded-full bg-[#a48768]/[0.055] blur-3xl" />

        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[360px] w-[360px] rounded-full bg-[#a48768]/[0.035] blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-10 md:px-8 md:pb-24 md:pt-14">

          <div className="max-w-4xl">

            <div className="mb-6 flex items-center gap-3">

              <span className="h-px w-10 bg-[#a48768]" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#a48768] md:text-xs">
                About JFER
              </span>

            </div>

            <h1 className="max-w-4xl text-[2.7rem] font-semibold leading-[1.06] tracking-[-0.045em] sm:text-5xl md:text-6xl lg:text-[4.4rem]">

              Advancing Engineering Research Through{" "}

              <span className="text-[#a48768]">
                Open Knowledge Sharing
              </span>

            </h1>

            <p className="mt-7 max-w-3xl text-base leading-7 text-slate-600 md:text-lg md:leading-8">
              The Journal of Future Engineering and Research (JFER)
              provides a global platform for publishing original research,
              review articles, and technological innovations across
              engineering and applied sciences.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">

              <span className="rounded-full bg-[#111111] px-4 py-2 text-xs font-medium text-white">
                Engineering
              </span>

              <span className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-medium text-slate-600">
                Technology
              </span>

              <span className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-medium text-slate-600">
                Applied Sciences
              </span>

            </div>

          </div>

        </div>

      </section>


      {/* ========================================================
          ABOUT THE JOURNAL
      ======================================================== */}

      <section className="bg-white py-16 md:py-24">

        <div className="mx-auto max-w-7xl px-6 md:px-8">

          <div className="grid gap-10 lg:grid-cols-[0.35fr_1.65fr] lg:gap-16">

            {/* Section intro */}

            <div>

              <div className="flex items-center gap-3">

                <span className="text-[10px] font-semibold tracking-[0.18em] text-[#a48768]">
                  01
                </span>

                <span className="h-px w-8 bg-[#a48768]" />

              </div>

              <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                About The Journal
              </p>

            </div>


            {/* Main content */}

            <div>

              <h2 className="max-w-4xl text-3xl font-semibold leading-tight tracking-[-0.04em] md:text-5xl">
                Journal of Future Engineering and Research
              </h2>

              <p className="mt-6 max-w-4xl text-base leading-8 text-slate-600 md:text-lg">
                The Journal of Future Engineering and Research (JFER)
                provides a global platform for publishing original research,
                review articles, and technological innovations across
                engineering and applied sciences.
              </p>

              <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-500 md:text-base">
                The journal is committed to advancing knowledge through
                quality research, ethical publishing, and rigorous peer review.
              </p>


              {/* Mission / Vision */}

              <div className="mt-10 grid gap-5 md:grid-cols-2">

                <div className="rounded-[1.5rem] bg-[#111111] p-7 text-white md:p-8">

                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c4a98a]">
                    Mission
                  </p>

                  <h3 className="mt-3 text-2xl font-semibold">
                    Our Mission
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-white/50 md:text-base">
                    To provide a reliable and professional platform for
                    publishing quality research in engineering, technology,
                    and interdisciplinary fields while promoting innovation,
                    academic excellence, and ethical research practices.
                  </p>

                </div>


                <div className="rounded-[1.5rem] border border-black/[0.07] bg-[#fafaf9] p-7 md:p-8">

                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#a48768]">
                    Vision
                  </p>

                  <h3 className="mt-3 text-2xl font-semibold">
                    Our Vision
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-slate-500 md:text-base">
                    To become a globally recognized journal that supports
                    advanced research, encourages knowledge sharing, and
                    contributes to future technological and engineering
                    development.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ========================================================
          OBJECTIVES
      ======================================================== */}

      <section className="border-y border-black/[0.05] bg-[#fafaf9] py-16 md:py-24">

        <div className="mx-auto max-w-7xl px-6 md:px-8">

          <SectionLabel
            number="02"
            label="Our Objectives"
          />

          <div className="mt-5 max-w-3xl">

            <h2 className="text-3xl font-semibold tracking-[-0.035em] md:text-4xl">
              What JFER aims to achieve
            </h2>

          </div>


          <div className="mt-10 grid gap-4 md:grid-cols-2">

            {objectives.map((objective, index) => (

              <div
                key={objective}
                className="flex gap-4 rounded-[1.5rem] border border-black/[0.07] bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-[#a48768]/30 hover:shadow-[0_15px_40px_rgba(0,0,0,0.05)]"
              >

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#111111] text-[10px] font-semibold text-white">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <p className="text-sm leading-7 text-slate-600">
                  {objective}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* ========================================================
          AIM & SCOPE
      ======================================================== */}

      <section className="bg-[#111111] py-16 text-white md:py-24">

        <div className="mx-auto max-w-7xl px-6 md:px-8">

          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">

            <div>

              <SectionLabel
                number="03"
                label="Aim & Scope"
                dark
              />

              <h2 className="mt-5 text-3xl font-semibold tracking-[-0.035em] md:text-4xl">
                Areas of Publication
              </h2>

              <p className="mt-4 max-w-md text-sm leading-7 text-white/45">
                JFER welcomes research contributions across engineering,
                technology, applied sciences, and interdisciplinary domains.
              </p>

            </div>


            <div className="grid gap-2 sm:grid-cols-2">

              {researchAreas.map((area, index) => (

                <div
                  key={area}
                  className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition duration-300 hover:border-[#a48768]/40 hover:bg-white/[0.06]"
                >

                  <div className="flex gap-3">

                    <span className="text-[9px] font-semibold text-[#a48768]">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="text-sm leading-6 text-white/65">
                      {area}
                    </span>

                  </div>

                </div>

              ))}

            </div>

          </div>

        </div>

      </section>


      {/* ========================================================
          EDITORIAL LEADERSHIP
      ======================================================== */}

      <section className="bg-white py-16 md:py-24">

        <div className="mx-auto max-w-7xl px-6 md:px-8">

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

            <div className="max-w-2xl">

              <SectionLabel
                number="04"
                label="Editorial Leadership"
              />

              <h2 className="mt-5 text-3xl font-semibold tracking-[-0.035em] md:text-4xl">
                Guided by academic expertise
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-500 md:text-base">
                JFER's editorial structure supports academic quality,
                transparent review, and responsible scholarly publishing.
              </p>

            </div>

            <Link
              href="/editorial"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-[#8f7054]"
            >
              View Editorial Board

              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>

          </div>


          <div className="mt-10 grid gap-5 md:grid-cols-3">

            <LeadershipCard
              number="01"
              icon={<GraduationCap className="h-5 w-5" />}
              title="Chief Editor"
              text="Provides overall academic leadership, oversees editorial operations, maintains publication ethics, and guides final editorial decisions."
            />

            <LeadershipCard
              number="02"
              icon={<Users className="h-5 w-5" />}
              title="Associate Editor"
              text="Supports manuscript handling, coordinates peer review, evaluates submissions, and assists with editorial decisions."
            />

            <LeadershipCard
              number="03"
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Advisory Member"
              text="Provides academic guidance, strategic advice, subject expertise, and supports the long-term development of the journal."
            />

          </div>

        </div>

      </section>


      {/* ========================================================
          PEER REVIEW
      ======================================================== */}

      <section className="border-y border-black/[0.05] bg-[#fafaf9] py-16 md:py-24">

        <div className="mx-auto max-w-7xl px-6 md:px-8">

          <SectionLabel
            number="05"
            label="Peer Review Process"
          />

          <div className="mt-5 max-w-3xl">

            <h2 className="text-3xl font-semibold tracking-[-0.035em] md:text-4xl">
              Fair, transparent & rigorous review
            </h2>

            <p className="mt-5 text-sm leading-7 text-slate-500 md:text-base">
              At The Journal of Future Engineering and Research (JFER),
              every manuscript undergoes a fair, transparent, and rigorous
              Double-Blind Peer Review process to ensure the publication
              of high-quality and original research.
            </p>

          </div>


          <div className="mt-10 grid gap-5 lg:grid-cols-3">

            <ReviewCard
              label="Double-Blind Review"
              title="Independent Evaluation"
              icon={<ShieldCheck className="h-5 w-5" />}
            >
              The identities of both authors and reviewers remain
              confidential throughout the review process, ensuring an
              unbiased evaluation based solely on the scientific merit
              of the work.
            </ReviewCard>

            <ReviewCard
              label="Review Duration"
              title="4–6 Weeks"
              icon={<BookOpen className="h-5 w-5" />}
            >
              All submitted manuscripts are reviewed by at least two
              independent experts in the relevant field. Authors can
              expect the initial review decision within 4–6 weeks of
              manuscript submission.
            </ReviewCard>

            <ReviewCard
              label="Evaluation"
              title="Scientific Merit"
              icon={<Scale className="h-5 w-5" />}
            >
              Reviewers evaluate originality, technical quality,
              relevance, clarity, and overall contribution to the
              discipline.
            </ReviewCard>

          </div>


          <div className="mt-5 rounded-[1.75rem] border border-black/[0.07] bg-white p-7 md:p-9">

            <h3 className="text-2xl font-semibold">
              Editorial Decision Process
            </h3>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-500">
              After receiving the reviewers' recommendations, the
              Editor-in-Chief or Handling Editor carefully evaluates the
              manuscript and makes one of the following decisions:
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

              {[
                "Accept",
                "Minor Revision",
                "Major Revision",
                "Reject",
              ].map((decision) => (

                <div
                  key={decision}
                  className="rounded-2xl border border-black/[0.07] bg-[#fafaf9] px-5 py-4 text-center text-sm font-semibold"
                >
                  {decision}
                </div>

              ))}

            </div>

          </div>


          <div className="mt-5 rounded-[1.75rem] bg-[#111111] p-7 text-white md:p-9">

            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c4a98a]">
              Acceptance Criteria
            </p>

            <h3 className="mt-3 text-2xl font-semibold">
              Publication Standard
            </h3>

            <div className="mt-7 grid gap-4 md:grid-cols-2">

              {acceptanceCriteria.map((criterion) => (

                <div
                  key={criterion}
                  className="flex items-start gap-3"
                >

                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#a48768]/15">
                    <Check className="h-3 w-3 text-[#c4a98a]" />
                  </span>

                  <p className="text-sm leading-6 text-white/60">
                    {criterion}
                  </p>

                </div>

              ))}

            </div>

          </div>

        </div>

      </section>


      {/* ========================================================
          AUTHOR GUIDELINES
      ======================================================== */}

      <section className="bg-white py-16 md:py-24">

        <div className="mx-auto max-w-7xl px-6 md:px-8">

          <SectionLabel
            number="06"
            label="Author Guidelines"
          />

          <div className="mt-5 max-w-3xl">

            <h2 className="text-3xl font-semibold tracking-[-0.035em] md:text-4xl">
              Prepare your manuscript correctly
            </h2>

            <p className="mt-5 text-sm leading-7 text-slate-500 md:text-base">
              To facilitate a smooth submission process, authors are
              requested to review the following resources and ensure
              that their manuscripts comply with the journal's guidelines
              before submission.
            </p>

          </div>


          <div className="mt-10 rounded-[1.75rem] border border-black/[0.07] bg-[#fafaf9] p-7 md:p-9">

            <div className="flex items-center gap-4">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#111111] text-[#c4a98a]">
                <Check className="h-5 w-5" />
              </div>

              <div>

                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a48768]">
                  Before Submission
                </p>

                <h3 className="mt-1 text-xl font-semibold">
                  Submission Checklist
                </h3>

              </div>

            </div>


            <div className="mt-8 grid gap-x-10 gap-y-4 md:grid-cols-2">

              {checklist.map((item) => (

                <div
                  key={item}
                  className="flex items-start gap-3"
                >

                  <Check className="mt-1 h-4 w-4 shrink-0 text-[#a48768]" />

                  <p className="text-sm leading-6 text-slate-600">
                    {item}
                  </p>

                </div>

              ))}

            </div>

          </div>


          <div className="mt-5 grid gap-5 md:grid-cols-2">

            <ResourceCard
              icon={<FileText className="h-5 w-5" />}
              title="Manuscript Template"
              description="Download the official manuscript template to prepare your manuscript according to the journal's formatting requirements."
              href="/manuscript template.docx"
              action="Download Template"
            />

            <ResourceCard
              icon={<BookOpen className="h-5 w-5" />}
              title="Author Guidelines"
              description="Review the journal's submission and publication requirements before preparing your manuscript."
              href="/guidelines"
              action="View Guidelines"
            />

          </div>

        </div>

      </section>


      {/* ========================================================
          PUBLICATION POLICIES
      ======================================================== */}

      <section className="border-y border-black/[0.05] bg-[#fafaf9] py-16 md:py-24">

        <div className="mx-auto max-w-7xl px-6 md:px-8">

          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">

            <div>

              <SectionLabel
                number="07"
                label="Publication Policies"
              />

              <h2 className="mt-5 text-3xl font-semibold tracking-[-0.035em] md:text-4xl">
                Responsible scholarly publishing
              </h2>

              <p className="mt-5 text-sm leading-7 text-slate-500">
                JFER follows a set of publication policies designed
                to support research integrity, transparency, fairness,
                and responsible editorial practices.
              </p>

            </div>


            <div className="grid gap-3 sm:grid-cols-2">

              {publicationPolicies.map((policy, index) => (

                <div
                  key={policy}
                  className="rounded-2xl border border-black/[0.07] bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-[#a48768]/30 hover:shadow-md"
                >

                  <span className="text-[10px] font-semibold tracking-[0.18em] text-[#a48768]">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <h3 className="mt-4 text-sm font-semibold">
                    {policy}
                  </h3>

                </div>

              ))}

            </div>

          </div>

        </div>

      </section>


      {/* ========================================================
          APC
      ======================================================== */}

      <section className="py-16 md:py-20">

        <div className="mx-auto max-w-7xl px-6 md:px-8">

          <div className="relative overflow-hidden rounded-[2rem] bg-[#111111] px-7 py-11 text-white md:px-10">

            <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full border border-[#a48768]/15" />

            <div className="relative max-w-3xl">

              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c4a98a]">
                Article Processing Charges
              </p>

              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] md:text-4xl">
                No Submission or Publication Fee
              </h2>

              <p className="mt-5 text-sm leading-7 text-white/50 md:text-base">
                JFER does not charge any submission fee or publication fee.
                All accepted articles are published free of charge following
                a successful double-blind peer-review process.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ========================================================
          PUBLICATION TIMELINE
      ======================================================== */}

      <section className="border-y border-black/[0.05] bg-white py-16 md:py-24">

        <div className="mx-auto max-w-7xl px-6 md:px-8">

          <div className="mx-auto max-w-3xl text-center">

            <SectionLabel
              number="08"
              label="Publication Timeline"
              centered
            />

            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.035em] md:text-4xl">
              Typical publication process
            </h2>

            <p className="mt-5 text-sm leading-7 text-slate-500">
              The typical publication process is outlined below.
              The timeline may vary depending on the review process
              and the quality of revisions.
            </p>

          </div>


          <div className="mx-auto mt-10 max-w-4xl overflow-hidden rounded-[1.75rem] border border-black/[0.07]">

            <div className="grid grid-cols-[1.4fr_0.8fr] bg-[#111111] text-sm font-semibold text-white">

              <div className="px-5 py-4 md:px-6">
                Stage
              </div>

              <div className="border-l border-white/10 px-5 py-4 md:px-6">
                Estimated Duration
              </div>

            </div>


            {timeline.map((item, index) => (

              <div
                key={item.stage}
                className={`grid grid-cols-[1.4fr_0.8fr] text-sm ${
                  index % 2 === 0
                    ? "bg-[#fafaf9]"
                    : "bg-white"
                }`}
              >

                <div className="px-5 py-5 text-slate-700 md:px-6">
                  {item.stage}
                </div>

                <div className="border-l border-black/[0.06] px-5 py-5 text-slate-500 md:px-6">
                  {item.duration}
                </div>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* ========================================================
          CONFLICT OF INTEREST
      ======================================================== */}

      <section className="py-16 md:py-20">

        <div className="mx-auto max-w-6xl px-6 md:px-8">

          <div className="rounded-[1.75rem] border border-black/[0.07] bg-white p-7 shadow-sm md:p-9">

            <SectionLabel
              number="09"
              label="Conflict of Interest"
            />

            <h2 className="mt-5 text-2xl font-semibold md:text-3xl">
              Conflict of Interest Declaration
            </h2>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-500">
              Authors must disclose any financial, professional,
              institutional, or personal relationships that could
              influence the research or its interpretation.
            </p>


            <div className="mt-7 rounded-2xl border border-[#a48768]/15 bg-[#a48768]/[0.06] p-6 md:p-8">

              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a48768]">
                Declaration
              </p>

              <p className="mt-4 max-w-3xl text-lg font-light leading-8 text-slate-700 md:text-2xl">
                "The authors declare that there are no conflicts of
                interest related to this manuscript."
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ========================================================
          PUBLICATION ETHICS
      ======================================================== */}

      <section className="bg-white py-16 md:py-24">

        <div className="mx-auto max-w-7xl px-6 md:px-8">

          <div className="grid items-start gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">

            <div>

              <SectionLabel
                number="10"
                label="Publication Ethics"
              />

              <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-[-0.035em] md:text-4xl">
                Ethics & Malpractice Statement
              </h2>

              <p className="mt-5 text-sm leading-7 text-slate-500">
                The Journal of Future Engineering and Research (JFER)
                is committed to maintaining the highest standards of
                research integrity, transparency, and ethical publishing.
                Authors, reviewers, and editors are expected to comply
                with the following policies throughout the publication
                process.
              </p>

            </div>


            <div className="space-y-3">

              {ethicsPolicies.map((policy, index) => (

                <details
                  key={policy.title}
                  className="group overflow-hidden rounded-[1.5rem] border border-black/[0.07] bg-[#fafaf9] transition duration-300 open:bg-white open:shadow-md"
                >

                  <summary className="flex cursor-pointer list-none items-center gap-4 p-4 md:p-5">

                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#111111] text-[10px] font-semibold text-[#c4a98a]">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="flex-1 text-sm font-semibold md:text-base">
                      {policy.title}
                    </span>

                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 group-open:rotate-180" />

                  </summary>

                  <div className="px-5 pb-6 pl-[4.5rem] md:pl-[4.75rem]">

                    <p className="max-w-3xl text-sm leading-7 text-slate-500">
                      {policy.text}
                    </p>

                  </div>

                </details>

              ))}

            </div>

          </div>

        </div>

      </section>


      {/* ========================================================
          RESEARCH INTEGRITY
      ======================================================== */}

      <section className="py-16 md:py-20">

        <div className="mx-auto max-w-6xl px-6 md:px-8">

          <div className="grid gap-5 lg:grid-cols-2">

            <div className="rounded-[1.75rem] bg-[#111111] p-8 text-white md:p-9">

              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c4a98a]">
                Research Integrity
              </p>

              <h2 className="mt-4 text-3xl font-semibold">
                Responsible Scholarly Publishing
              </h2>

              <p className="mt-5 text-sm leading-7 text-white/50">
                JFER is committed to maintaining the highest standards
                of research integrity, ethical publishing, transparency,
                and academic excellence throughout the publication
                process.
              </p>

            </div>


            <div className="rounded-[1.75rem] border border-black/[0.07] bg-white p-8 shadow-sm md:p-9">

              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#a48768]">
                Plagiarism
              </p>

              <h2 className="mt-4 text-3xl font-semibold">
                Originality Matters
              </h2>

              <p className="mt-5 text-sm leading-7 text-slate-500">
                Every manuscript is screened using plagiarism detection
                software before peer review. Manuscripts containing
                plagiarism, duplicate publication, or excessive
                similarity will be rejected.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ========================================================
          ABSTRACTING & INDEXING
      ======================================================== */}

      <section className="border-y border-black/[0.05] bg-white py-16 md:py-20">

        <div className="mx-auto max-w-6xl px-6 md:px-8">

          <div className="mx-auto max-w-3xl text-center">

            <SectionLabel
              number="11"
              label="Abstracting & Indexing"
              centered
            />

            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.035em] md:text-4xl">
              Expanding Research Visibility
            </h2>

            <p className="mt-5 text-sm leading-7 text-slate-500 md:text-base">
              JFER is committed to enhancing the visibility and
              accessibility of published research. The journal is
              currently working towards inclusion in leading indexing
              and abstracting databases. Information will be updated
              as indexing approvals are obtained.
            </p>

            <div className="mt-7 inline-flex items-center gap-3 rounded-full border border-[#a48768]/20 bg-[#a48768]/[0.06] px-5 py-3 text-xs font-medium text-[#8f7054]">

              <Globe2 className="h-4 w-4" />

              Indexing information will be updated as approvals are obtained.

            </div>

          </div>

        </div>

      </section>


      {/* ========================================================
          FINAL CTA
      ======================================================== */}

      <section className="px-6 pb-20 pt-16 md:px-8 md:pb-24">

        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-[#111111] px-7 py-12 text-center text-white md:px-12 md:py-16">

          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full border border-[#a48768]/15" />

          <div className="relative">

            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#c4a98a]">
              JFER
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] md:text-4xl">
              Ready to Submit Your Research?
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/45">
              Join researchers and academicians contributing to the
              advancement of engineering and technology through JFER.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

              <Link
                href="/submit"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#111111] transition duration-300 hover:-translate-y-0.5 hover:shadow-xl"
              >
                Submit Manuscript

                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              <Link
                href="/guidelines"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3.5 text-sm font-semibold text-white transition duration-300 hover:border-white/30 hover:bg-white/[0.06]"
              >
                Author Guidelines

                <ArrowUpRight className="h-4 w-4" />
              </Link>

            </div>

          </div>

        </div>

      </section>


      {/* ========================================================
          ACTION POPUP
      ======================================================== */}

      {showActionPopup && (
        <ActionPopup
          onClose={() => setShowActionPopup(false)}
        />
      )}

    </main>
  );
}


/* ============================================================
   ACTION POPUP
============================================================ */

function ActionPopup({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] px-4 pb-4 sm:px-6 sm:pb-6">

      <div className="mx-auto max-w-5xl overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#111111] p-3 shadow-[0_25px_80px_rgba(0,0,0,0.30)]">

        {/* Header */}

        <div className="flex items-center justify-between px-3 pb-3 pt-2">

          <div>

            <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#c4a98a]">
              JFER
            </p>

            <p className="mt-1 text-xs text-white/45">
              Be part of the research community
            </p>

          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close popup"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/50 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>

        </div>


        {/* Cards */}

        <div className="grid gap-3 md:grid-cols-2">

          {/* Submit Paper */}

          <PopupCard
            number="01"
            eyebrow="For Authors"
            title="Submit Your Paper"
            description="Share your original research with the JFER academic community."
            href="/submit"
            buttonText="Submit Paper"
            onCancel={onClose}
          />


          {/* Become Reviewer */}

          <PopupCard
            number="02"
            eyebrow="For Researchers"
            title="Become a Reviewer"
            description="Join the JFER reviewer community and contribute to quality peer review."
            href="/editorial#join-reviewer"
            buttonText="Become a Reviewer"
            onCancel={onClose}
          />

        </div>

      </div>

    </div>
  );
}


/* ============================================================
   POPUP CARD
============================================================ */

function PopupCard({
  number,
  eyebrow,
  title,
  description,
  href,
  buttonText,
  onCancel,
}: {
  number: string;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  buttonText: string;
  onCancel: () => void;
}) {
  return (
    <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.045] p-5 transition duration-300 hover:border-[#a48768]/40 hover:bg-white/[0.06] sm:p-6">

      <div className="flex items-start justify-between">

        <span className="text-[9px] font-semibold tracking-[0.18em] text-[#a48768]">
          {number}
        </span>

        <span className="rounded-full border border-white/10 px-2.5 py-1 text-[8px] font-medium uppercase tracking-[0.15em] text-white/35">
          {eyebrow}
        </span>

      </div>


      <h3 className="mt-6 text-xl font-semibold tracking-[-0.02em] text-white">
        {title}
      </h3>


      <p className="mt-2 max-w-md text-xs leading-6 text-white/45 sm:text-sm">
        {description}
      </p>


      <div className="mt-5 flex flex-wrap items-center gap-2">

        <Link
          href={href}
          className="group inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-semibold text-[#111111] transition duration-300 hover:-translate-y-0.5 hover:shadow-lg"
        >
          {buttonText}

          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>


        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-white/10 px-4 py-2.5 text-xs font-medium text-white/45 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
        >
          Cancel
        </button>

      </div>

    </div>
  );
}


/* ============================================================
   SECTION LABEL
============================================================ */

function SectionLabel({
  number,
  label,
  dark = false,
  centered = false,
}: {
  number: string;
  label: string;
  dark?: boolean;
  centered?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.22em] ${
        centered ? "justify-center" : ""
      } ${dark ? "text-white/40" : "text-slate-400"}`}
    >

      <span className={dark ? "text-[#c4a98a]" : "text-[#a48768]"}>
        {number}
      </span>

      <span
        className={`h-px w-8 ${
          dark ? "bg-white/15" : "bg-black/10"
        }`}
      />

      <span>{label}</span>

    </div>
  );
}


/* ============================================================
   LEADERSHIP CARD
============================================================ */

function LeadershipCard({
  number,
  icon,
  title,
  text,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="relative min-h-[225px] rounded-[1.5rem] border border-black/[0.07] bg-[#fafaf9] p-7 transition duration-300 hover:-translate-y-1 hover:border-[#a48768]/30 hover:bg-white hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)]">

      <span className="absolute right-6 top-6 text-[9px] font-semibold tracking-[0.18em] text-slate-300">
        {number}
      </span>

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#111111] text-[#c4a98a]">
        {icon}
      </div>

      <h3 className="mt-7 text-xl font-semibold">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-slate-500">
        {text}
      </p>

    </div>
  );
}


/* ============================================================
   REVIEW CARD
============================================================ */

function ReviewCard({
  label,
  title,
  icon,
  children,
}: {
  label: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.5rem] border border-black/[0.07] bg-white p-7 transition duration-300 hover:-translate-y-1 hover:shadow-md">

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#a48768]/10 text-[#8f7054]">
        {icon}
      </div>

      <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a48768]">
        {label}
      </p>

      <h3 className="mt-2 text-xl font-semibold">
        {title}
      </h3>

      <p className="mt-4 text-sm leading-7 text-slate-500">
        {children}
      </p>

    </div>
  );
}


/* ============================================================
   RESOURCE CARD
============================================================ */

function ResourceCard({
  icon,
  title,
  description,
  href,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  action: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[1.5rem] border border-black/[0.07] bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-[#a48768]/30 hover:shadow-lg"
    >

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#111111] text-[#c4a98a]">
        {icon}
      </div>

      <h3 className="mt-6 text-xl font-semibold">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-slate-500">
        {description}
      </p>

      <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#8f7054]">

        {action}

        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />

      </span>

    </Link>
  );
}