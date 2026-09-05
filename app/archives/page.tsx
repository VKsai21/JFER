"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "@/lib/firebase";

type Author = {
  name?: string;
  fullName?: string;
  author?: string;
};

type Paper = {
  id: string;
  paperId?: string;
  manuscriptId?: string;

  title?: string;

  author?: string;
  authors?: string | (string | Author)[];

  publishedAt?: string;
  publishedat?: string;

  year?: string | number;

  issue?: string | number;
  issueNumber?: string | number;
  issueNo?: string | number;

  volume?: string | number;

  abstract?: string;
  keywords?: string | string[];

  pdfUrl?: string;

  status?: string;
  publicationStatus?: string;

  [key: string]: any;
};

type IssueGroup = {
  year: string;
  issue: string;
  papers: Paper[];
};

const PAPERS_PER_LOAD = 10;

export default function ArchivesPage() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedPaper, setSelectedPaper] =
    useState<Paper | null>(null);

  /*
   * ==========================================
   * SELECTED ARCHIVE
   * ==========================================
   *
   * "current" = latest published issue
   *
   * Otherwise:
   * {
   *   year: "2026",
   *   issue: "8"
   * }
   */

  const [selectedArchive, setSelectedArchive] =
    useState<string>("current");

  /*
   * ==========================================
   * NUMBER OF PAPERS CURRENTLY DISPLAYED
   * ==========================================
   */

  const [visibleCount, setVisibleCount] =
    useState(PAPERS_PER_LOAD);

  /*
   * ==========================================
   * FETCH PAPERS
   * ==========================================
   */

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        setLoading(true);

        const snapshot = await getDocs(
          collection(firestore, "submissions")
        );

        const publishedPapers: Paper[] = [];

        snapshot.forEach((submissionDoc) => {
          const data = submissionDoc.data();

          /*
           * ONLY ACCEPTED + PUBLISHED
           */

          const status = String(
            data.status || ""
          )
            .trim()
            .toLowerCase();

          const publicationStatus = String(
            data.publicationStatus || ""
          )
            .trim()
            .toLowerCase();

          if (
            (status === "accepted" ||
              status === "published") &&
            publicationStatus === "published"
          ) {
            publishedPapers.push({
              id: submissionDoc.id,
              ...data,
            });
          }
        });

        setPapers(publishedPapers);
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
   * ==========================================
   * GET YEAR
   * ==========================================
   */

  const getYear = (paper: Paper) => {
    return String(paper.year || "Unknown");
  };

  /*
   * ==========================================
   * GET ISSUE
   * ==========================================
   */

  const getIssue = (paper: Paper) => {
    /*
     * Priority:
     *
     * issue
     * issueNumber
     * issueNo
     * volume
     */

    if (
      paper.issue !== undefined &&
      paper.issue !== null &&
      String(paper.issue).trim() !== ""
    ) {
      return String(paper.issue);
    }

    if (
      paper.issueNumber !== undefined &&
      paper.issueNumber !== null &&
      String(paper.issueNumber).trim() !== ""
    ) {
      return String(paper.issueNumber);
    }

    if (
      paper.issueNo !== undefined &&
      paper.issueNo !== null &&
      String(paper.issueNo).trim() !== ""
    ) {
      return String(paper.issueNo);
    }

    /*
     * Compatibility with existing records
     */

    if (
      paper.volume !== undefined &&
      paper.volume !== null &&
      String(paper.volume).trim() !== ""
    ) {
      return String(paper.volume);
    }

    return "Unknown";
  };

  /*
   * ==========================================
   * GET PAPER ID
   * ==========================================
   */

  const getPaperId = (paper: Paper) => {
    return (
      paper.paperId ||
      paper.manuscriptId ||
      paper.id
    );
  };

  /*
   * ==========================================
   * GET AUTHORS
   * ==========================================
   */

  const getAuthors = (paper: Paper) => {
    /*
     * Accept:
     *
     * authors
     * author
     *
     * and both string / array.
     */

    const value =
      paper.authors ?? paper.author;

    if (!value) {
      return "Unknown Author";
    }

    if (Array.isArray(value)) {
      return value
        .map((author) => {
          if (
            typeof author === "object" &&
            author !== null
          ) {
            return (
              author.name ||
              author.fullName ||
              author.author ||
              ""
            );
          }

          return String(author);
        })
        .filter(Boolean)
        .join(", ");
    }

    return String(value);
  };

  /*
   * ==========================================
   * GET DOI
   * ==========================================
   */

  const getDOI = (paper: Paper) => {
    return String(
      paper.publishedAt ||
        paper.publishedat ||
        ""
    ).trim();
  };

  /*
   * ==========================================
   * DOI URL
   * ==========================================
   */

  const getDOIUrl = (doi: string) => {
    if (!doi) {
      return "";
    }

    if (
      doi.startsWith("http://") ||
      doi.startsWith("https://")
    ) {
      return doi;
    }

    return `https://doi.org/${doi.replace(
      /^doi:\s*/i,
      ""
    )}`;
  };

  /*
   * ==========================================
   * GROUP PAPERS BY YEAR + ISSUE
   * ==========================================
   */

  const issueGroups = useMemo(() => {
    const groups: Record<
      string,
      Record<string, Paper[]>
    > = {};

    papers.forEach((paper) => {
      const year = getYear(paper);
      const issue = getIssue(paper);

      if (!groups[year]) {
        groups[year] = {};
      }

      if (!groups[year][issue]) {
        groups[year][issue] = [];
      }

      groups[year][issue].push(paper);
    });

    return groups;
  }, [papers]);

  /*
   * ==========================================
   * SORT YEARS
   * ==========================================
   */

  const years = useMemo(() => {
    return Object.keys(issueGroups).sort(
      (a, b) => {
        const aNum = Number(a);
        const bNum = Number(b);

        if (
          !Number.isNaN(aNum) &&
          !Number.isNaN(bNum)
        ) {
          return bNum - aNum;
        }

        return b.localeCompare(a);
      }
    );
  }, [issueGroups]);

  /*
   * ==========================================
   * SORT ISSUES
   * ==========================================
   */

  const getSortedIssues = (year: string) => {
    return Object.keys(
      issueGroups[year] || {}
    ).sort((a, b) => {
      const aNum = Number(a);
      const bNum = Number(b);

      if (
        !Number.isNaN(aNum) &&
        !Number.isNaN(bNum)
      ) {
        return bNum - aNum;
      }

      return b.localeCompare(a);
    });
  };

  /*
   * ==========================================
   * CURRENT ISSUE
   * ==========================================
   *
   * Latest YEAR + latest ISSUE
   * ==========================================
   */

  const currentIssue = useMemo(() => {
    if (!years.length) {
      return null;
    }

    const latestYear = years[0];

    const issues =
      getSortedIssues(latestYear);

    if (!issues.length) {
      return null;
    }

    const latestIssue = issues[0];

    return {
      year: latestYear,
      issue: latestIssue,
      papers:
        issueGroups[latestYear][
          latestIssue
        ] || [],
    };
  }, [years, issueGroups]);

  /*
   * ==========================================
   * ALL PAST ISSUES
   * ==========================================
   */

  const pastIssues = useMemo(() => {
    const result: IssueGroup[] = [];

    years.forEach((year) => {
      const issues =
        getSortedIssues(year);

      issues.forEach((issue) => {
        /*
         * Do not include current issue
         */

        if (
          currentIssue &&
          year === currentIssue.year &&
          issue === currentIssue.issue
        ) {
          return;
        }

        result.push({
          year,
          issue,
          papers:
            issueGroups[year][issue] || [],
        });
      });
    });

    return result;
  }, [
    years,
    issueGroups,
    currentIssue,
  ]);

  /*
   * ==========================================
   * CURRENTLY DISPLAYED ISSUE
   * ==========================================
   */

  const activeIssue = useMemo(() => {
    if (selectedArchive === "current") {
      return currentIssue;
    }

    const [year, issue] =
      selectedArchive.split("|||");

    if (
      !year ||
      !issue ||
      !issueGroups[year]
    ) {
      return null;
    }

    return {
      year,
      issue,
      papers:
        issueGroups[year][issue] || [],
    };
  }, [
    selectedArchive,
    currentIssue,
    issueGroups,
  ]);

  /*
   * ==========================================
   * RESET PAGINATION WHEN ISSUE CHANGES
   * ==========================================
   */

  useEffect(() => {
    setVisibleCount(PAPERS_PER_LOAD);
  }, [selectedArchive]);

  /*
   * ==========================================
   * VISIBLE PAPERS
   * ==========================================
   */

  const visiblePapers = useMemo(() => {
    if (!activeIssue) {
      return [];
    }

    return activeIssue.papers.slice(
      0,
      visibleCount
    );
  }, [
    activeIssue,
    visibleCount,
  ]);

  const hasMore =
    activeIssue !== null &&
    visibleCount <
      activeIssue.papers.length;

  /*
   * ==========================================
   * SELECT ISSUE
   * ==========================================
   */

  const selectIssue = (
    year: string,
    issue: string
  ) => {
    setSelectedArchive(
      `${year}|||${issue}`
    );

    /*
     * Scroll back to top of article area
     */

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
   * ==========================================
   * ARTICLE DETAIL
   * ==========================================
   */

  if (selectedPaper) {
    const doi = getDOI(selectedPaper);

    return (
      <main className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-8">
          <button
            onClick={() =>
              setSelectedPaper(null)
            }
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-cyan-700 transition mb-7"
          >
            ← Back to Issue
          </button>

          <article className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
            <div className="p-6 sm:p-10">
              {/* ISSUE */}

              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1.5 rounded-md bg-slate-100 text-slate-700 text-sm font-semibold">
                  Volume{" "}
                  {selectedPaper.volume ||
                    "—"}
                </span>

                {/* <span className="px-3 py-1.5 rounded-md bg-cyan-50 text-cyan-700 text-sm font-semibold">
                  Issue{" "}
                  {getIssue(
                    selectedPaper
                  )}
                </span> */}

                <span className="px-3 py-1.5 rounded-md bg-slate-100 text-slate-700 text-sm font-semibold">
                  {getYear(
                    selectedPaper
                  )}
                </span>
              </div>

              {/* TITLE */}

              <h1 className="text-3xl sm:text-4xl font-bold text-slate-950 leading-tight">
                {selectedPaper.title ||
                  "Untitled Article"}
              </h1>

              {/* AUTHORS */}

              <div className="mt-6">
                <p className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">
                  Author(s)
                </p>

                <p className="text-lg text-slate-700 leading-7">
                  {getAuthors(
                    selectedPaper
                  )}
                </p>
              </div>

              {/* DOI */}

              {doi && (
                <div className="mt-6">
                  <p className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">
                    DOI
                  </p>

                  <a
                    href={getDOIUrl(doi)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-700 hover:text-cyan-900 break-all"
                  >
                    {doi}
                  </a>
                </div>
              )}

              {/* ABSTRACT */}

              {selectedPaper.abstract && (
                <section className="mt-10 pt-8 border-t border-slate-200">
                  <h2 className="text-xl font-bold text-slate-900 mb-3">
                    Abstract
                  </h2>

                  <p className="text-slate-700 leading-8 text-justify">
                    {
                      selectedPaper.abstract
                    }
                  </p>
                </section>
              )}

              {/* KEYWORDS */}

              {selectedPaper.keywords && (
                <section className="mt-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-3">
                    Keywords
                  </h2>

                  <p className="text-slate-700">
                    {Array.isArray(
                      selectedPaper.keywords
                    )
                      ? selectedPaper.keywords.join(
                          ", "
                        )
                      : selectedPaper.keywords}
                  </p>
                </section>
              )}

              {/* PDF */}

              {selectedPaper.pdfUrl && (
                <section className="mt-10">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">
                    Article
                  </h2>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <iframe
                      src={`https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
                        selectedPaper.pdfUrl
                      )}`}
                      width="100%"
                      height="850"
                      className="w-full"
                      title="Article PDF"
                    />
                  </div>

                  <div className="mt-5">
                    <a
                      href={
                        selectedPaper.pdfUrl
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex px-6 py-3 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition"
                    >
                      Open Article
                    </a>
                  </div>
                </section>
              )}
            </div>
          </article>
        </div>
      </main>
    );
  }

  /*
   * ==========================================
   * LOADING
   * ==========================================
   */

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6">
            {/* SIDEBAR */}

            <aside className="bg-white border border-slate-200 rounded-xl overflow-hidden h-fit">
              <div className="h-16 bg-slate-200 animate-pulse" />

              <div className="p-4 space-y-3">
                {[1, 2, 3, 4, 5].map(
                  (item) => (
                    <div
                      key={item}
                      className="h-12 bg-slate-100 rounded-lg animate-pulse"
                    />
                  )
                )}
              </div>
            </aside>

            {/* CONTENT */}

            <section>
              <div className="h-12 w-96 max-w-full bg-slate-200 rounded animate-pulse mb-6" />

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="h-16 bg-slate-200 animate-pulse" />

                {Array.from({
                  length: 10,
                }).map((_, index) => (
                  <div
                    key={index}
                    className="p-6 border-b border-slate-200"
                  >
                    <div className="h-5 w-20 bg-slate-200 rounded animate-pulse mb-4" />

                    <div className="h-5 w-3/4 bg-slate-200 rounded animate-pulse mb-3" />

                    <div className="h-4 w-1/2 bg-slate-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ==========================================
   * MAIN PAGE
   * ==========================================
   */

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6 lg:gap-8">
          {/* ==================================================
              LEFT SIDEBAR
             ================================================== */}

          <aside className="bg-white border border-slate-200 rounded-xl overflow-hidden h-fit lg:sticky lg:top-6">
            {/* SIDEBAR HEADER */}

            <div className="bg-slate-100 px-5 py-5 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-700 text-white flex items-center justify-center font-bold">
                  i
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-800"></h2>
                </div>
              </div>
            </div>

            {/* CURRENT ISSUE */}

            <button
              onClick={() =>
                setSelectedArchive(
                  "current"
                )
              }
              className={`w-full text-left px-5 py-4 border-b border-slate-100 flex items-center gap-3 transition ${
                selectedArchive ===
                "current"
                  ? "bg-cyan-50 text-cyan-800"
                  : "hover:bg-slate-50 text-slate-700"
              }`}
            >
              <span
                className={`text-xl ${
                  selectedArchive ===
                  "current"
                    ? "text-cyan-700"
                    : "text-slate-400"
                }`}
              >
                ›
              </span>

              <div>
                <p className="font-semibold">
                  Current Issue
                </p>

                {currentIssue && (
                  <p className="text-xs text-slate-500 mt-1">
                    {currentIssue.year} ·{" "}
                    Issue{" "}
                    {currentIssue.issue}
                  </p>
                )}
              </div>
            </button>

            {/* PAST ISSUES HEADER */}

            <div className="px-5 pt-5 pb-3">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Past Issues
              </p>
            </div>

            {/* PAST ISSUE LIST */}

            <div className="pb-4">
              {years.map((year) => {
                const yearIssues =
                  pastIssues.filter(
                    (item) =>
                      item.year === year
                  );

                if (
                  yearIssues.length === 0
                ) {
                  return null;
                }

                return (
                  <div
                    key={year}
                    className="px-3 mb-3"
                  >
                    {/* YEAR */}

                    <div className="px-2 py-2 text-sm font-bold text-slate-800">
                      {year}
                    </div>

                    {/* ISSUES */}

                    <div className="space-y-1">
                      {yearIssues.map(
                        (item) => {
                          const key = `${item.year}|||${item.issue}`;

                          const active =
                            selectedArchive ===
                            key;

                          return (
                            <button
                              key={key}
                              onClick={() =>
                                selectIssue(
                                  item.year,
                                  item.issue
                                )
                              }
                              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between gap-2 text-sm transition ${
                                active
                                  ? "bg-cyan-50 text-cyan-800 font-semibold"
                                  : "text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              <span>
                                Issue{" "}
                                {item.issue}
                              </span>

                              <span className="text-xs text-slate-400">
                                {
                                  item.papers
                                    .length
                                }
                              </span>
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                );
              })}

              {pastIssues.length ===
                0 && (
                <p className="px-5 py-4 text-sm text-slate-500">
                  No past issues available.
                </p>
              )}
            </div>
          </aside>

          {/* ==================================================
              RIGHT CONTENT
             ================================================== */}

          <section className="min-w-0">
            {/* ISSUE HEADER */}

            {activeIssue ? (
              <>
                <div className="mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] font-bold text-cyan-700 mb-2">
                        {selectedArchive ===
                        "current"
                          ? "Current Issue"
                          : "Past Issue"}
                      </p>

                      <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
                        Volume{" "}
                        {activeIssue.papers[0]
                          ?.volume ||
                          "—"}{" "}
                        ({activeIssue.year})
                      </h2>
                    </div>

                    <div className="text-sm text-slate-500">
                      {
                        activeIssue
                          .papers.length
                      }{" "}
                      published{" "}
                      {activeIssue.papers
                        .length === 1
                        ? "article"
                        : "articles"}
                    </div>
                  </div>

                  <div className="mt-3 h-1 w-20 bg-cyan-700 rounded-full" />
                </div>

                {/* ==================================================
                    ARTICLE TABLE
                   ================================================== */}

                {activeIssue.papers
                  .length > 0 ? (
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    {/* TABLE HEADER */}

                    <div className="hidden md:grid md:grid-cols-[200px_minmax(0,1fr)_220px] bg-slate-100 border-b border-slate-300 text-slate-700">
                      <div className="px-4 py-4 font-semibold text-sm">
                        Paper ID
                      </div>

                      <div className="px-5 py-4 font-semibold text-sm">
                        Article Title &amp;
                        Author(s)
                      </div>

                      <div className="px-5 py-4 font-semibold text-sm">
                        DOI
                      </div>
                    </div>

                    {/* PAPERS */}

                    {visiblePapers.map(
                      (
                        paper,
                        index
                      ) => {
                        const doi =
                          getDOI(paper);

                        return (
                          <button
                            key={paper.id}
                            onClick={() =>
                              setSelectedPaper(
                                paper
                              )
                            }
                            className={`w-full text-left hover:bg-slate-50 transition ${
                              index !==
                              visiblePapers.length -
                                1
                                ? "border-b border-slate-200"
                                : ""
                            }`}
                          >
                            {/* DESKTOP */}

                            <div className="hidden md:grid md:grid-cols-[200px_minmax(0,1fr)_220px]">
                              {/* PAPER ID */}

                              <div className="px-4 py-6 text-slate-700 text-xs">
                                {getPaperId(
                                  paper
                                )}
                              </div>

                              {/* TITLE + AUTHOR */}

                              <div className="px-5 py-6">
                                <h2 className="text-lg font-semibold leading-1 text-cyan-700 group-hover:text-cyan-900">
                                  {paper.title ||
                                    "Untitled Article"}
                                </h2>

                                <p className="mt-2 text-slate-600 leading-6">
                                  {getAuthors(
                                    paper
                                  )}
                                </p>
                              </div>

                              {/* DOI */}

                              <div className="px-5 py-6">
                                {doi ? (
                                  <a
                                    href={getDOIUrl(
                                      doi
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(
                                      event
                                    ) =>
                                      event.stopPropagation()
                                    }
                                    className="text-xs text-cyan-700 hover:underline break-all"
                                  >
                                    {doi}
                                  </a>
                                ) : (
                                  <span className="text-sm text-slate-400">
                                    —
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* MOBILE */}

                            <div className="md:hidden p-5">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                  Paper ID
                                </span>

                                <span className="text-sm font-semibold text-slate-700">
                                  {getPaperId(
                                    paper
                                  )}
                                </span>
                              </div>

                              <h2 className="text-lg font-semibold leading-7 text-cyan-700">
                                {paper.title ||
                                  "Untitled Article"}
                              </h2>

                              <p className="mt-2 text-sm text-slate-600 leading-6">
                                {getAuthors(
                                  paper
                                )}
                              </p>

                              <div className="mt-4">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                  DOI
                                </span>

                                {doi ? (
                                  <a
                                    href={getDOIUrl(
                                      doi
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(
                                      event
                                    ) =>
                                      event.stopPropagation()
                                    }
                                    className="block mt-1 text-sm text-cyan-700 break-all"
                                  >
                                    {doi}
                                  </a>
                                ) : (
                                  <span className="block mt-1 text-sm text-slate-400">
                                    —
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      }
                    )}
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
                    <h2 className="text-xl font-bold text-slate-800">
                      No articles in this
                      issue
                    </h2>

                    <p className="mt-2 text-slate-500">
                      No accepted and published
                      articles are currently
                      available for this issue.
                    </p>
                  </div>
                )}

                {/* ==================================================
                    LOAD MORE
                   ================================================== */}

                {hasMore && (
                  <div className="flex justify-center mt-6">
                    <button
                      onClick={() =>
                        setVisibleCount(
                          (count) =>
                            count +
                            PAPERS_PER_LOAD
                        )
                      }
                      className="px-7 py-3 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 hover:border-cyan-600 hover:text-cyan-700 transition"
                    >
                      Load More Articles
                    </button>
                  </div>
                )}

                {/* COUNT */}

                {activeIssue.papers
                  .length > 0 && (
                  <div className="text-center mt-4 text-xs text-slate-400">
                    Showing{" "}
                    {Math.min(
                      visibleCount,
                      activeIssue
                        .papers.length
                    )}{" "}
                    of{" "}
                    {
                      activeIssue
                        .papers.length
                    }{" "}
                    articles
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
                <h1 className="text-2xl font-bold text-slate-900">
                  No published issues
                  available
                </h1>

                <p className="mt-2 text-slate-500">
                  Accepted articles will appear
                  here after they are marked as
                  published.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
