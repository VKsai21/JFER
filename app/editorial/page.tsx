
"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  addDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

import {
  ArrowRight,
  Check,
  Globe2,
  Mail,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";

import { firestore } from "@/lib/firebase";


/* =========================================================
   TYPES
========================================================= */

type EditorialRole =
  | "editorInChief"
  | "associateEditor"
  | "advisoryBoard";

type EditorialMember = {
  id: string;

  role: EditorialRole;

  name: string;

  designation: string;

  affiliation: string;

  country: string;

  expertise: string[];

  imageUrl?: string;

  displayOrder: number;

  status: "active" | "inactive";

  createdAt?: unknown;

  updatedAt?: unknown;
};


/* =========================================================
   PAGE
========================================================= */

export default function EditorialBoardPage() {

  /* =======================================================
     EDITORIAL BOARD STATE
  ======================================================= */

  const [
    editorInChief,
    setEditorInChief,
  ] = useState<EditorialMember | null>(null);

  const [
    associateEditors,
    setAssociateEditors,
  ] = useState<EditorialMember[]>([]);

  const [
    advisoryBoard,
    setAdvisoryBoard,
  ] = useState<EditorialMember[]>([]);

  const [
    boardLoading,
    setBoardLoading,
  ] = useState(true);


  /* =======================================================
     REVIEWER FORM STATE
  ======================================================= */

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    designation: "",
    affiliation: "",
    expertise: "",
  });

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");


  /* =======================================================
     LOAD EDITORIAL BOARD
  ======================================================= */

  useEffect(() => {

    const loadEditorialBoard =
      async () => {

        try {

          setBoardLoading(true);

          const snapshot =
            await getDocs(
              collection(
                firestore,
                "editorialBoard"
              )
            );


          const members: EditorialMember[] =
            snapshot.docs
              .map((doc) => ({
                id: doc.id,

                ...(doc.data() as Omit<
                  EditorialMember,
                  "id"
                >),
              }))
              .filter(
                (member) =>
                  member.status ===
                  "active"
              )
              .sort(
                (a, b) =>
                  (a.displayOrder ?? 999) -
                  (b.displayOrder ?? 999)
              );


          /* -----------------------------------------------
             EDITOR-IN-CHIEF
          ------------------------------------------------ */

          const chief =
            members.find(
              (member) =>
                member.role ===
                "editorInChief"
            ) || null;


          /* -----------------------------------------------
             ASSOCIATE EDITORS
          ------------------------------------------------ */

          const associates =
            members.filter(
              (member) =>
                member.role ===
                "associateEditor"
            );


          /* -----------------------------------------------
             ADVISORY BOARD
          ------------------------------------------------ */

          const advisors =
            members.filter(
              (member) =>
                member.role ===
                "advisoryBoard"
            );


          setEditorInChief(chief);

          setAssociateEditors(
            associates
          );

          setAdvisoryBoard(
            advisors
          );

        } catch (error) {

          console.error(
            "Error loading editorial board:",
            error
          );

          setEditorInChief(null);

          setAssociateEditors([]);

          setAdvisoryBoard([]);

        } finally {

          setBoardLoading(false);

        }

      };


    loadEditorialBoard();

  }, []);


  /* =======================================================
     FORM CHANGE
  ======================================================= */

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement
    >
  ) => {

    const {
      name,
      value,
    } = e.target;


    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );

  };


  /* =======================================================
     REVIEWER APPLICATION SUBMIT
  ======================================================= */

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {

    e.preventDefault();

    setMessage("");


    /* -----------------------------------------------------
       BASIC VALIDATION
    ----------------------------------------------------- */

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.designation.trim() ||
      !formData.affiliation.trim() ||
      !formData.expertise.trim()
    ) {

      setMessage(
        "Please complete all required fields."
      );

      return;

    }


    setLoading(true);


    try {

      /* ---------------------------------------------------
         EXPERTISE
      --------------------------------------------------- */

      const expertiseArray =
        formData.expertise
          .split(",")
          .map(
            (item) =>
              item.trim()
          )
          .filter(Boolean);


      /* ---------------------------------------------------
         FIRESTORE
      --------------------------------------------------- */

      await addDoc(
        collection(
          firestore,
          "reviewerApplications"
        ),
        {
          name:
            formData.name.trim(),

          email:
            formData.email.trim(),

          phone:
            formData.phone.trim(),

          designation:
            formData.designation.trim(),

          affiliation:
            formData.affiliation.trim(),

          expertise:
            expertiseArray,

          submittedAt:
            serverTimestamp(),

          status:
            "pending",

          reviewedAt:
            null,
        }
      );


      /* ---------------------------------------------------
         RESET FORM
      --------------------------------------------------- */

      setFormData({
        name: "",
        email: "",
        phone: "",
        designation: "",
        affiliation: "",
        expertise: "",
      });


      setMessage(
        "Your reviewer application has been submitted successfully."
      );

    } catch (error) {

      console.error(
        "Reviewer application error:",
        error
      );

      setMessage(
        "Unable to submit your application. Please try again."
      );

    } finally {

      setLoading(false);

    }

  };


  /* =======================================================
     RENDER
  ======================================================= */

  return (

    <main className="min-h-screen overflow-x-hidden bg-[#f8f6f2] text-[#111111]">


      {/* ===================================================
          HERO
      =================================================== */}

      <section className="relative overflow-hidden bg-[#111111] text-white">

        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/[0.05]" />

        <div className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full border border-[#a48768]/10" />


        <div className="relative mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-24">

          <div className="max-w-4xl">

            <div className="flex items-center gap-3">

              <span className="h-px w-10 bg-[#a48768]" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#c4a98a]">
                Editorial Board
              </span>

            </div>


            <h1 className="mt-7 max-w-4xl text-4xl font-light leading-[1.05] tracking-[-0.04em] sm:text-5xl md:text-6xl">

              Meet the Experts

              <span className="block text-[#c4a98a]">
                Behind JFER
              </span>

            </h1>


            <p className="mt-7 max-w-3xl text-sm leading-7 text-white/45 md:text-base md:leading-8">

              The Journal of Future Engineering and Research is guided
              by a distinguished editorial team comprising academicians,
              researchers, and industry professionals dedicated to
              maintaining the highest standards of scholarly publishing
              and research integrity.

            </p>


            <div className="mt-8 flex flex-wrap gap-2">

              <span className="border border-white/10 px-4 py-2 text-[9px] uppercase tracking-[0.18em] text-white/50">
                Academic Leadership
              </span>

              <span className="border border-white/10 px-4 py-2 text-[9px] uppercase tracking-[0.18em] text-white/50">
                Peer Review
              </span>

              <span className="border border-white/10 px-4 py-2 text-[9px] uppercase tracking-[0.18em] text-white/50">
                Research Integrity
              </span>

            </div>

          </div>

        </div>

      </section>


      {/* ===================================================
          EDITOR-IN-CHIEF
      =================================================== */}

      <section className="bg-white py-16 md:py-20">

        <div className="mx-auto max-w-7xl px-6 md:px-8">

          <SectionLabel
            number="01"
            label="Editor-in-Chief"
          />


          <div className="mt-8">

            {boardLoading ? (

              <EditorInChiefSkeleton />

            ) : editorInChief ? (

              <EditorInChiefCard
                member={
                  editorInChief
                }
              />

            ) : (

              <EmptyEditorialState />

            )}

          </div>

        </div>

      </section>


      {/* ===================================================
          ASSOCIATE EDITORS
      =================================================== */}

      <section className="border-y border-black/[0.05] bg-[#f8f6f2] py-16 md:py-20">

        <div className="mx-auto max-w-7xl px-6 md:px-8">

          <SectionLabel
            number="02"
            label="Associate Editors"
          />


          <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

            <div>

              <h2 className="text-3xl font-semibold tracking-[-0.035em] md:text-4xl">
                Editorial expertise
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                Associate Editors support manuscript handling,
                peer-review coordination, and academic evaluation
                within their areas of expertise.
              </p>

            </div>

          </div>


          <div className="mt-10">

            {boardLoading ? (

              <div className="grid gap-4 md:grid-cols-2">

                <EditorialMemberSkeleton />

                <EditorialMemberSkeleton />

              </div>

            ) : associateEditors.length > 0 ? (

              <div className="grid gap-4 md:grid-cols-2">

                {associateEditors.map(
                  (member) => (

                    <EditorialMemberCard
                      key={
                        member.id
                      }
                      member={
                        member
                      }
                    />

                  )
                )}

              </div>

            ) : (

              <EmptyEditorialState />

            )}

          </div>

        </div>

      </section>


      {/* ===================================================
          ADVISORY BOARD
      =================================================== */}

      <section className="bg-white py-16 md:py-20">

        <div className="mx-auto max-w-7xl px-6 md:px-8">

          <SectionLabel
            number="03"
            label="Advisory Board"
          />


          <div className="mt-5">

            <h2 className="text-3xl font-semibold tracking-[-0.035em] md:text-4xl">
              Strategic academic guidance
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
              Advisory members provide academic perspective and
              support the journal's long-term research direction,
              quality, and scholarly standards.
            </p>

          </div>


          <div className="mt-10">

            {boardLoading ? (

              <div className="grid gap-4 md:grid-cols-2">

                <EditorialMemberSkeleton />

                <EditorialMemberSkeleton />

              </div>

            ) : advisoryBoard.length > 0 ? (

              <div className="grid gap-4 md:grid-cols-2">

                {advisoryBoard.map(
                  (member) => (

                    <EditorialMemberCard
                      key={
                        member.id
                      }
                      member={
                        member
                      }
                    />

                  )
                )}

              </div>

            ) : (

              <EmptyEditorialState />

            )}

          </div>

        </div>

      </section>


      {/* ===================================================
          EDITORIAL & REVIEWER INFORMATION
      =================================================== */}

      <section className="bg-[#111111] py-16 text-white md:py-20">

        <div className="mx-auto max-w-7xl px-6 md:px-8">

          <SectionLabel
            number="04"
            label="Editorial Governance"
            dark
          />


          <div className="mt-8 grid gap-5 lg:grid-cols-2">

            <InfoPanel
              icon={
                <Users className="h-5 w-5" />
              }
              title="Editorial & Reviewer Information"
            >

              <p>
                The Editor-in-Chief, Associate Editors,
                and Review Board Members are responsible for
                maintaining the academic quality, transparency,
                and integrity of the journal publication process.
              </p>

              <p className="mt-4">
                Reviewers are selected based on subject expertise,
                research contributions, and academic experience
                in relevant engineering and technology domains.
              </p>

              <p className="mt-4">
                All manuscripts are evaluated through a fair,
                unbiased, and confidential review process focusing
                on originality, technical quality, research
                significance, clarity, and relevance to the
                journal scope.
              </p>

            </InfoPanel>


            <InfoPanel
              icon={
                <ShieldCheck className="h-5 w-5" />
              }
              title="Publication Ethics"
            >

              <p>
                JFER is committed to maintaining ethical publishing
                practices and ensuring that every published article
                meets recognized academic and research standards.
              </p>

              <p className="mt-4">
                Editorial decisions are made independently based
                on academic merit, reviewer recommendations,
                ethical compliance, and the overall contribution
                of the work to the engineering and research community.
              </p>

            </InfoPanel>

          </div>

        </div>

      </section>


      {/* ===================================================
          REVIEW STANDARDS
      =================================================== */}

      <section className="bg-white py-16 md:py-20">

        <div className="mx-auto max-w-7xl px-6 md:px-8">

          <div className="mx-auto max-w-3xl text-center">

            <SectionLabel
              number="05"
              label="Journal Review Standards"
              centered
            />

            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.035em] md:text-4xl">
              What reviewers evaluate
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-500">
              Every manuscript is evaluated against consistent
              academic and ethical standards to support fair and
              responsible editorial decisions.
            </p>

          </div>


          <div className="mt-10 grid gap-3 md:grid-cols-2">

            {[
              "Originality and novelty of the research",

              "Technical and scientific quality",

              "Relevance to engineering and interdisciplinary domains",

              "Clarity of presentation and organization",

              "Accuracy of methodology and analysis",

              "Practical significance and contribution to the field",

              "Proper citation and referencing practices",

              "Compliance with ethical publishing guidelines",
            ].map(
              (item, index) => (

                <div
                  key={item}
                  className="group flex items-start gap-4 border border-black/[0.07] bg-[#f8f6f2] p-5 transition-all duration-300 hover:border-[#a48768]/30 hover:bg-white hover:shadow-[0_15px_40px_rgba(0,0,0,0.05)]"
                >

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#111111] text-[#c4a98a]">

                    <span className="text-[9px] font-semibold">
                      {String(
                        index + 1
                      ).padStart(
                        2,
                        "0"
                      )}
                    </span>

                  </div>

                  <div className="flex items-start gap-2 pt-1">

                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#a48768]" />

                    <span className="text-sm leading-6 text-slate-600">
                      {item}
                    </span>

                  </div>

                </div>

              )
            )}

          </div>


          <div className="mt-8 border-l-2 border-[#a48768] bg-[#f8f6f2] p-6 md:p-7">

            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#a48768]">
              Review Policy
            </p>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              Manuscripts identified with plagiarism, unethical
              practices, duplicate publication, or poor research
              quality may be rejected during the review process.
              Authors may be requested to revise and resubmit
              manuscripts based on reviewer recommendations.
            </p>

          </div>

        </div>

      </section>


      {/* ===================================================
          EDITORIAL OFFICE
      =================================================== */}

      <section className="border-y border-black/[0.05] bg-[#f8f6f2] py-16 md:py-20">

        <div className="mx-auto max-w-7xl px-6 md:px-8">

          <SectionLabel
            number="06"
            label="Editorial Office"
          />


          <div className="mt-8 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">

            <div>

              <h2 className="text-3xl font-semibold tracking-[-0.035em] md:text-4xl">
                Supporting the publication process
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-500">
                The editorial office coordinates the operational
                aspects of manuscript submission, peer review,
                communication, and publication.
              </p>

            </div>


            <div className="border border-black/[0.07] bg-white p-7 md:p-8">

              <ul className="space-y-5">

                {[
                  "Managing manuscript submissions and editorial correspondence.",

                  "Conducting initial screening for scope, formatting, and completeness.",

                  "Coordinating communication between authors, editors, and reviewers.",

                  "Monitoring the peer-review and publication process.",

                  "Preparing accepted manuscripts for copyediting, proofreading, and publication.",

                  "Maintaining journal records and ensuring smooth publication operations.",
                ].map(
                  (item) => (

                    <li
                      key={item}
                      className="flex items-start gap-4"
                    >

                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#a48768]" />

                      <span className="text-sm leading-7 text-slate-600">
                        {item}
                      </span>

                    </li>

                  )
                )}

              </ul>

            </div>

          </div>

        </div>

      </section>


      {/* ===================================================
          JOIN AS REVIEWER
      =================================================== */}

      <section
        id="join-reviewer"
        className="scroll-mt-28 bg-white py-16 md:py-20"
      >

        <div className="mx-auto max-w-7xl px-6 md:px-8">

          <SectionLabel
            number="07"
            label="Join Our Reviewer Network"
          />


          <div className="mt-8 overflow-hidden border border-[#a48768]/20 bg-[#0d0d0d]">

            <div className="grid lg:grid-cols-[0.8fr_1.2fr]">

              {/* =========================================
                  LEFT
              ========================================= */}

              <div className="p-7 text-white md:p-10 lg:p-12">

                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#eadbc7]">
                  For Researchers
                </p>

                <h2 className="mt-4 text-3xl font-light leading-tight md:text-4xl">
                  Become a Reviewer
                </h2>

                <p className="mt-5 text-sm leading-7 text-[#f5efe5]">
                  JFER welcomes qualified academicians,
                  researchers, and industry professionals who
                  are interested in contributing to the peer-review
                  process.
                </p>

                <p className="mt-4 text-sm leading-7 text-[#f5efe5]">
                  Submit your professional details and areas of
                  expertise. Your application will be reviewed
                  by the editorial team.
                </p>


                <div className="mt-8 space-y-4">

                  <ReviewerBenefit>
                    Contribute to scholarly peer review
                  </ReviewerBenefit>

                  <ReviewerBenefit>
                    Share expertise in your research domain
                  </ReviewerBenefit>

                  <ReviewerBenefit>
                    Support quality and research integrity
                  </ReviewerBenefit>

                </div>

              </div>


              {/* =========================================
                  FORM
              ========================================= */}

              <div className="bg-white p-6 md:p-8 lg:p-10">

                <div className="mb-7">

                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#a48768]">
                    Reviewer Application
                  </p>

                  <h3 className="mt-2 text-2xl font-semibold">
                    Submit Your Details
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Complete the form below to apply to
                    the JFER reviewer network.
                  </p>

                </div>


                <form
                  onSubmit={
                    handleSubmit
                  }
                  className="space-y-5"
                >

                  {/* =====================================
                      NAME
                  ===================================== */}

                  <div>

                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-medium"
                    >
                      Full Name
                    </label>

                    <input
                      id="name"
                      type="text"
                      name="name"
                      value={
                        formData.name
                      }
                      onChange={
                        handleChange
                      }
                      required
                      placeholder="Your full name"
                      className="w-full border border-black/[0.10] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#a48768] focus:ring-1 focus:ring-[#a48768]/20"
                    />

                  </div>


                  {/* =====================================
                      EMAIL + PHONE
                  ===================================== */}

                  <div className="grid gap-5 md:grid-cols-2">

                    <div>

                      <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-medium"
                      >
                        Email Address
                      </label>

                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={
                          formData.email
                        }
                        onChange={
                          handleChange
                        }
                        required
                        placeholder="you@example.com"
                        className="w-full border border-black/[0.10] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#a48768] focus:ring-1 focus:ring-[#a48768]/20"
                      />

                    </div>


                    <div>

                      <label
                        htmlFor="phone"
                        className="mb-2 block text-sm font-medium"
                      >
                        Phone Number
                      </label>

                      <input
                        id="phone"
                        type="tel"
                        name="phone"
                        value={
                          formData.phone
                        }
                        onChange={
                          handleChange
                        }
                        required
                        placeholder="+91 XXXXX XXXXX"
                        className="w-full border border-black/[0.10] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#a48768] focus:ring-1 focus:ring-[#a48768]/20"
                      />

                    </div>

                  </div>


                  {/* =====================================
                      DESIGNATION + AFFILIATION
                  ===================================== */}

                  <div className="grid gap-5 md:grid-cols-2">

                    <div>

                      <label
                        htmlFor="designation"
                        className="mb-2 block text-sm font-medium"
                      >
                        Designation
                      </label>

                      <input
                        id="designation"
                        type="text"
                        name="designation"
                        value={
                          formData.designation
                        }
                        onChange={
                          handleChange
                        }
                        required
                        placeholder="Professor / Researcher / Engineer"
                        className="w-full border border-black/[0.10] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#a48768] focus:ring-1 focus:ring-[#a48768]/20"
                      />

                    </div>


                    <div>

                      <label
                        htmlFor="affiliation"
                        className="mb-2 block text-sm font-medium"
                      >
                        Affiliation
                      </label>

                      <input
                        id="affiliation"
                        type="text"
                        name="affiliation"
                        value={
                          formData.affiliation
                        }
                        onChange={
                          handleChange
                        }
                        required
                        placeholder="University / Institution / Organization"
                        className="w-full border border-black/[0.10] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#a48768] focus:ring-1 focus:ring-[#a48768]/20"
                      />

                    </div>

                  </div>


                  {/* =====================================
                      EXPERTISE
                  ===================================== */}

                  <div>

                    <label
                      htmlFor="expertise"
                      className="mb-2 block text-sm font-medium"
                    >
                      Areas of Expertise
                    </label>

                    <textarea
                      id="expertise"
                      name="expertise"
                      value={
                        formData.expertise
                      }
                      onChange={
                        handleChange
                      }
                      required
                      rows={2}
                      placeholder="PCB Design, Embedded Systems, IoT"
                      className="w-full resize-none border border-black/[0.10] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#a48768] focus:ring-1 focus:ring-[#a48768]/20"
                    />

                    <p className="mt-2 text-xs text-slate-400">
                      Separate multiple areas using commas.
                    </p>

                  </div>


                  {/* =====================================
                      MESSAGE
                  ===================================== */}

                  {message && (

                    <div
                      className={`border px-4 py-3 text-sm ${
                        message.includes(
                          "successfully"
                        )
                          ? "border-green-200 bg-green-50 text-green-700"
                          : "border-red-200 bg-red-50 text-red-700"
                      }`}
                    >
                      {message}
                    </div>

                  )}


                  {/* =====================================
                      SUBMIT
                  ===================================== */}

                  <button
                    type="submit"
                    disabled={
                      loading
                    }
                    className="group flex w-full items-center justify-center gap-2 bg-[#111111] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#1d1d1d] disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    {loading
                      ? "Submitting Application..."
                      : "Submit Reviewer Application"}

                    {!loading && (

                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />

                    )}

                  </button>

                </form>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ===================================================
          CONTACT / FOOTNOTE
      =================================================== */}

      <section className="bg-[#111111] py-12 text-white">

        <div className="mx-auto max-w-7xl px-6 md:px-8">

          <div className="grid gap-8 md:grid-cols-3">

            <ContactItem
              icon={
                <Mail className="h-4 w-4" />
              }
              label="Editorial"
              value="editorial@jfer.org"
            />

            <ContactItem
              icon={
                <Globe2 className="h-4 w-4" />
              }
              label="Journal"
              value="Journal of Future Engineering and Research"
            />

            <ContactItem
              icon={
                <ShieldCheck className="h-4 w-4" />
              }
              label="Review"
              value="Confidential Double-Blind Peer Review"
            />

          </div>

        </div>

      </section>

    </main>

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
        centered
          ? "justify-center"
          : ""
      } ${
        dark
          ? "text-white/40"
          : "text-slate-400"
      }`}
    >

      <span
        className={
          dark
            ? "text-[#c4a98a]"
            : "text-[#a48768]"
        }
      >
        {number}
      </span>


      <span
        className={`h-px w-8 ${
          dark
            ? "bg-white/15"
            : "bg-black/10"
        }`}
      />


      <span>
        {label}
      </span>

    </div>

  );
}


/* ============================================================
   EDITOR-IN-CHIEF SKELETON
============================================================ */

function EditorInChiefSkeleton() {

  return (

    <div className="animate-pulse border border-black/[0.07] bg-[#f8f6f2] p-7 md:p-9">

      <div className="grid gap-8 md:grid-cols-[auto_1fr_auto] md:items-center">

        <div className="h-32 w-32 rounded-full bg-[#e7e1d8] md:h-36 md:w-36" />


        <div>

          <div className="h-3 w-28 rounded bg-[#e7e1d8]" />

          <div className="mt-4 h-8 w-64 max-w-full rounded bg-[#e7e1d8]" />

          <div className="mt-4 h-4 w-44 rounded bg-[#e7e1d8]" />

          <div className="mt-3 h-4 w-72 max-w-full rounded bg-[#e7e1d8]" />

          <div className="mt-3 h-4 w-52 rounded bg-[#e7e1d8]" />

        </div>


        <div className="hidden md:block">

          <div className="h-3 w-20 rounded bg-[#e7e1d8]" />

          <div className="mt-4 flex gap-2">

            <div className="h-7 w-20 rounded bg-[#e7e1d8]" />

            <div className="h-7 w-24 rounded bg-[#e7e1d8]" />

          </div>

        </div>

      </div>

    </div>

  );
}


/* ============================================================
   EDITORIAL MEMBER SKELETON
============================================================ */

function EditorialMemberSkeleton() {

  return (

    <div className="animate-pulse border border-black/[0.07] bg-white p-6">

      <div className="flex gap-5">

        <div className="h-20 w-20 shrink-0 rounded-full bg-[#e7e1d8]" />

        <div className="min-w-0 flex-1">

          <div className="h-3 w-28 rounded bg-[#e7e1d8]" />

          <div className="mt-3 h-6 w-48 max-w-full rounded bg-[#e7e1d8]" />

          <div className="mt-3 h-4 w-36 rounded bg-[#e7e1d8]" />

          <div className="mt-2 h-4 w-56 max-w-full rounded bg-[#e7e1d8]" />

          <div className="mt-4 flex gap-2">

            <div className="h-6 w-16 rounded bg-[#e7e1d8]" />

            <div className="h-6 w-20 rounded bg-[#e7e1d8]" />

            <div className="h-6 w-14 rounded bg-[#e7e1d8]" />

          </div>

        </div>

      </div>

    </div>

  );
}


/* ============================================================
   EDITOR-IN-CHIEF CARD
============================================================ */

function EditorInChiefCard({
  member,
}: {
  member: EditorialMember;
}) {

  return (

    <div className="border border-black/[0.08] bg-[#111111] p-7 text-white md:p-9">

      <div className="grid gap-8 md:grid-cols-[auto_1fr_auto] md:items-center">


        {/* IMAGE */}

        {member.imageUrl ? (

          <img
            src={
              member.imageUrl
            }
            alt={
              member.name
            }
            className="h-32 w-32 rounded-full object-cover ring-1 ring-white/10 md:h-36 md:w-36"
          />

        ) : (

          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-white/[0.06] text-xs text-white/30 md:h-36 md:w-36">
            No Photo
          </div>
        )}


        {/* DETAILS */}

        <div>

          <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#a48768]">
            Editor-in-Chief
          </p>


          <h3 className="mt-3 text-2xl font-semibold tracking-[-0.02em] md:text-3xl">
            {member.name}
          </h3>


          {member.designation && (

            <p className="mt-2 text-sm text-white/55">
              {member.designation}
            </p>

          )}


          {member.affiliation && (

            <p className="mt-1 text-sm text-white/35">
              {member.affiliation}
            </p>

          )}


          {member.country && (

            <div className="mt-2 flex items-center gap-2 text-xs text-white/30">

              <MapPin className="h-3.5 w-3.5" />

              {member.country}

            </div>

          )}

        </div>


        {/* EXPERTISE */}

        {member.expertise?.length > 0 && (

          <div className="md:max-w-xs">

            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/30">
              Expertise
            </p>


            <div className="mt-3 flex flex-wrap gap-1.5">

              {member.expertise
                .slice(0, 5)
                .map(
                  (item) => (

                    <span
                      key={item}
                      className="border border-white/10 px-2.5 py-1.5 text-[9px] text-white/50"
                    >
                      {item}
                    </span>

                  )
                )}

            </div>

          </div>

        )}

      </div>

    </div>

  );
}


/* ============================================================
   EDITORIAL MEMBER CARD
============================================================ */

function EditorialMemberCard({
  member,
}: {
  member: EditorialMember;
}) {

  const roleLabel =
    member.role ===
    "associateEditor"
      ? "Associate Editor"
      : "Advisory Board";


  return (

    <div className="group border border-black/[0.08] bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#a48768]/30 hover:shadow-[0_18px_45px_rgba(0,0,0,0.06)]">

      <div className="flex gap-5">


        {/* IMAGE */}

        {member.imageUrl ? (

          <img
            src={
              member.imageUrl
            }
            alt={
              member.name
            }
            className="h-20 w-20 shrink-0 rounded-full object-cover"
          />

        ) : (

          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#eee7dc] text-[9px] text-slate-400">
            No Photo
          </div>

        )}


        {/* DETAILS */}

        <div className="min-w-0 flex-1">

          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#a48768]">
            {roleLabel}
          </p>


          <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em]">
            {member.name}
          </h3>


          {member.designation && (

            <p className="mt-1 text-sm text-slate-500">
              {member.designation}
            </p>

          )}


          {member.affiliation && (

            <p className="mt-1 text-xs text-slate-400">
              {member.affiliation}
            </p>

          )}


          {member.country && (

            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">

              <MapPin className="h-3 w-3" />

              {member.country}

            </div>

          )}


          {member.expertise?.length > 0 && (

            <div className="mt-4 flex flex-wrap gap-1.5">

              {member.expertise
                .slice(0, 4)
                .map(
                  (item) => (

                    <span
                      key={item}
                      className="border border-black/[0.07] bg-[#f8f6f2] px-2 py-1 text-[8px] text-slate-500"
                    >
                      {item}
                    </span>

                  )
                )}

            </div>

          )}

        </div>

      </div>

    </div>

  );
}


/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyEditorialState() {

  return (

    <div className="border border-dashed border-black/[0.12] bg-[#f8f6f2] px-6 py-10 text-center">

      <p className="text-sm text-slate-400">
        Editorial information is currently unavailable.
      </p>

    </div>

  );
}


/* ============================================================
   INFO PANEL
============================================================ */

function InfoPanel({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {

  return (

    <div className="border border-white/10 bg-white/[0.035] p-7 md:p-8">

      <div className="flex h-10 w-10 items-center justify-center bg-[#a48768]/15 text-[#c4a98a]">
        {icon}
      </div>


      <h3 className="mt-6 text-xl font-semibold">
        {title}
      </h3>


      <div className="mt-4 text-sm leading-7 text-white/45">
        {children}
      </div>

    </div>

  );
}


/* ============================================================
   REVIEWER BENEFIT
============================================================ */

function ReviewerBenefit({
  children,
}: {
  children: React.ReactNode;
}) {

  return (

    <div className="flex items-start gap-3">

      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border border-[#eadbc7]/30 text-[10px] text-[#eadbc7]">

        <Check className="h-3 w-3" />

      </span>


      <span className="text-sm text-[#f5efe5]">
        {children}
      </span>

    </div>

  );
}


/* ============================================================
   CONTACT ITEM
============================================================ */

function ContactItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {

  return (

    <div className="flex items-start gap-4">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-white/[0.05] text-[#c4a98a]">
        {icon}
      </div>


      <div>

        <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#a48768]">
          {label}
        </p>

        <p className="mt-2 text-sm leading-6 text-white/45">
          {value}
        </p>

      </div>

    </div>

  );
}
