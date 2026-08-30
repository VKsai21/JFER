"use client";

import { useState } from "react";
import {
  ArrowRight,
  Check,
  FileText,
  ShieldCheck,
  X,
} from "lucide-react";

export default function SubmitPage() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [email, setEmail] = useState("");
  const [keywords, setKeywords] = useState("");
  const [abstract, setAbstract] = useState("");

  // Kept because it exists in the current page.
  // PDF upload is currently disabled.
  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setSuccess(false);
      setError("");

      const formData = new FormData();

      formData.append("title", title);
      formData.append("author", author);
      formData.append("email", email);
      formData.append("keywords", keywords);
      formData.append("abstract", abstract);

      // Current backend flow does not upload the manuscript file.
      // Keeping this commented to match the existing implementation.
      //
      // if (file) {
      //   formData.append("file", file);
      // }

      const res = await fetch("/api/submit", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (result.success) {
        setSuccess(true);

        setTitle("");
        setAuthor("");
        setEmail("");
        setKeywords("");
        setAbstract("");

        setFile(null);
        setFileName("");
      } else {
        setError(
          result.message ||
            "Submission failed"
        );
      }
    } catch (err) {
      console.error(err);

      setError(
        "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f8f6f2] text-[#111111]">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden bg-[#111111] text-white">

        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full border border-white/[0.05]" />

        <div className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full border border-[#a48768]/10" />

        <div className="relative mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-24">

          <div className="max-w-4xl">

            <div className="flex items-center gap-3">

              <span className="h-px w-10 bg-[#a48768]" />

              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#c4a98a]">
                Journal Submission
              </p>

            </div>

            <h1 className="mt-7 text-4xl font-light leading-[1.05] tracking-[-0.04em] sm:text-5xl md:text-6xl">

              Submit Your

              <span className="block text-[#c4a98a]">
                Manuscript
              </span>

            </h1>

            <p className="mt-7 max-w-3xl text-sm leading-7 text-white/45 md:text-base md:leading-8">
              Submit original research articles, review papers,
              and innovative engineering studies for peer review
              and publication in the Journal of Future Engineering
              and Research.
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          CONTENT
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-6 py-14 md:px-8 md:py-20">

        <div className="grid gap-8 lg:grid-cols-3">


          {/* =================================================
              LEFT — GUIDELINES
          ================================================= */}

          <div>

            <div className="lg:sticky lg:top-24">

              <div className="border border-black/[0.07] bg-white">

                {/* HEADER */}

                <div className="border-b border-black/[0.07] px-6 py-6 md:px-7">

                  <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#a48768]">
                    Before Submission
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em]">
                    Submission Guidelines
                  </h2>

                </div>


                {/* GUIDELINES */}

                <div className="p-6 md:p-7">

                  <ul className="space-y-4">

                    {[
                      "Manuscript should be prepared according to JFER requirements.",
                      "Submit original and unpublished research.",
                      "Ensure all author information is accurate.",
                      "Provide relevant keywords.",
                      "Include a clear and concise abstract.",
                      "Review the manuscript carefully before submission.",
                      "Follow ethical publishing requirements.",
                      "All submissions are subject to editorial screening and peer review.",
                    ].map(
                      (item, index) => (

                        <li
                          key={item}
                          className="flex items-start gap-3"
                        >

                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center bg-[#a48768]/10 text-[#a48768]">

                            <Check className="h-3 w-3" />

                          </span>

                          <div className="flex gap-2">

                            <span className="pt-0.5 text-[9px] font-semibold text-[#a48768]">
                              {String(
                                index + 1
                              ).padStart(
                                2,
                                "0"
                              )}
                            </span>

                            <span className="text-sm leading-6 text-slate-500">
                              {item}
                            </span>

                          </div>

                        </li>

                      )
                    )}

                  </ul>


                  {/* REVIEW PROCESS */}

                  <div className="mt-8 border-t border-black/[0.07] pt-7">

                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 items-center justify-center bg-[#f8f6f2] text-[#a48768]">

                        <ShieldCheck className="h-4 w-4" />

                      </div>

                      <div>

                        <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#a48768]">
                          Editorial Process
                        </p>

                        <h3 className="mt-1 text-sm font-semibold">
                          Peer Review
                        </h3>

                      </div>

                    </div>

                    <p className="mt-4 text-sm leading-7 text-slate-500">
                      All submissions undergo editorial screening
                      followed by peer-review evaluation. Authors
                      will be informed regarding acceptance,
                      revision requirements, or rejection.
                    </p>

                  </div>


                  {/* IMPORTANT NOTE */}

                  <div className="mt-7 border-l-2 border-[#a48768] bg-[#f8f6f2] px-4 py-4">

                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#a48768]">
                      Important
                    </p>

                    <p className="mt-2 text-xs leading-6 text-slate-500">
                      Please verify all manuscript information
                      before submitting.
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>


          {/* =================================================
              RIGHT — FORM
          ================================================= */}

          <div className="lg:col-span-2">

            <div className="border border-black/[0.07] bg-white">

              {/* FORM HEADER */}

              <div className="border-b border-black/[0.07] px-6 py-7 md:px-9 md:py-8">

                <div className="flex items-start justify-between gap-6">

                  <div>

                    <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#a48768]">
                      Manuscript Information
                    </p>

                    <h2 className="mt-2 text-3xl font-light tracking-[-0.03em]">
                      Submission Details
                    </h2>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                      Complete the form below with the required
                      information for your manuscript.
                    </p>

                  </div>

                  <div className="hidden h-11 w-11 shrink-0 items-center justify-center bg-[#f8f6f2] text-[#a48768] sm:flex">

                    <FileText className="h-5 w-5" />

                  </div>

                </div>

              </div>


              {/* FORM */}

              <div className="px-6 py-7 md:px-9 md:py-9">

                <div className="space-y-7">


                  {/* =================================================
                      TITLE
                  ================================================= */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold">

                      Paper Title

                    </label>

                    <input
                      value={title}
                      onChange={(e) =>
                        setTitle(
                          e.target.value
                        )
                      }
                      placeholder="Enter the complete title of your manuscript"
                      className="w-full border border-black/[0.10] bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#a48768] focus:ring-2 focus:ring-[#a48768]/10"
                    />

                  </div>


                  {/* =================================================
                      AUTHORS
                  ================================================= */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold">

                      Author Name(s)

                    </label>

                    <input
                      value={author}
                      onChange={(e) =>
                        setAuthor(
                          e.target.value
                        )
                      }
                      placeholder="Author 1, Author 2, Author 3"
                      className="w-full border border-black/[0.10] bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#a48768] focus:ring-2 focus:ring-[#a48768]/10"
                    />

                    <p className="mt-2 text-[11px] text-slate-400">
                      Enter the author names as they should
                      appear in the publication.
                    </p>

                  </div>


                  {/* =================================================
                      EMAIL
                  ================================================= */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold">

                      Email Address

                    </label>

                    <input
                      type="email"
                      value={email}
                      onChange={(e) =>
                        setEmail(
                          e.target.value
                        )
                      }
                      placeholder="author@example.com"
                      className="w-full border border-black/[0.10] bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#a48768] focus:ring-2 focus:ring-[#a48768]/10"
                    />

                  </div>


                  {/* =================================================
                      KEYWORDS
                  ================================================= */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold">

                      Keywords

                    </label>

                    <input
                      value={keywords}
                      onChange={(e) =>
                        setKeywords(
                          e.target.value
                        )
                      }
                      placeholder="AI, Machine Learning, IoT, Smart Systems"
                      className="w-full border border-black/[0.10] bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#a48768] focus:ring-2 focus:ring-[#a48768]/10"
                    />

                    <p className="mt-2 text-[11px] text-slate-400">
                      Separate keywords with commas.
                    </p>

                  </div>


                  {/* =================================================
                      ABSTRACT
                  ================================================= */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold">

                      Abstract

                    </label>

                    <textarea
                      rows={6}
                      value={abstract}
                      onChange={(e) =>
                        setAbstract(
                          e.target.value
                        )
                      }
                      placeholder="Enter the abstract of your manuscript..."
                      className="w-full resize-none border border-black/[0.10] bg-white px-4 py-3.5 text-sm leading-7 outline-none transition focus:border-[#a48768] focus:ring-2 focus:ring-[#a48768]/10"
                    />

                  </div>


                  {/* =================================================
                      MANUSCRIPT UPLOAD
                  ================================================= */}

                  <div className="border border-dashed border-black/[0.10] bg-[#f8f6f2] p-5">

                    <div className="flex items-start gap-4">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-white text-[#a48768]">

                        <FileText className="h-4 w-4" />

                      </div>

                      <div>

                        <p className="text-sm font-semibold">
                          Manuscript File
                        </p>

                        <p className="mt-1 text-xs leading-6 text-slate-500">
                          Manuscript file upload is currently
                          handled separately from this submission
                          form.
                        </p>

                      </div>

                    </div>

                  </div>


                  {/* =================================================
                      SUBMIT
                  ================================================= */}

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
                          Submitting Manuscript
                        </span>
                      </>

                    ) : (

                      <>
                        <span>
                          Submit Manuscript
                        </span>

                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />

                      </>

                    )}

                  </button>


                  {/* =================================================
                      DISCLAIMER
                  ================================================= */}

                  <div className="border-t border-black/[0.07] pt-5">

                    <p className="text-xs leading-6 text-slate-400">
                      By submitting this manuscript, the author
                      confirms that the information provided is
                      accurate and that the work is being submitted
                      for consideration by JFER.
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          SUBMISSION STATUS MODAL
      ===================================================== */}

      {(loading ||
        success ||
        error) && (

        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#111111]/70 px-5 backdrop-blur-sm">

          <div className="w-full max-w-md border border-black/[0.08] bg-white shadow-2xl">

            {/* =================================================
                LOADING
            ================================================= */}

            {loading && (

              <div className="px-7 py-9 text-center md:px-9">

                <div className="mx-auto flex h-16 w-16 items-center justify-center bg-[#f8f6f2]">

                  <span className="h-7 w-7 animate-spin rounded-full border-2 border-[#a48768]/20 border-t-[#a48768]" />

                </div>

                <p className="mt-6 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#a48768]">
                  Journal Submission
                </p>

                <h3 className="mt-2 text-2xl font-semibold">
                  Submitting Manuscript
                </h3>

                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
                  Please wait while we process your
                  submission.
                </p>

              </div>

            )}


            {/* =================================================
                SUCCESS
            ================================================= */}

            {success && (

              <div className="px-7 py-9 text-center md:px-9">

                <div className="mx-auto flex h-16 w-16 items-center justify-center bg-[#a48768]/10 text-[#a48768]">

                  <Check className="h-8 w-8" />

                </div>

                <p className="mt-6 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#a48768]">
                  Submission Received
                </p>

                <h3 className="mt-2 text-2xl font-semibold">
                  Submission Successful
                </h3>

                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
                  Your manuscript information has been
                  submitted successfully.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setSuccess(
                      false
                    )
                  }
                  className="mt-7 inline-flex items-center gap-2 bg-[#111111] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#222222]"
                >

                  Continue

                  <ArrowRight className="h-4 w-4" />

                </button>

              </div>

            )}


            {/* =================================================
                ERROR
            ================================================= */}

            {error &&
              !loading && (

                <div className="px-7 py-9 text-center md:px-9">

                  <div className="mx-auto flex h-16 w-16 items-center justify-center bg-red-50 text-red-600">

                    <X className="h-8 w-8" />

                  </div>

                  <p className="mt-6 text-[9px] font-semibold uppercase tracking-[0.22em] text-red-500">
                    Submission Error
                  </p>

                  <h3 className="mt-2 text-2xl font-semibold">
                    Unable to Submit
                  </h3>

                  <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setError("")
                    }
                    className="mt-7 inline-flex items-center justify-center bg-[#111111] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#222222]"
                  >
                    Close
                  </button>

                </div>

              )}

          </div>

        </div>

      )}

    </main>
  );
}