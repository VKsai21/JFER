export default function GuidelinesPage() {
  const sections = [
    "Manuscript Preparation",
    "Paper Structure",
    "Abstract & Keywords",
    "References",
    "Originality & Plagiarism",
    "Peer Review Process",
    "Submission Process",
    "Copyright & Ethics",
    "Contact Information",
  ];

  return (
    <main className="min-h-screen bg-[#f8f6f2]">
      {/* Hero */}
      <section className="border-b border-black/10 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-2">
          <p className="text-sm uppercase tracking-[0.25em] text-gray-500 mb-4">
            Journal of Future Engineering and Research
          </p>

          <h1 className="text-5xl md:text-6xl font-serif font-semibold text-gray-900 max-w-4xl leading-tight">
            Submission Guidelines
          </h1>

          <p className="mt-6 text-lg text-gray-600 max-w-3xl leading-relaxed">
            The Journal of Future Engineering and Research (JFER) invites
            original research articles, review papers, case studies, and
            technical papers from researchers, academicians, industry
            professionals, and scholars. Authors are requested to follow the
            submission guidelines carefully to ensure smooth review and
            publication processing.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="/submit"
              className="px-6 py-3 rounded-full bg-black text-white font-medium hover:bg-gray-800 transition"
            >
              Submit Paper
            </a>

            <a
              href="/manuscript template.docx"
              className="px-6 py-3 rounded-full border border-black/15 bg-white hover:bg-black hover:text-white transition"
            >
              Download Template
            </a>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-[260px_1fr] gap-12">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 bg-white rounded-3xl border border-black/10 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Quick Navigation
              </h3>

              <nav className="space-y-3">
                {sections.map((section, index) => (
                  <a
                    key={section}
                    href={`#section-${index + 1}`}
                    className="block text-sm text-gray-600 hover:text-black transition"
                  >
                    {index + 1}. {section}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="space-y-3">
            {/* Section 1 */}
            <div
              id="section-1"
              className="bg-white rounded-3xl border border-black/10 p-8"
            >
              <h2 className="text-2xl font-semibold mb-6">
                1. Manuscript Preparation
              </h2>

              <ul className="space-y-3 text-gray-700 leading-relaxed">
                <li>• Manuscripts must be written in clear English.</li>
                <li>• Paper should be prepared in MS Word format.</li>
                <li>• Use Times New Roman font throughout the manuscript.</li>
                <li>• Title should be in 16 pt bold font.</li>
                <li>• Main headings should be in 14 pt bold font.</li>
                <li>
                  • Body text should be in 12 pt font with 1.5 line spacing.
                </li>
                <li>
                  • Paper size must be A4 with 1-inch margins on all sides.
                </li>
              </ul>
            </div>

            {/* Section 2 */}
            <div
              id="section-2"
              className="bg-white rounded-3xl border border-black/10 p-8"
            >
              <h2 className="text-2xl font-semibold mb-6">
                2. Paper Structure
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                {[
                  "Title of the Paper",
                  "Author Name(s) and Affiliation",
                  "Abstract",
                  "Keywords",
                  "Introduction",
                  "Literature Review",
                  "Methodology",
                  "Results and Discussion",
                  "Conclusion",
                  "References",
                ].map((item) => (
                  <div
                    key={item}
                    className="border border-black/10 rounded-2xl p-4"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3 */}
            <div
              id="section-3"
              className="bg-white rounded-3xl border border-black/10 p-8"
            >
              <h2 className="text-2xl font-semibold mb-6">
                3. Abstract & Keywords
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="border border-black/10 rounded-2xl p-6">
                  <h3 className="font-semibold mb-3">Abstract</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• 150–250 words.</li>
                    <li>
                      • Should summarize objectives, methodology, findings, and
                      conclusions.
                    </li>
                  </ul>
                </div>

                <div className="border border-black/10 rounded-2xl p-6">
                  <h3 className="font-semibold mb-3">Keywords</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Include 4–6 relevant keywords.</li>
                    <li>
                      • Keywords should accurately reflect the research topic.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 4 */}
            <div
              id="section-4"
              className="bg-white rounded-3xl border border-black/10 p-8"
            >
              <h2 className="text-2xl font-semibold mb-6">4. References</h2>

              <ul className="space-y-3 text-gray-700">
                <li>• References should follow IEEE citation format.</li>
                <li>
                  • All references cited in the text must be included in the
                  reference section.
                </li>
                <li>
                  • Authors should verify all reference details before
                  submission.
                </li>
              </ul>
            </div>

            {/* Section 5 */}
            <div
              id="section-5"
              className="bg-white rounded-3xl border border-black/10 p-8"
            >
              <h2 className="text-2xl font-semibold mb-6">
                5. Originality & Plagiarism
              </h2>

              <div className="rounded-2xl bg-red-50 border border-red-100 p-6">
                <ul className="space-y-3 text-gray-700">
                  <li>
                    • Submitted manuscripts must be original and unpublished.
                  </li>
                  <li>
                    • Similarity index should not exceed{" "}
                    <strong>15%</strong>.
                  </li>
                  <li>
                    • Plagiarism or unethical practices will lead to immediate
                    rejection.
                  </li>
                </ul>
              </div>
            </div>

            {/* Section 6 */}
            <div
              id="section-6"
              className="bg-white rounded-3xl border border-black/10 p-8"
            >
              <h2 className="text-2xl font-semibold mb-6">
                6. Peer Review Process
              </h2>

              <div className="grid md:grid-cols-5 gap-4">
                {[
                  "Editorial Screening",
                  "Quality Assessment",
                  "Peer Review",
                  "Author Revision",
                  "Final Decision",
                ].map((step, index) => (
                  <div
                    key={step}
                    className="border border-black/10 rounded-2xl p-5 text-center"
                  >
                    <div className="text-2xl font-bold text-gray-300 mb-2">
                      {index + 1}
                    </div>
                    <div className="text-sm font-medium">{step}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 7 */}
            <div
              id="section-7"
              className="bg-white rounded-3xl border border-black/10 p-8"
            >
              <h2 className="text-2xl font-semibold mb-6">
                7. Submission Process
              </h2>

              <ul className="space-y-3 text-gray-700">
                <li>
                  • Submit manuscripts through the journal submission portal or
                  official email.
                </li>
                <li>
                  • The corresponding author must provide valid contact details.
                </li>
                <li>
                  • Submission confirmation will be sent through email.
                </li>
              </ul>
            </div>

            {/* Section 8 */}
            <div
              id="section-8"
              className="bg-white rounded-3xl border border-black/10 p-8"
            >
              <h2 className="text-2xl font-semibold mb-6">
                8. Copyright & Ethics
              </h2>

              <ul className="space-y-3 text-gray-700">
                <li>
                  • Authors are responsible for the authenticity of the
                  submitted work.
                </li>
                <li>
                  • Any conflict of interest must be clearly declared.
                </li>
                <li>
                  • The journal follows standard publication ethics and academic
                  integrity policies.
                </li>
              </ul>
            </div>

            {/* Section 9 */}
            <div
              id="section-9"
              className="bg-white rounded-3xl border border-black/10 p-8"
            >
              <h2 className="text-2xl font-semibold mb-6">
                9. Contact Information
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-black/10 p-6">
                  <p className="text-sm text-gray-500 mb-2">
                    Editorial Office
                  </p>
                  <p className="font-medium">editor@jfer.ac.in</p>
                </div>

                <div className="rounded-2xl border border-black/10 p-6">
                  <p className="text-sm text-gray-500 mb-2">Support Team</p>
                  <p className="font-medium">support@jfer.ac.in</p>
                </div>
              </div>
            </div>

            {/* Important Note */}
            <div className="bg-black text-white rounded-3xl p-4">
              <h2 className="text-2xl font-semibold mb-4">
                Important Notice
              </h2>

              <p className="text-gray-300 leading-relaxed">
                Submission of a manuscript to JFER implies that the work has
                not been published previously, is not under consideration
                elsewhere, and that all authors have approved the manuscript for
                submission.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}