
"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "@/lib/firebase";

export default function ArchivesPage() {
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPaper, setSelectedPaper] = useState<any>(null);

  /*
   * ============================
   * FETCH PUBLISHED PAPERS
   * ============================
   */

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const submissionsSnapshot = await getDocs(
          collection(firestore, "submissions")
        );

        const approvedPublishedPapers: any[] = [];

        submissionsSnapshot.forEach((submissionDoc) => {
          const data = submissionDoc.data();

          /*
           * ONLY SHOW PAPERS WHERE:
           *
           * status = approved
           * publicationStatus = published
           */

          if (
            data.status === "approved" &&
            data.publicationStatus === "published"
          ) {
            approvedPublishedPapers.push({
              id: submissionDoc.id,
              ...data,
            });
          }
        });

        setPapers(approvedPublishedPapers);
      } catch (error) {
        console.error(
          "Error fetching published papers:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPapers();
  }, []);

  /*
   * ============================
   * GROUP BY YEAR
   * ============================
   */

  const groupedByYear = useMemo(() => {
    const grouped: Record<
      string,
      Record<string, any[]>
    > = {};

    papers.forEach((paper) => {
      const year = String(paper.year || "Unknown");
      const volume = String(
        paper.volume || "Unknown"
      );

      if (!grouped[year]) {
        grouped[year] = {};
      }

      if (!grouped[year][volume]) {
        grouped[year][volume] = [];
      }

      grouped[year][volume].push(paper);
    });

    return grouped;
  }, [papers]);

  /*
   * ============================
   * SORT YEARS
   * ============================
   */

  const years = useMemo(() => {
    return Object.keys(groupedByYear).sort(
      (a, b) => Number(b) - Number(a)
    );
  }, [groupedByYear]);

  /*
   * ============================
   * ARTICLE DETAIL VIEW
   * ============================
   */

  if (selectedPaper) {
    return (
      <main className="max-w-5xl mx-auto px-6 py-6">
        <button
          onClick={() => setSelectedPaper(null)}
          className="mb-10 text-cyan-700 font-medium hover:text-cyan-800 transition"
        >
          ← Back to Archive
        </button>

        {/* YEAR / VOLUME */}

        <div className="mb-6 flex flex-wrap gap-3">
          <span className="px-4 py-2 rounded-full bg-slate-100 text-sm text-slate-700">
            {selectedPaper.year} / Volume{" "}
            {selectedPaper.volume}
          </span>
        </div>

        {/* TITLE */}

        <h1 className="text-5xl font-bold text-slate-900 leading-tight mb-3">
          {selectedPaper.title}
        </h1>

        {/* AUTHOR */}

        <p className="text-xl text-slate-600 mb-8">
          {selectedPaper.author}
        </p>

        {/* ABSTRACT */}

        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold mb-2">
            Abstract
          </h2>

          <p className="text-slate-700 leading-8 text-justify">
            {selectedPaper.abstract}
          </p>
        </div>

        {/* KEYWORDS */}

        {selectedPaper.keywords && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">
              Keywords
            </h2>

            <p className="text-slate-700">
              {selectedPaper.keywords}
            </p>
          </div>
        )}

        {/* PDF */}

        {selectedPaper.pdfUrl && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-3">
              PDF Preview
            </h2>

            <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
              <iframe
                src={`https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
                  selectedPaper.pdfUrl
                )}`}
                width="100%"
                height="900"
                className="w-full"
                title="PDF Preview"
              />
            </div>
          </div>
        )}

        {/* DOWNLOAD */}

        {selectedPaper.pdfUrl && (
          <div className="mt-12">
            <a
              href={selectedPaper.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex px-6 py-4 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition"
            >
              Download Paper
            </a>
          </div>
        )}
      </main>
    );
  }

  /*
   * ============================
   * SKELETON LOADING
   * ============================
   */

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-0">
        {/* HERO SKELETON */}

        <div className="text-center mb-10">
          <div className="mx-auto h-4 w-40 bg-slate-200 rounded animate-pulse mb-4" />

          <div className="mx-auto h-14 w-96 max-w-full bg-slate-200 rounded-xl animate-pulse mb-4" />

          <div className="mx-auto h-5 w-96 max-w-full bg-slate-200 rounded animate-pulse" />
        </div>

        {/* YEAR SKELETON */}

        <div className="mb-10">
          <div className="h-7 w-24 bg-slate-200 rounded animate-pulse mb-5" />

          <div className="flex gap-3">
            <div className="h-12 w-24 bg-slate-200 rounded-xl animate-pulse" />
            <div className="h-12 w-24 bg-slate-200 rounded-xl animate-pulse" />
            <div className="h-12 w-24 bg-slate-200 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* VOLUME + PAPER SKELETONS */}

        <div className="space-y-10">
          {[1, 2].map((section) => (
            <section key={section}>
              {/* Volume */}

              <div className="h-9 w-40 bg-slate-200 rounded animate-pulse mb-4" />

              <div className="w-full border rounded-3xl overflow-hidden bg-white">
                {[1, 2, 3].map((paper) => (
                  <div
                    key={paper}
                    className="p-8 border-b last:border-b-0"
                  >
                    <div className="h-7 w-3/4 bg-slate-200 rounded animate-pulse mb-4" />

                    <div className="h-5 w-1/3 bg-slate-200 rounded animate-pulse mb-5" />

                    <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    );
  }

  /*
   * ============================
   * ARCHIVE PAGE
   * ============================
   */

  return (
    <main className="max-w-7xl mx-auto px-6 py-0">
      {/* HERO */}

      <div className="text-center mb-10">
        <p className="uppercase tracking-[0.4em] text-sm text-slate-500 mb-2">
          Research Archive
        </p>

        <h1 className="text-6xl font-bold text-slate-900 -mt-2 mb-2">
          Published Papers
        </h1>

        <p className="text-slate-600 max-w-2xl mx-auto">
          Browse all published research articles
          by year and volume.
        </p>
      </div>

      {/* EMPTY STATE */}

      {papers.length === 0 && (
        <div className="border rounded-3xl bg-white py-20 text-center">
          <h2 className="text-2xl font-semibold text-slate-800">
            No published papers available
          </h2>

          <p className="text-slate-500 mt-2">
            There are currently no approved and published
            papers in the archive.
          </p>
        </div>
      )}

      {/* ============================
          YEAR
         ============================ */}

      {years.length > 0 && (
        <div className="space-y-12">
          {years.map((year) => {
            const volumes = groupedByYear[year];

            const sortedVolumes = Object.keys(
              volumes
            ).sort(
              (a, b) => Number(a) - Number(b)
            );

            return (
              <section key={year}>
                {/* YEAR TITLE */}

                <div className="mb-6">
                  <h2 className="text-4xl font-bold text-slate-900">
                    {year}
                  </h2>

                  <div className="w-20 h-1 bg-cyan-600 mt-3 rounded-full" />
                </div>

                {/* ============================
                    VOLUMES UNDER YEAR
                   ============================ */}

                <div className="space-y-8">
                  {sortedVolumes.map((volume) => {
                    const volumePapers =
                      volumes[volume];

                    return (
                      <section
                        key={`${year}-${volume}`}
                        className="ml-0 md:ml-6"
                      >
                        {/* VOLUME TITLE */}

                        <div className="mb-4">
                          <h3 className="text-2xl font-bold text-slate-800">
                            Volume {volume}
                          </h3>
                        </div>

                        {/* ============================
                            PAPERS UNDER VOLUME
                           ============================ */}

                        <div className="bg-white border rounded-3xl overflow-hidden">
                          {volumePapers.map(
                            (
                              paper: any,
                              index: number
                            ) => (
                              <button
                                key={paper.id}
                                onClick={() =>
                                  setSelectedPaper(
                                    paper
                                  )
                                }
                                className={`w-full text-left p-8 hover:bg-slate-50 transition ${
                                  index !==
                                  volumePapers.length -
                                    1
                                    ? "border-b"
                                    : ""
                                }`}
                              >
                                {/* TITLE */}

                                <h4 className="text-2xl font-semibold text-slate-900 mb-3">
                                  {paper.title}
                                </h4>

                                {/* AUTHOR */}

                                <p className="text-slate-600">
                                  {paper.author}
                                </p>

                                {/* VIEW */}

                                <div className="mt-4 text-sm text-cyan-700 font-medium">
                                  View Article →
                                </div>
                              </button>
                            )
                          )}
                        </div>
                      </section>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
