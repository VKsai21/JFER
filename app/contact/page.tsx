"use client";

import { useState } from "react";
import {
  ArrowRight,
  Check,
  Mail,
  MessageSquare,
  ShieldCheck,
  X,
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState<{
    type: "success" | "error" | "";
    message: string;
  }>({
    type: "",
    message: "",
  });

  /* =========================================================
     HANDLE INPUT CHANGE
  ========================================================= */

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /* =========================================================
     HANDLE SUBMIT
  ========================================================= */

  const handleSubmit = async () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.subject ||
      !formData.message
    ) {
      setStatus({
        type: "error",
        message: "Please fill all fields.",
      });

      return;
    }

    try {
      setLoading(true);

      setStatus({
        type: "",
        message: "",
      });

      const response = await fetch(
        "/api/contact",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message
        );
      }

      setStatus({
        type: "success",
        message:
          "Inquiry submitted successfully. Our editorial team will review your inquiry and respond shortly.",
      });

      setTimeout(() => {
        setStatus({
          type: "",
          message: "",
        });
      }, 5000);

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

    } catch (error: any) {
      setStatus({
        type: "error",
        message:
          error.message ||
          "Failed to submit inquiry. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f8f6f2] text-[#111111]">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden bg-[#111111] text-white">

        {/* Decorative circles */}

        <div className="pointer-events-none absolute -right-32 -top-40 h-[430px] w-[430px] rounded-full border border-white/[0.05]" />

        <div className="pointer-events-none absolute -right-12 -top-20 h-[260px] w-[260px] rounded-full border border-[#a48768]/10" />

        <div className="pointer-events-none absolute -bottom-40 -left-32 h-[420px] w-[420px] rounded-full border border-[#a48768]/10" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 md:px-8 md:py-28">

          <div className="max-w-4xl">

            <div className="flex items-center gap-3">

              <span className="h-px w-10 bg-[#a48768]" />

              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c4a98a]">
                Contact JFER
              </p>

            </div>

            <h1 className="mt-7 max-w-4xl text-4xl font-light leading-[1.05] tracking-[-0.045em] sm:text-5xl md:text-6xl">

              Don&apos;t Be A Stranger.

              <span className="block text-[#c4a98a]">
                Just Say Hello.
              </span>

            </h1>

            <p className="mt-7 max-w-2xl text-sm leading-7 text-white/45 md:text-base md:leading-8">
              Reach the Journal of Future Engineering and
              Research for editorial inquiries, submission
              support, publication assistance, and general
              communication.
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          CONTACT AREA
      ===================================================== */}

      <section className="relative mx-auto max-w-7xl px-6 py-14 md:px-8 md:py-20">

        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">


          {/* =================================================
              CONTACT INFORMATION
          ================================================= */}

          <div>

            <div className="border border-black/[0.07] bg-white">

              {/* Header */}

              <div className="border-b border-black/[0.07] px-6 py-7 md:px-8">

                <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#a48768]">
                  Editorial Office
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em]">
                  Get In Touch
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  For questions about submissions, publication,
                  reviews, or the journal, contact our editorial
                  office.
                </p>

              </div>


              {/* Information */}

              <div className="p-6 md:p-8">

                <div className="space-y-0">


                  {/* JOURNAL */}

                  <ContactInfo
                    icon={
                      <MessageSquare className="h-4 w-4" />
                    }
                    label="Editorial Office"
                  >
                    Journal of Future Engineering and Research
                  </ContactInfo>


                  {/* EMAIL */}

                  <ContactInfo
                    icon={
                      <Mail className="h-4 w-4" />
                    }
                    label="Editorial Email"
                  >
                    editor@jfer.ac.in
                  </ContactInfo>


                  {/* SUPPORT */}

                  <ContactInfo
                    icon={
                      <ShieldCheck className="h-4 w-4" />
                    }
                    label="Submission Support"
                  >
                    support@jfer.ac.in
                  </ContactInfo>


                  {/* TIMELINE */}

                  <ContactInfo
                    icon={
                      <MessageSquare className="h-4 w-4" />
                    }
                    label="Publication Timeline"
                    last
                  >
                    2–4 Weeks
                  </ContactInfo>

                </div>


                {/* Bottom note */}

                <div className="mt-8 border-l-2 border-[#a48768] bg-[#f8f6f2] px-4 py-4">

                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#a48768]">
                    Editorial Communication
                  </p>

                  <p className="mt-2 text-xs leading-6 text-slate-500">
                    Please include sufficient details in your
                    inquiry so our editorial team can assist you
                    efficiently.
                  </p>

                </div>

              </div>

            </div>

          </div>


          {/* =================================================
              CONTACT FORM
          ================================================= */}

          <div>

            <div className="border border-black/[0.07] bg-white">

              {/* Form header */}

              <div className="border-b border-black/[0.07] px-6 py-7 md:px-8">

                <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#a48768]">
                  Send An Inquiry
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em] md:text-3xl">
                  How Can We Help?
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Complete the form below and our editorial team
                  will review your inquiry.
                </p>

              </div>


              {/* Form */}

              <div className="p-6 md:p-8">

                <div className="space-y-6">


                  {/* NAME */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold">
                      Full Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={
                        formData.name
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Enter your full name"
                      className="w-full border border-black/[0.10] bg-white px-4 py-3.5 text-sm text-[#111111] outline-none transition-all duration-200 placeholder:text-slate-300 focus:border-[#a48768] focus:ring-2 focus:ring-[#a48768]/10"
                    />

                  </div>


                  {/* EMAIL */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold">
                      Email Address
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={
                        formData.email
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Enter your email address"
                      className="w-full border border-black/[0.10] bg-white px-4 py-3.5 text-sm text-[#111111] outline-none transition-all duration-200 placeholder:text-slate-300 focus:border-[#a48768] focus:ring-2 focus:ring-[#a48768]/10"
                    />

                  </div>


                  {/* SUBJECT */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold">
                      Subject
                    </label>

                    <input
                      type="text"
                      name="subject"
                      value={
                        formData.subject
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="What would you like to discuss?"
                      className="w-full border border-black/[0.10] bg-white px-4 py-3.5 text-sm text-[#111111] outline-none transition-all duration-200 placeholder:text-slate-300 focus:border-[#a48768] focus:ring-2 focus:ring-[#a48768]/10"
                    />

                  </div>


                  {/* MESSAGE */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold">
                      Your Message
                    </label>

                    <textarea
                      rows={3}
                      name="message"
                      value={
                        formData.message
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Write your message here..."
                      className="w-full resize-none border border-black/[0.10] bg-white px-4 py-3.5 text-sm leading-7 text-[#111111] outline-none transition-all duration-200 placeholder:text-slate-300 focus:border-[#a48768] focus:ring-2 focus:ring-[#a48768]/10"
                    />

                  </div>


                  {/* STATUS */}

                  {status.message && (

                    <div
                      className={`flex items-start gap-3 border p-4 ${
                        status.type ===
                        "success"
                          ? "border-[#a48768]/20 bg-[#a48768]/5 text-[#111111]"
                          : "border-red-200 bg-red-50 text-red-800"
                      }`}
                    >

                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center ${
                          status.type ===
                          "success"
                            ? "bg-[#a48768]/10 text-[#a48768]"
                            : "bg-red-100 text-red-600"
                        }`}
                      >

                        {status.type ===
                        "success" ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}

                      </div>

                      <div>

                        <h4 className="text-sm font-semibold">

                          {status.type ===
                          "success"
                            ? "Inquiry Submitted"
                            : "Submission Failed"}

                        </h4>

                        <p className="mt-1 text-xs leading-5 opacity-70">
                          {status.message}
                        </p>

                      </div>

                    </div>

                  )}


                  {/* BUTTON */}

                  <button
                    onClick={
                      handleSubmit
                    }
                    disabled={
                      loading
                    }
                    className="group flex w-full items-center justify-center gap-3 bg-[#111111] px-6 py-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#222222] disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    {loading ? (

                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />

                        <span>
                          Submitting...
                        </span>
                      </>

                    ) : (

                      <>
                        <span>
                          Submit Inquiry
                        </span>

                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </>

                    )}

                  </button>


                  {/* DISCLAIMER */}

                  <div className="border-t border-black/[0.07] pt-5">

                    <p className="text-xs leading-6 text-slate-400">
                      Your inquiry will be reviewed by the
                      editorial team and handled according to
                      the nature of your request.
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          BOTTOM EDITORIAL STRIP
      ===================================================== */}

      <section className="border-t border-white/10 bg-[#111111]">

        <div className="mx-auto max-w-7xl px-6 py-12 md:px-8">

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#a48768]">
                Journal of Future Engineering and Research
              </p>

              <p className="mt-2 text-sm text-white/40">
                Connecting researchers, authors, reviewers,
                and the editorial community.
              </p>

            </div>

            <div className="h-px w-24 bg-[#a48768] md:w-32" />

          </div>

        </div>

      </section>

    </main>
  );
}


/* ============================================================
   CONTACT INFORMATION COMPONENT
============================================================ */

function ContactInfo({
  icon,
  label,
  children,
  last = false,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={`flex gap-4 py-5 ${
        !last
          ? "border-b border-black/[0.07]"
          : ""
      }`}
    >

      <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#f8f6f2] text-[#a48768]">

        {icon}

      </div>

      <div className="min-w-0">

        <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-sm font-medium leading-6 text-[#111111]">
          {children}
        </p>

      </div>

    </div>
  );
}