
"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Info,
  Mail,
  MapPin,
  Plus,
  Tag,
  Trash2,
  User,
  Building2,
  Globe2,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";


/* =========================================================
   CATEGORIES
========================================================= */

const categories = [
  "Artificial Intelligence",
  "Machine Learning",
  "Computer Science",
  "Electronics and Communication",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Information Technology",
  "Robotics and Automation",
  "Internet of Things",
  "Embedded Systems",
  "Renewable Energy",
  "Materials Science",
  "Other",
];


/* =========================================================
   PAGE
========================================================= */

export default function SubmitPage() {

  const router =
    useRouter();


  /* =======================================================
     FORM STATE
  ======================================================= */

  const [
    formData,
    setFormData,
  ] = useState({
    title: "",
    author: [""],
    email: "",
    affiliation: "",
    country: "",
    category: "",
    keywords: "",
    abstract: "",
  });

  const [
    declarationConfirmed,
    setDeclarationConfirmed,
  ] = useState(false);


  /* =======================================================
     UI STATE
  ======================================================= */

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    submittedPaperId,
    setSubmittedPaperId,
  ] = useState("");


  /* =======================================================
     HANDLE CHANGE
  ======================================================= */

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement |
      HTMLSelectElement
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


    // Clear previous messages
    if (message) {
      setMessage("");
    }

  };


  /* =======================================================
     AUTHOR MANAGEMENT
  ======================================================= */

  const addAuthor = () => {
    if (formData.author.length >= 8) {
      setMessage("You can add a maximum of 8 author.");
      return;
    }

    setFormData((previous) => ({
      ...previous,
      author: [...previous.author, ""],
    }));

    setMessage("");
  };

  const removeAuthor = (index: number) => {
    if (formData.author.length === 1) {
      return;
    }

    setFormData((previous) => ({
      ...previous,
      author: previous.author.filter((_, authorIndex) => authorIndex !== index),
    }));

    setMessage("");
  };

  const handleAuthorChange = (index: number, value: string) => {
    setFormData((previous) => ({
      ...previous,
      author: previous.author.map((author, authorIndex) =>
        authorIndex === index ? value : author
      ),
    }));

    if (message) {
      setMessage("");
    }
  };

  /* =======================================================
     VALIDATE EMAIL
  ======================================================= */

  const isValidEmail =
    (email: string) => {

      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      );

    };


  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {

    e.preventDefault();

    setMessage("");

    setSubmittedPaperId("");


    /* -----------------------------------------------------
       VALIDATION
    ----------------------------------------------------- */

    const cleanedauthor = formData.author
      .map((author) => author.trim())
      .filter(Boolean);

    if (
      !formData.title.trim() ||
      cleanedauthor.length === 0 ||
      !formData.email.trim() ||
      !formData.affiliation.trim() ||
      !formData.country.trim() ||
      !formData.category.trim() ||
      !formData.keywords.trim() ||
      !formData.abstract.trim()
    ) {

      setMessage(
        "Please complete all required fields, including at least one author."
      );

      return;

    }

    if (cleanedauthor.length > 8) {
      setMessage("A maximum of 8 authors are allowed.");
      return;
    }

    if (cleanedauthor.length !== formData.author.length) {
      setMessage("Please enter a name for every author field.");
      return;
    }

    if (!declarationConfirmed) {
      setMessage(
        "Please confirm the manuscript declaration before submitting."
      );

      return;
    }


    if (
      !isValidEmail(
        formData.email.trim()
      )
    ) {

      setMessage(
        "Please enter a valid email address."
      );

      return;

    }


    if (
      formData.abstract.trim().length >
      250
    ) {

      setMessage(
        "Abstract should not contain > 250 characters."
      );

      return;

    }


    setLoading(true);


    try {

      /* ---------------------------------------------------
         FORM DATA
      --------------------------------------------------- */

      const data =
        new FormData();

      data.append(
        "title",
        formData.title.trim()
      );

      data.append(
        "author",
        cleanedauthor.join(", ")
      );

      data.append(
        "email",
        formData.email.trim()
      );

      data.append(
        "affiliation",
        formData.affiliation.trim()
      );

      data.append(
        "country",
        formData.country.trim()
      );

      data.append(
        "category",
        formData.category.trim()
      );

      data.append(
        "keywords",
        formData.keywords.trim()
      );

      data.append(
        "abstract",
        formData.abstract.trim()
      );


      /* ---------------------------------------------------
         API REQUEST
      --------------------------------------------------- */

      const response =
        await fetch(
          "/api/submit",
          {
            method: "POST",
            body: data,
          }
        );


      const result =
        await response.json();


      if (
        !response.ok ||
        !result.success
      ) {

        throw new Error(
          result.message ||
          "Unable to submit manuscript."
        );

      }


      /* ---------------------------------------------------
         SUCCESS
      --------------------------------------------------- */

      setSubmittedPaperId(
        result.paperId || ""
      );

      setMessage(
        "Your manuscript has been submitted successfully."
      );


      /* ---------------------------------------------------
         RESET FORM
      --------------------------------------------------- */

      setFormData({
        title: "",
        author: [""],
        email: "",
        affiliation: "",
        country: "",
        category: "",
        keywords: "",
        abstract: "",
      });

      setDeclarationConfirmed(false);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

    } catch (error) {

      console.error(
        "SUBMISSION ERROR:",
        error
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to submit manuscript. Please try again."
      );

    } finally {

      setLoading(false);

    }

  };


  /* =======================================================
     SUCCESS SCREEN
  ======================================================= */

  if (
    submittedPaperId &&
    message.includes(
      "successfully"
    )
  ) {

    return (

      <main className="min-h-screen bg-[#f5f6f7] text-[#171a1d]">

        {/* ===============================================
            HEADER
        =============================================== */}

        <header className="bg-[#202b35] text-white">

          <div className="max-w-6xl mx-auto px-5 sm:px-7 lg:px-9">

            <div className="h-20 flex items-center justify-between">

              <button
                onClick={() =>
                  router.push("/")
                }
                className="flex items-center gap-3 group"
              >

                <div className="w-10 h-10 rounded-xl bg-[#c7a77d] text-[#202b35] flex items-center justify-center font-bold">
                  J
                </div>

                <div className="text-left">

                  <p className="text-sm font-bold tracking-wide">
                    JFER
                  </p>

                  <p className="text-[9px] text-white/40 uppercase tracking-[0.18em]">
                    Journal of Future Engineering and Research
                  </p>

                </div>

              </button>

            </div>

          </div>

        </header>


        {/* ===============================================
            SUCCESS
        =============================================== */}

        <section className="max-w-3xl mx-auto px-5 py-16 md:py-24">

          <div className="bg-white border border-[#e1e4e6] rounded-2xl shadow-sm overflow-hidden">

            <div className="h-1.5 bg-[#62805b]" />

            <div className="p-7 md:p-10 text-center">

              <div className="w-16 h-16 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mx-auto">

                <CheckCircle2
                  size={30}
                />

              </div>


              <p className="mt-6 text-[9px] uppercase tracking-[0.2em] text-[#a48768] font-semibold">
                Submission Received
              </p>


              <h1 className="mt-3 text-2xl md:text-3xl font-semibold tracking-[-0.025em]">
                Manuscript submitted successfully
              </h1>


              <p className="mt-4 max-w-xl mx-auto text-sm leading-7 text-[#777]">
                Thank you for submitting your manuscript
                to the Journal of Future Engineering and Research.
                Your submission has been received by the editorial office.
              </p>


              <div className="mt-7 rounded-xl bg-[#f7f8f8] border border-[#e5e7e8] p-5">

                <p className="text-[9px] uppercase tracking-[0.16em] text-[#999] font-semibold">
                  Submission ID
                </p>

                <p className="mt-2 font-mono text-sm font-semibold text-[#244e70]">
                  {submittedPaperId}
                </p>

              </div>


              <div className="mt-5 rounded-xl bg-[#fffaf4] border border-[#eadbc7] p-4 text-left">

                <div className="flex gap-3">

                  <Info
                    size={16}
                    className="text-[#a48768] shrink-0 mt-0.5"
                  />

                  <p className="text-xs leading-6 text-[#666]">
                    Please keep your submission ID for
                    future correspondence with the editorial office.
                  </p>

                </div>

              </div>


              <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">

                <button
                  onClick={() =>
                    router.push("/")
                  }
                  className="h-10 px-6 rounded-xl bg-[#202b35] text-white text-xs font-semibold hover:bg-[#16212a] transition"
                >
                  Return Home
                </button>

                <button
                  onClick={() =>
                    window.location.reload()
                  }
                  className="h-10 px-6 rounded-xl border border-[#dfe2e4] bg-white text-[#526b7d] text-xs font-semibold hover:bg-[#f5f6f7] transition"
                >
                  Submit Another Manuscript
                </button>

              </div>

            </div>

          </div>

        </section>

      </main>

    );
  }


  /* =======================================================
     NORMAL PAGE
  ======================================================= */

  return (

    <main className="min-h-screen bg-[#f5f6f7] text-[#171a1d]">


      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="bg-[#202b35] text-white">

        <div className="max-w-6xl mx-auto px-5 sm:px-7 lg:px-9">

          <div className="h-20 flex items-center justify-between">

            <button
              onClick={() =>
                router.back()
              }
              className="flex items-center gap-3 group"
            >

              <div className="w-10 h-10 rounded-xl bg-[#c7a77d] text-[#202b35] flex items-center justify-center font-bold">
                J
              </div>

              <div className="text-left">

                <p className="text-sm font-bold tracking-wide">
                  JFER
                </p>

                <p className="text-[9px] text-white/40 uppercase tracking-[0.18em]">
                  Journal of Future Engineering and Research
                </p>

              </div>

            </button>


            <div className="hidden sm:flex items-center gap-2 text-[10px] text-white/40">

              <FileText
                size={13}
              />

              Manuscript Submission

            </div>

          </div>

        </div>

      </header>


      {/* ===================================================
          HERO
      =================================================== */}

      <section className="bg-white border-b border-[#e3e5e7]">

        <div className="max-w-6xl mx-auto px-5 sm:px-7 lg:px-9 py-10 md:py-14">

          <button
            onClick={() =>
              router.back()
            }
            className="inline-flex items-center gap-2 text-xs text-[#777] hover:text-[#244e70] transition mb-7"
          >

            <ArrowLeft
              size={14}
            />

            Back

          </button>


          <div className="max-w-3xl">

            <div className="flex items-center gap-3">

              <span className="h-px w-9 bg-[#a48768]" />

              <span className="text-[9px] uppercase tracking-[0.22em] text-[#a48768] font-semibold">
                Submit Your Research
              </span>

            </div>


            <h1 className="mt-5 text-3xl md:text-4xl lg:text-5xl font-semibold tracking-[-0.04em] text-[#202326]">
              Manuscript Submission
            </h1>


            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#777]">
              Submit your research details for consideration
              by the JFER editorial team. Please provide accurate
              information in all required fields.
            </p>

          </div>

        </div>

      </section>


      {/* ===================================================
          FORM AREA
      =================================================== */}

      <section className="max-w-6xl mx-auto px-5 sm:px-7 lg:px-9 py-8 md:py-10">

        <div className="grid lg:grid-cols-[minmax(0,1fr)_300px] gap-6">


          {/* =================================================
              FORM
          ================================================= */}

          <form
            onSubmit={
              handleSubmit
            }
            className="bg-white border border-[#e1e4e6] rounded-2xl shadow-sm overflow-hidden"
          >

            {/* FORM HEADER */}

            <div className="px-6 md:px-8 py-6 border-b border-[#e8eaec]">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-[#edf2f5] text-[#244e70] flex items-center justify-center">

                  <FileText
                    size={18}
                  />

                </div>

                <div>

                  <p className="text-[9px] uppercase tracking-[0.18em] text-[#a0a3a5] font-semibold">
                    Step 01
                  </p>

                  <h2 className="text-lg font-semibold text-[#202326] mt-0.5">
                    Manuscript Information
                  </h2>

                </div>

              </div>

            </div>


            {/* FORM CONTENT */}

            <div className="p-6 md:p-8 space-y-7">


              {/* =================================================
                  TITLE
              ================================================= */}

              <FormField
                label="Title"
                required
                icon={
                  <FileText
                    size={14}
                  />
                }
              >

                <input
                  type="text"
                  name="title"
                  value={
                    formData.title
                  }
                  onChange={
                    handleChange
                  }
                  required
                  placeholder="Enter the complete title of your manuscript"
                  className="input-field"
                />

              </FormField>


              {/* =================================================
                  author
              ================================================= */}

              <FormField
                label="Author(s)"
                required
                icon={
                  <User
                    size={14}
                  />
                }
                help="Add up to 8 authors. The first author is listed as Author 1."
              >

                <div className="space-y-3">

                  {formData.author.map((author, index) => (

                    <div
                      key={index}
                      className="flex items-center gap-2"
                    >

                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={author}
                          onChange={(e) =>
                            handleAuthorChange(
                              index,
                              e.target.value
                            )
                          }
                          required
                          placeholder={
                            index === 0
                              ? "e.g. John Smith"
                              : `Author ${index + 1} name`
                          }
                          className="input-field pr-16"
                        />

                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] uppercase tracking-[0.12em] text-[#aaa]">
                          {index + 1} / 8
                        </span>
                      </div>

                      {formData.author.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeAuthor(index)
                          }
                          className="w-10 h-10 rounded-xl border border-[#dfe2e4] bg-white text-[#888] flex items-center justify-center hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition"
                          aria-label={`Remove author ${index + 1}`}
                          title={`Remove author ${index + 1}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}

                    </div>

                  ))}

                  <div className="flex items-center justify-between gap-3 pt-1">

                    <button
                      type="button"
                      onClick={addAuthor}
                      disabled={formData.author.length >= 8}
                      className="inline-flex items-center gap-2 h-9 px-4 rounded-xl border border-[#dfe2e4] bg-white text-[#526b7d] text-[10px] font-semibold hover:bg-[#f7f8f8] hover:border-[#cfd4d7] transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Plus size={14} />
                      Add Author
                    </button>

                    <span className="text-[10px] text-[#aaa]">
                      {formData.author.length} of 8 author
                    </span>

                  </div>

                  {formData.author.length >= 8 && (
                    <p className="text-[10px] text-[#a48768]">
                      Maximum of 8 author reached.
                    </p>
                  )}

                </div>

              </FormField>


              {/* =================================================
                  EMAIL
              ================================================= */}

              <FormField
                label="Email"
                required
                icon={
                  <Mail
                    size={14}
                  />
                }
              >

                <input
                  type="email"
                  name="email"
                  value={
                    formData.email
                  }
                  onChange={
                    handleChange
                  }
                  required
                  placeholder="author@example.com"
                  className="input-field"
                />

              </FormField>


              {/* =================================================
                  AFFILIATION
              ================================================= */}

              <FormField
                label="Affiliation"
                required
                icon={
                  <Building2
                    size={14}
                  />
                }
                help="University, institution, company, or research organization."
              >

                <input
                  type="text"
                  name="affiliation"
                  value={
                    formData.affiliation
                  }
                  onChange={
                    handleChange
                  }
                  required
                  placeholder="e.g. Department of Computer Science, ABC University"
                  className="input-field"
                />

              </FormField>


              {/* =================================================
                  COUNTRY + CATEGORY
              ================================================= */}

              <div className="grid md:grid-cols-2 gap-5">

                <FormField
                  label="Country"
                  required
                  icon={
                    <Globe2
                      size={14}
                    />
                  }
                >

                  <input
                    type="text"
                    name="country"
                    value={
                      formData.country
                    }
                    onChange={
                      handleChange
                    }
                    required
                    placeholder="e.g. India"
                    className="input-field"
                  />

                </FormField>


                <FormField
                  label="Category"
                  required
                  icon={
                    <Tag
                      size={14}
                    />
                  }
                >

                  <select
                    name="category"
                    value={
                      formData.category
                    }
                    onChange={
                      handleChange
                    }
                    required
                    className={`input-field ${
                      formData.category
                        ? "text-[#333]"
                        : "text-[#aaa]"
                    }`}
                  >

                    <option
                      value=""
                    >
                      Select manuscript category
                    </option>

                    {categories.map(
                      (
                        category
                      ) => (

                        <option
                          key={
                            category
                          }
                          value={
                            category
                          }
                        >
                          {category}
                        </option>

                      )
                    )}

                  </select>

                </FormField>

              </div>


              {/* =================================================
                  KEYWORDS
              ================================================= */}

              <FormField
                label="Keyword"
                required
                icon={
                  <Tag
                    size={14}
                  />
                }
                help="Separate multiple keywords using commas."
              >

                <input
                  type="text"
                  name="keywords"
                  value={
                    formData.keywords
                  }
                  onChange={
                    handleChange
                  }
                  required
                  placeholder="e.g. artificial intelligence, IoT, embedded systems"
                  className="input-field"
                />

              </FormField>


              {/* =================================================
                  ABSTRACT
              ================================================= */}

              <FormField
                label="Abstract"
                required
                icon={
                  <FileText
                    size={14}
                  />
                }
                help="Provide a concise summary of your research, methodology, results, and contribution."
              >

                <textarea
                  name="abstract"
                  value={
                    formData.abstract
                  }
                  onChange={
                    handleChange
                  }
                  required
                  rows={9}
                  placeholder="Enter the abstract of your manuscript..."
                  className="input-field resize-y min-h-[220px]"
                />

                <div className="flex justify-end mt-2">

                  <span className="text-[10px] text-[#aaa]">
                    {
                      formData.abstract.length
                    }{" "}
                    characters
                  </span>

                </div>

              </FormField>


              {/* =================================================
                  PDF NOTICE
              ================================================= */}

              <div className="rounded-xl border border-[#eadbc7] bg-[#fffaf4] p-4">

                <div className="flex gap-3">

                  <Info
                    size={16}
                    className="text-[#a48768] shrink-0 mt-0.5"
                  />

                  <div>

                    <p className="text-xs font-semibold text-[#665542]">
                      Manuscript file upload
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#8a7b68]">
                      PDF upload is temporarily unavailable.
                      You can submit the manuscript information
                      above now. File upload will be added to
                      the submission workflow later.
                    </p>

                  </div>

                </div>

              </div>


              {/* =================================================
                  REQUIRED DECLARATION
              ================================================= */}

              <div className="rounded-xl border border-[#e1e4e6] bg-[#fafbfb] p-5">

                <div className="flex items-start gap-3">

                  <div className="w-9 h-9 rounded-xl bg-[#edf2f5] text-[#244e70] flex items-center justify-center shrink-0">
                    <CheckCircle2 size={16} />
                  </div>

                  <div className="flex-1">

                    <p className="text-[9px] uppercase tracking-[0.18em] text-[#999] font-semibold">
                      Mandatory Declaration
                    </p>

                    <h3 className="mt-1 text-sm font-semibold text-[#333]">
                      Author confirmation
                    </h3>

                    <label className="mt-4 flex items-start gap-3 cursor-pointer">

                      <input
                        type="checkbox"
                        checked={declarationConfirmed}
                        onChange={(e) =>
                          setDeclarationConfirmed(
                            e.target.checked
                          )
                        }
                        className="mt-0.5 h-4 w-4 shrink-0 accent-[#244e70]"
                        required
                      />

                      <span className="text-xs leading-6 text-[#555]">
                        I confirm that this manuscript is original, has not been
                        published elsewhere, and is not under consideration by
                        any other journal.
                        <span className="text-red-500 ml-1">*</span>
                      </span>

                    </label>

                    <p className="mt-3 text-[10px] leading-5 text-[#999]">
                      You must confirm this declaration before the manuscript
                      can be submitted.
                    </p>

                  </div>

                </div>

              </div>


              {/* =================================================
                  MESSAGE
              ================================================= */}

              {message && (

                <div className={`rounded-xl border p-4 flex items-start gap-3 ${
                  message.includes(
                    "successfully"
                  )
                    ? "border-green-200 bg-green-50"
                    : "border-red-200 bg-red-50"
                }`}>

                  {message.includes(
                    "successfully"
                  ) ? (

                    <CheckCircle2
                      size={17}
                      className="text-green-600 shrink-0 mt-0.5"
                    />

                  ) : (

                    <Info
                      size={17}
                      className="text-red-500 shrink-0 mt-0.5"
                    />

                  )}

                  <p className={`text-xs leading-5 ${
                    message.includes(
                      "successfully"
                    )
                      ? "text-green-700"
                      : "text-red-700"
                  }`}>
                    {message}
                  </p>

                </div>

              )}


              {/* =================================================
                  SUBMIT BUTTON
              ================================================= */}

              <div className="pt-2">

                <button
                  type="submit"
                  disabled={
                    loading ||
                    !declarationConfirmed
                  }
                  className="group w-full h-12 rounded-xl bg-[#202b35] text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#16212a] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >

                  {loading ? (

                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />

                      Submitting Manuscript...

                    </>

                  ) : (

                    <>
                      Submit Manuscript

                      <ArrowRight
                        size={15}
                        className="group-hover:translate-x-1 transition-transform"
                      />

                    </>

                  )}

                </button>

              </div>


              <p className="text-center text-[10px] leading-5 text-[#aaa]">

                Submission is enabled only after you confirm the
                mandatory manuscript declaration above.

              </p>

            </div>

          </form>


          {/* =================================================
              RIGHT INFORMATION
          ================================================= */}

          <aside className="space-y-5">


            {/* SUBMISSION PROCESS */}

            <div className="bg-[#202b35] rounded-2xl p-5 text-white">

              <p className="text-[9px] uppercase tracking-[0.2em] text-[#c7a77d] font-semibold">
                Submission Process
              </p>

              <h2 className="mt-2 text-base font-semibold">
                What happens next?
              </h2>


              <div className="mt-5 space-y-4">

                <ProcessStep
                  number="01"
                  title="Submission"
                  description="Your manuscript information is received by the editorial office."
                  active
                />

                <ProcessStep
                  number="02"
                  title="Initial Screening"
                  description="The editorial team checks scope, completeness, and basic suitability."
                />

                <ProcessStep
                  number="03"
                  title="Peer Review"
                  description="Suitable manuscripts are assigned to qualified reviewers."
                />

                <ProcessStep
                  number="04"
                  title="Editorial Decision"
                  description="The editorial team records the outcome based on the review."
                />

              </div>

            </div>


            {/* REQUIRED FIELDS */}

            <div className="bg-white border border-[#e1e4e6] rounded-2xl p-5">

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-xl bg-[#edf2f5] text-[#244e70] flex items-center justify-center">

                  <Info
                    size={16}
                  />

                </div>

                <div>

                  <p className="text-[9px] uppercase tracking-[0.18em] text-[#999] font-semibold">
                    Before You Submit
                  </p>

                  <h2 className="text-sm font-semibold text-[#333] mt-0.5">
                    Required information
                  </h2>

                </div>

              </div>


              <ul className="mt-5 space-y-3">

                {[
                  "Complete manuscript title",
                  "1–8 author names",
                  "Valid email address",
                  "Institutional affiliation",
                  "Country",
                  "Research category",
                  "Relevant keywords",
                  "Clear abstract",
                  "Mandatory manuscript declaration",
                ].map(
                  (item) => (

                    <li
                      key={item}
                      className="flex items-start gap-2.5"
                    >

                      <CheckCircle2
                        size={14}
                        className="text-[#62805b] shrink-0 mt-0.5"
                      />

                      <span className="text-xs text-[#666]">
                        {item}
                      </span>

                    </li>

                  )
                )}

              </ul>

            </div>


            {/* CONTACT */}

            <div className="bg-white border border-[#e1e4e6] rounded-2xl p-5">

              <p className="text-[9px] uppercase tracking-[0.18em] text-[#999] font-semibold">
                Editorial Office
              </p>

              <p className="mt-2 text-sm font-semibold text-[#333]">
                Need assistance?
              </p>

              <p className="mt-2 text-xs leading-5 text-[#888]">
                Contact the editorial office if you have
                questions about the submission process.
              </p>

              <div className="mt-4 flex items-center gap-2 text-xs text-[#526b7d]">

                <Mail
                  size={14}
                />

                editorial@jfer.org

              </div>

            </div>

          </aside>

        </div>

      </section>


      {/* ===================================================
          FOOTER
      =================================================== */}

      <footer className="border-t border-[#e1e4e6] bg-white">

        <div className="max-w-6xl mx-auto px-5 sm:px-7 lg:px-9 py-7">

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">

            <p className="text-[10px] text-[#aaa]">
              © {new Date().getFullYear()} Journal of Future Engineering and Research
            </p>

            <p className="text-[10px] text-[#aaa]">
              Editorial Submission Portal
            </p>

          </div>

        </div>

      </footer>


      {/* ===================================================
          GLOBAL INPUT STYLES
      =================================================== */}

      <style jsx global>{`

        .input-field {
          width: 100%;
          min-height: 42px;
          border: 1px solid #dfe2e4;
          border-radius: 10px;
          background: #ffffff;
          padding: 10px 13px;
          font-size: 12px;
          color: #333333;
          outline: none;
          transition:
            border-color 150ms ease,
            box-shadow 150ms ease,
            background 150ms ease;
        }

        .input-field::placeholder {
          color: #b2b4b6;
        }

        .input-field:hover {
          border-color: #cfd4d7;
        }

        .input-field:focus {
          border-color: #244e70;
          box-shadow:
            0 0 0 3px
            rgba(36, 78, 112, 0.08);
        }

        select.input-field {
          appearance: none;
          background-image:
            linear-gradient(
              45deg,
              transparent 50%,
              #999 50%
            ),
            linear-gradient(
              135deg,
              #999 50%,
              transparent 50%
            );
          background-position:
            calc(100% - 17px) 17px,
            calc(100% - 12px) 17px;
          background-size:
            5px 5px,
            5px 5px;
          background-repeat: no-repeat;
          padding-right: 35px;
        }

      `}</style>

    </main>
  );
}


/* ============================================================
   FORM FIELD
============================================================ */

function FormField({
  label,
  required,
  icon,
  help,
  children,
}: {
  label: string;
  required?: boolean;
  icon?: React.ReactNode;
  help?: string;
  children: React.ReactNode;
}) {

  return (

    <div>

      <div className="flex items-center gap-2 mb-2">

        {icon && (

          <span className="text-[#a48768]">
            {icon}
          </span>

        )}

        <label className="text-xs font-semibold text-[#3b3f42]">

          {label}

          {required && (
            <span className="text-red-500 ml-1">
              *
            </span>
          )}

        </label>

      </div>


      {children}


      {help && (

        <p className="mt-2 text-[10px] text-[#aaa]">
          {help}
        </p>

      )}

    </div>
  );
}


/* ============================================================
   PROCESS STEP
============================================================ */

function ProcessStep({
  number,
  title,
  description,
  active = false,
}: {
  number: string;
  title: string;
  description: string;
  active?: boolean;
}) {

  return (

    <div className="flex gap-3">

      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[9px] font-semibold ${
        active
          ? "bg-[#c7a77d] text-[#202b35]"
          : "bg-white/10 text-white/40"
      }`}>

        {number}

      </div>


      <div>

        <p className={`text-xs font-semibold ${
          active
            ? "text-white"
            : "text-white/65"
        }`}>
          {title}
        </p>

        <p className="mt-1 text-[10px] leading-5 text-white/35">
          {description}
        </p>

      </div>

    </div>
  );
}
