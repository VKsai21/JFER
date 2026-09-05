"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  onAuthStateChanged,
  signOut,
  User,
} from "firebase/auth";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  limit,
  Timestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";

import {
  LayoutDashboard,
  FileText,
  Users,
  BookOpen,
  LogOut,
  Menu,
  X,
  ChevronRight,
  AlertCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CalendarDays,
  Send,
  XCircle,
} from "lucide-react";

import { auth, firestore } from "@/lib/firebase";

/*
 * ============================================================
 * TYPES
 * ============================================================
 */

type AdminProfile = {
  uid?: string;
  email?: string;
  name?: string;
  role?: string;
  status?: string;
};

type Submission = {
  id: string;

  title?: string;
  paperTitle?: string;

  abstract?: string;

  authors?: unknown;

  keywords?: string[];

  status?: string;

  pdfUrl?: string;
  manuscriptUrl?: string;
  fileUrl?: string;

  year?: string | number;
  volume?: string | number;
  paperNumber?: string;

  publicationStatus?: string;

  publishedAt?: Timestamp | Date | string;

  submittedAt?: Timestamp | Date | string;
  createdAt?: Timestamp | Date | string;
  updatedAt?: Timestamp | Date | string;

  [key: string]: unknown;
};

type MenuItem = {
  label: string;
  icon: React.ElementType;
  section?: string;
};

/*
 * ============================================================
 * SIDEBAR MENU
 * ============================================================
 */

const menuItems: MenuItem[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
  },

  {
    label: "All Submissions",
    icon: FileText,
    section: "Papers",
  },
  // {
  //   label: "Pending Review",
  //   icon: Clock3,
  // },
  // {
  //   label: "Revision Required",
  //   icon: AlertCircle,
  // },
  // {
  //   label: "Accepted",
  //   icon: CheckCircle2,
  // },

  {
    label: "Reviewers",
    icon: Users,
    section: "Reviewers",
  },
  // {
  //   label: "Assignments",
  //   icon: ClipboardCheck,
  // },
  // {
  //   label: "Applications",
  //   icon: UserPlus,
  // },

  {
    label: "Editorial Board",
    icon: Users,
    section: "Editorial",
  },

  {
    label: "Publish Papers",
    icon: BookOpen,
    section: "Journal",
  },
  // {
  //   label: "Volumes",
  //   icon: BookOpen,
  // },

  // {
  //   label: "Settings",
  //   icon: Settings,
  //   section: "System",
  // },
];

/*
 * ============================================================
 * CONSTANTS
 * ============================================================
 */

const PAPERS_PER_PAGE = 10;

/*
 * ============================================================
 * PAGE
 * ============================================================
 */

export default function PublishedPapersPage() {
  const router = useRouter();

  const [user, setUser] =
    useState<User | null>(null);

  const [profile, setProfile] =
    useState<AdminProfile | null>(null);

  const [authLoading, setAuthLoading] =
    useState(true);

  const [submissions, setSubmissions] =
    useState<Submission[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [activeMenu, setActiveMenu] =
    useState("Published Papers");

  /*
   * Selected paper
   */

  const [selectedPapers, setSelectedPapers] =
    useState<Submission[]>([]);

  /*
   * Publication form
   */

  const [publishYear, setPublishYear] =
    useState("");

  const [publishVolume, setPublishVolume] =
    useState("");

  const [publishing, setPublishing] =
    useState(false);

  const [publishError, setPublishError] =
    useState("");

  const [publishSuccess, setPublishSuccess] =
    useState(false);

  /*
   * Pagination
   */

  const [page, setPage] =
    useState(0);

  /*
   * ==========================================================
   * AUTHENTICATION
   * ==========================================================
   */

  useEffect(() => {
    let mounted = true;

    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (currentUser) => {
          if (!currentUser) {
            router.replace("/login");
            return;
          }

          if (!mounted) return;

          setUser(currentUser);

          try {
            /*
             * First check admin/{uid}
             */

            const adminRef = doc(
              firestore,
              "admin",
              currentUser.uid
            );

            const adminSnapshot =
              await getDoc(adminRef);

            let adminData:
              | AdminProfile
              | null = null;

            if (adminSnapshot.exists()) {
              adminData =
                adminSnapshot.data() as AdminProfile;
            }

            /*
             * Fallback to email lookup
             */

            if (
              !adminData &&
              currentUser.email
            ) {
              const adminQuery =
                query(
                  collection(
                    firestore,
                    "admin"
                  ),
                  where(
                    "email",
                    "==",
                    currentUser.email.toLowerCase()
                  ),
                  limit(1)
                );

              const adminQuerySnapshot =
                await getDocs(
                  adminQuery
                );

              if (
                !adminQuerySnapshot.empty
              ) {
                adminData =
                  adminQuerySnapshot
                    .docs[0]
                    .data() as AdminProfile;
              }
            }

            if (!adminData) {
              setError(
                "Your Firebase account is authenticated, but no administrator record was found."
              );

              setAuthLoading(false);
              setLoading(false);

              return;
            }

            if (
              adminData.status &&
              adminData.status !==
                "active"
            ) {
              setError(
                "Your administrator account is currently inactive."
              );

              setAuthLoading(false);
              setLoading(false);

              return;
            }

            if (!mounted) return;

            setProfile(adminData);
            setAuthLoading(false);
          } catch (err) {
            console.error(
              "PUBLISHED PAPERS: Authorization error:",
              err
            );

            if (!mounted) return;

            setError(
              "Unable to verify administrator access."
            );

            setAuthLoading(false);
            setLoading(false);
          }
        }
      );

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [router]);

  /*
   * ==========================================================
   * LOAD accepted PAPERS
   * ==========================================================
   */

  const loadacceptedPapers =
    async () => {
      try {
        setError("");

        const snapshot =
          await getDocs(
            collection(
              firestore,
              "submissions"
            )
          );

        const data: Submission[] =
          snapshot.docs.map(
            (document) => ({
              id: document.id,
              ...document.data(),
            })
          ) as Submission[];

        /*
         * Only accepted papers.
         *
         * Papers that already have
         * publicationStatus = published
         * are excluded.
         */

        const accepted =
          data.filter((paper) => {
            const status =
              String(
                paper.status || ""
              )
                .trim()
                .toLowerCase();

            const publicationStatus =
              String(
                paper.publicationStatus ||
                  ""
              )
                .trim()
                .toLowerCase();

            return (
              status === "accepted" &&
              publicationStatus !==
                "published"
            );
          });

        /*
         * Newest accepted papers first
         */

        accepted.sort((a, b) => {
          return (
            getDateValue(
              b.submittedAt ||
                b.createdAt
            ) -
            getDateValue(
              a.submittedAt ||
                a.createdAt
            )
          );
        });

        setSubmissions(accepted);
        setPage(0);
        setSelectedPapers([]);
      } catch (err) {
        console.error(
          "PUBLISH PAPERS: Load error:",
          err
        );

        setError(
          "Unable to load accepted papers. Please check your Firestore permissions."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

  useEffect(() => {
    if (
      !authLoading &&
      !error
    ) {
      loadacceptedPapers();
    }
  }, [
    authLoading,
    error,
  ]);

  /*
   * ==========================================================
   * SEARCH
   * ==========================================================
   */

  const filteredPapers =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      if (!normalizedSearch) {
        return submissions;
      }

      return submissions.filter(
        (paper) => {
          const title =
            getSubmissionTitle(
              paper
            ).toLowerCase();

          const id =
            paper.id.toLowerCase();

          return (
            title.includes(
              normalizedSearch
            ) ||
            id.includes(
              normalizedSearch
            )
          );
        }
      );
    }, [
      submissions,
      search,
    ]);

  /*
   * ==========================================================
   * PAGINATION
   * ==========================================================
   */

  const totalPages =
    Math.ceil(
      filteredPapers.length /
        PAPERS_PER_PAGE
    );

  const paginatedPapers =
    useMemo(() => {
      const start =
        page *
        PAPERS_PER_PAGE;

      return filteredPapers.slice(
        start,
        start +
          PAPERS_PER_PAGE
      );
    }, [
      filteredPapers,
      page,
    ]);

  /*
   * Keep page valid after search
   */

  useEffect(() => {
    if (
      totalPages === 0
    ) {
      setPage(0);
      return;
    }

    if (
      page >= totalPages
    ) {
      setPage(
        totalPages - 1
      );
    }
  }, [
    totalPages,
    page,
  ]);

  /*
   * ==========================================================
   * SELECT PAPER
   * ==========================================================
   */

  const handleSelectPaper = (
    paper: Submission
  ) => {
    setSelectedPapers((current) => {
      const exists = current.some(
        (selected) => selected.id === paper.id
      );

      if (exists) {
        return current.filter(
          (selected) => selected.id !== paper.id
        );
      }

      return [...current, paper];
    });

    setPublishError("");
    setPublishSuccess(false);
  };

  const handleSelectAllCurrentPage = () => {
    const currentIds = new Set(
      paginatedPapers.map((paper) => paper.id)
    );

    const allSelected = paginatedPapers.every((paper) =>
      selectedPapers.some(
        (selected) => selected.id === paper.id
      )
    );

    if (allSelected) {
      setSelectedPapers((current) =>
        current.filter(
          (paper) => !currentIds.has(paper.id)
        )
      );
    } else {
      setSelectedPapers((current) => {
        const merged = [...current];

        for (const paper of paginatedPapers) {
          if (
            !merged.some(
              (selected) => selected.id === paper.id
            )
          ) {
            merged.push(paper);
          }
        }

        return merged;
      });
    }

    setPublishError("");
    setPublishSuccess(false);
  };

  const isPaperSelected = (paperId: string) =>
    selectedPapers.some(
      (paper) => paper.id === paperId
    );

  const allCurrentPageSelected =
    paginatedPapers.length > 0 &&
    paginatedPapers.every((paper) =>
      isPaperSelected(paper.id)
    );


  /*
   * ==========================================================
   * PUBLISH PAPER
   * ==========================================================
   */

  const handlePublish =async () => {
      if (selectedPapers.length === 0) {
        setPublishError(
          "Please select at least one paper first."
        );
        return;
      }

      const year =
        publishYear.trim();

      const volume =
        publishVolume.trim();

      if (!year) {
        setPublishError(
          "Please enter the publication year."
        );
        return;
      }

      if (!/^\d{4}$/.test(year)) {
        setPublishError(
          "Year must be a valid 4-digit year."
        );
        return;
      }

      if (!volume) {
        setPublishError(
          "Please enter the volume."
        );
        return;
      }

      if (!/^[A-Za-z0-9._-]+$/.test(volume)) {
        setPublishError(
          "Volume can contain only letters, numbers, dots, hyphens and underscores."
        );
        return;
      }

      setPublishing(true);
      setPublishError("");
      setPublishSuccess(false);

      try {
        /*
         * Use one Firestore batch so all selected papers are
         * published using the existing Firestore structure.
         *
         * No new collections or fields are introduced.
         */

        const batch = writeBatch(firestore);

        /*
         * 1. Create/update the selected publication year.
         */

        batch.set(
          doc(
            firestore,
            "published",
            year
          ),
          {
            year,
          },
          {
            merge: true,
          }
        );

        /*
         * 2. Create/update the selected volume.
         */

        batch.set(
          doc(
            firestore,
            "published",
            year,
            "volumes",
            volume
          ),
          {
            volumeId: volume,
            year,
            updatedAt: Date.now(),
          },
          {
            merge: true,
          }
        );

        /*
         * 3. Add every selected paper to the same
         *    year/volume and update its original submission.
         */

        const publishedAt = Date.now();
        const paperNumbers: {
          submissionId: string;
          paperNumber: string;
        }[] = [];

        selectedPapers.forEach((paper, index) => {
          const paperNumber =
            `P-${year}-${publishedAt}-${index + 1}`;

          paperNumbers.push({
            submissionId: paper.id,
            paperNumber,
          });

          batch.set(
            doc(
              firestore,
              "published",
              year,
              "volumes",
              volume,
              "papers",
              paperNumber
            ),
            {
              ...paper,

              /*
               * Keep the original submission ID.
               */

              submissionId:
                paper.id,

              /*
               * Publication metadata.
               */

              status:
                "published",

              publicationStatus:
                "published",

              year,

              volume,

              paperNumber,

              publishedAt,
            }
          );

          /*
           * Original submission keeps status = accepted.
           * Only publicationStatus is changed.
           */

          batch.update(
            doc(
              firestore,
              "submissions",
              paper.id
            ),
            {
              publicationStatus:
                "published",

              year,

              volume,

              paperNumber,

              publishedAt,
            }
          );
        });

        /*
         * 4. Commit everything together.
         */

        await batch.commit();

        const selectedIds = new Set(
          selectedPapers.map(
            (paper) => paper.id
          )
        );

        /*
         * 5. Remove all successfully published papers
         *    from the current local accepted-paper list.
         */

        setSubmissions((previous) =>
          previous.filter(
            (paper) =>
              !selectedIds.has(paper.id)
          )
        );

        setSelectedPapers([]);
        setPublishYear("");
        setPublishVolume("");
        setPublishing(false);
        setPublishSuccess(true);

        setTimeout(() => {
          setPublishSuccess(false);
        }, 3000);
      } catch (err) {
        console.error(
          "PUBLISHED PAPERS: Bulk publish error:",
          err
        );

        setPublishing(false);

        setPublishError(
          "Failed to publish the selected papers. No new publication was completed. Please try again."
        );
      }
    };


  /*
   * ==========================================================
   * REFRESH
   * ==========================================================
   */

  const handleRefresh =
    () => {
      setRefreshing(true);
      loadacceptedPapers();
    };

  /*
   * ==========================================================
   * LOGOUT
   * ==========================================================
   */

  const handleLogout =
    async () => {
      try {
        await fetch(
          "/api/auth/logout",
          {
            method: "POST",
          }
        );

        await signOut(auth);

        router.replace(
          "/login"
        );
      } catch (err) {
        console.error(
          "ADMIN: Logout error:",
          err
        );

        router.replace(
          "/login"
        );
      }
    };

  /*
   * ==========================================================
   * NAVIGATION
   * ==========================================================
   */

  const handleNavigation =
    (label: string) => {
      setActiveMenu(label);
      setSidebarOpen(false);

      switch (label) {
        case "Dashboard":
          router.push(
            "/admin"
          );
          break;

        case "All Submissions":
          router.push(
            "/admin/submissions"
          );
          break;

        case "Pending Review":
          router.push(
            "/admin/submissions?status=pending"
          );
          break;

        case "Revision Required":
          router.push(
            "/admin/submissions?status=revision_required"
          );
          break;

        case "Accepted":
          router.push(
            "/admin/submissions?status=accepted"
          );
          break;

        case "Reviewers":
          router.push(
            "/admin/reviewers"
          );
          break;

        case "Assignments":
          router.push(
            "/admin/assignments"
          );
          break;

        case "Applications":
          router.push(
            "/admin/applications/reviewers"
          );
          break;

        case "Editorial Board":
          router.push(
            "/admin/editorial-board"
          );
          break;

        case "Published Papers":
          router.push(
            "/admin/journal"
          );
          break;

        case "Volumes":
          router.push(
            "/admin/journal/volumes"
          );
          break;

        case "Settings":
          router.push(
            "/admin/settings"
          );
          break;

        default:
          break;
      }
    };

  /*
   * ==========================================================
   * LOADING
   * ==========================================================
   */

  if (
    authLoading ||
    loading
  ) {
    return (
      <main className="min-h-[100dvh] bg-[#f7f7f7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-[#244e70] text-white flex items-center justify-center mx-auto animate-pulse">
            <BookOpen size={21} />
          </div>

          <p className="!text-[#666666] text-sm mt-4">
            Loading accepted papers...
          </p>
        </div>
      </main>
    );
  }

  /*
   * ==========================================================
   * AUTH ERROR
   * ==========================================================
   */

  if (
    error &&
    !submissions.length
  ) {
    return (
      <main className="min-h-[100dvh] bg-[#f7f7f7] flex items-center justify-center px-6">
        <div className="w-full max-w-lg bg-white border border-[#e5e5e5] rounded-2xl p-7 shadow-xl">

          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mb-5">
            <AlertCircle size={24} />
          </div>

          <p className="text-[10px] uppercase tracking-[0.2em] font-semibold !text-[#244e70]">
            Administrator Access
          </p>

          <h1 className="!text-[#111111] text-2xl font-semibold mt-2">
            Unable to load papers
          </h1>

          <p className="!text-[#666666] text-sm mt-3 leading-6">
            {error}
          </p>

          {user && (
            <div className="mt-5 p-4 rounded-xl bg-[#f7f7f7] border border-[#e7e7e7]">
              <p className="!text-[#888888] text-[11px]">
                Authenticated account
              </p>

              <p className="!text-[#111111] text-sm font-semibold mt-1 break-all">
                {user.email}
              </p>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={() =>
                window.location.reload()
              }
              className="flex-1 h-11 rounded-xl bg-[#244e70] text-white text-sm font-semibold hover:bg-[#1b3a54] transition"
            >
              Try again
            </button>

            <button
              onClick={() =>
                router.replace(
                  "/login"
                )
              }
              className="flex-1 h-11 rounded-xl border border-[#d8d8d8] text-[#5e5145] text-sm font-semibold hover:bg-[#f7f7f7] transition"
            >
              Back to login
            </button>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ==========================================================
   * MAIN PAGE
   * ==========================================================
   */

  return (
    <main className="min-h-[100dvh] bg-[#f7f7f7]">

      {/* ======================================================
          MOBILE HEADER
      ====================================================== */}

      <header className="lg:hidden h-16 bg-white border-b border-[#e5e5e5] flex items-center justify-between px-4 sticky top-0 z-40">

        <div className="flex items-center gap-3">

          <div className="w-9 h-9 rounded-lg bg-[#244e70] text-white flex items-center justify-center">
            <span className="font-bold">
              J
            </span>
          </div>

          <span className="font-semibold text-sm !text-[#332c26]">
            JFER Admin
          </span>

        </div>

        <button
          onClick={() =>
            setSidebarOpen(true)
          }
          className="w-9 h-9 rounded-lg hover:bg-[#f7f7f7] flex items-center justify-center !text-[#111111]"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

      </header>

      {/* ======================================================
          MOBILE OVERLAY
      ====================================================== */}

      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-40"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <aside
        className={`
          fixed
          left-0
          top-0
          bottom-0
          z-50
          bg-[#2f2923]
          text-white
          border-r
          border-white/5
          transition-all
          duration-300

          ${
            sidebarCollapsed
              ? "lg:w-[68px]"
              : "lg:w-[203px]"
          }

          ${
            sidebarOpen
              ? "translate-x-0 w-[260px]"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >

        {/* Sidebar header */}

        <div className="h-[77px] px-4 border-b border-white/10 flex items-center justify-between">

          <div className="flex items-center gap-3 min-w-0">

            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-xl font-bold">
                J
              </span>
            </div>

            {!sidebarCollapsed && (
              <div className="min-w-0">
                <p className="!text-white text-sm font-bold">
                  JFER
                </p>

                <p className="!text-white/50 text-[9px]">
                  Admin Dashboard
                </p>
              </div>
            )}

          </div>

          <button
            onClick={() =>
              setSidebarOpen(false)
            }
            className="lg:hidden !text-white/60 hover:!text-white"
            aria-label="Close menu"
          >
            <X size={19} />
          </button>

        </div>

        {/* Navigation */}

        <nav className="px-2.5 py-4 overflow-y-auto h-[calc(100%-125px)]">

          {menuItems.map(
            (item) => {
              const Icon =
                item.icon;

              return (
                <div
                  key={item.label}
                >

                  {item.section &&
                    !sidebarCollapsed && (
                      <p className="!text-white/30 text-[8px] uppercase tracking-[0.18em] font-semibold px-2.5 mt-4 mb-1.5">
                        {item.section}
                      </p>
                    )}

                  {item.section &&
                    sidebarCollapsed && (
                      <div className="h-px bg-white/10 my-3" />
                    )}

                  <button
                    onClick={() =>
                      handleNavigation(
                        item.label
                      )
                    }
                    title={
                      sidebarCollapsed
                        ? item.label
                        : undefined
                    }
                    className={`
                      w-full
                      flex
                      items-center
                      ${
                        sidebarCollapsed
                          ? "justify-center"
                          : "justify-between"
                      }
                      gap-2
                      px-2.5
                      py-2
                      rounded-lg
                      mb-0.5
                      text-[12px]
                      transition-all

                      ${
                        activeMenu ===
                        item.label
                          ? "bg-[#244e70] text-white shadow-md shadow-black/10"
                          : "text-white/65 hover:text-white hover:bg-white/5"
                      }
                    `}
                  >

                    <div className="flex items-center gap-2.5 min-w-0">

                      <Icon
                        size={15}
                        strokeWidth={1.8}
                        className="shrink-0"
                      />

                      {!sidebarCollapsed && (
                        <span className="truncate">
                          {item.label}
                        </span>
                      )}

                    </div>

                    {!sidebarCollapsed &&
                      activeMenu ===
                        item.label && (
                        <ChevronRight
                          size={13}
                        />
                      )}

                  </button>

                </div>
              );
            }
          )}

        </nav>

        {/* Sidebar footer */}

        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 p-2.5">

          <button
            onClick={
              handleLogout
            }
            className={`
              w-full
              flex
              items-center
              ${
                sidebarCollapsed
                  ? "justify-center"
                  : "gap-2.5"
              }
              px-2.5
              py-2
              rounded-lg
              text-[12px]
              text-white/60
              hover:bg-red-500/10
              hover:text-red-300
              transition
            `}
          >

            <LogOut
              size={15}
              strokeWidth={1.8}
            />

            {!sidebarCollapsed && (
              <span>
                Logout
              </span>
            )}

          </button>

        </div>

      </aside>

      {/* ======================================================
          MAIN AREA
      ====================================================== */}

      <div
        className={`
          transition-all
          duration-300

          ${
            sidebarCollapsed
              ? "lg:ml-[68px]"
              : "lg:ml-[203px]"
          }
        `}
      >

        {/* ====================================================
            DESKTOP HEADER
        ==================================================== */}

        <header className="hidden lg:flex h-[77px] bg-white border-b border-[#e5e5e5] items-center justify-between px-7 sticky top-0 z-30">

          <div className="flex items-center gap-3">

            <button
              onClick={() =>
                setSidebarCollapsed(
                  (prev) => !prev
                )
              }
              className="w-8 h-8 rounded-lg hover:bg-[#f7f7f7] flex items-center justify-center !text-[#666666]"
              aria-label="Toggle sidebar"
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen
                  size={17}
                />
              ) : (
                <PanelLeftClose
                  size={17}
                />
              )}
            </button>

            <div>

              <h2 className="!text-[#111111] text-[28px] leading-8 font-medium">
                Publish Papers
              </h2>

              <p className="!text-[#888888] text-[11px] mt-0.5">
                Journal Management
              </p>

            </div>

          </div>

          <div className="flex items-center gap-3">

            <div className="text-right">

              <p className="!text-[#111111] text-xs font-semibold">
                {profile?.name ||
                  "Administrator"}
              </p>

              <p className="!text-[#888888] text-[10px]">
                {user?.email}
              </p>

            </div>

            <div className="w-9 h-9 rounded-full bg-[#dce8ef] text-[#244e70] flex items-center justify-center text-sm font-bold">

              {(
                profile?.name ||
                "A"
              )
                .charAt(0)
                .toUpperCase()}

            </div>

          </div>

        </header>

        {/* ====================================================
            CONTENT
        ==================================================== */}

        <div className="px-7 py-6 max-w-[1200px] mx-auto">

          {/* Mobile title */}

          <div className="lg:hidden mb-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="!text-[#888888] text-xs">
                  Journal Management
                </p>

                <h2 className="!text-[#111111] text-2xl font-semibold mt-1">
                  Publish Papers
                </h2>

              </div>

              <button
                onClick={
                  handleRefresh
                }
                disabled={
                  refreshing
                }
                className="w-10 h-10 rounded-xl border border-[#ded5ca] bg-white flex items-center justify-center !text-[#66594d] hover:bg-[#faf7f3] transition disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />
              </button>

            </div>

          </div>

          {/* ==================================================
              PAGE INTRO
          ================================================== */}

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">

            <div>

              <div className="flex items-center gap-2">

                <button
                  onClick={() =>
                    router.push(
                      "/admin"
                    )
                  }
                  className="hidden sm:flex w-8 h-8 rounded-lg border border-[#e1d9cf] bg-white items-center justify-center !text-[#766e65] hover:bg-[#faf7f3] transition"
                  title="Back to dashboard"
                >
                  <ArrowLeft
                    size={15}
                  />
                </button>

                <h2 className="!text-[#111111] text-[24px] leading-7 font-medium">
                  Publish accepted Papers
                </h2>

              </div>

              <p className="!text-[#666666] text-sm mt-1.5">
                Select an accepted paper and assign its journal year and volume.
              </p>

            </div>

            <button
              onClick={
                handleRefresh
              }
              disabled={
                refreshing
              }
              className="hidden sm:flex h-9 px-3 rounded-lg border border-[#ded5ca] bg-white items-center justify-center gap-2 !text-[#66594d] text-xs hover:bg-[#faf7f3] transition disabled:opacity-50"
            >

              <RefreshCw
                size={14}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh

            </button>

          </div>

          {/* ==================================================
              SUCCESS
          ================================================== */}

          {publishSuccess && (
            <div className="mb-5 p-4 rounded-xl border border-green-200 bg-green-50 flex items-center gap-3">

              <CheckCircle2
                size={18}
                className="text-green-600 shrink-0"
              />

              <div>

                <p className="!text-green-800 font-semibold text-xs">
                  Paper published successfully
                </p>

                <p className="!text-green-700 text-xs mt-1">
                  The paper has been added to the selected journal volume.
                </p>

              </div>

            </div>
          )}

          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (
            <div className="mb-5 p-4 rounded-xl border border-red-200 bg-red-50 flex gap-3">

              <AlertCircle
                size={18}
                className="text-red-500 shrink-0 mt-0.5"
              />

              <div>

                <p className="!text-red-700 font-semibold text-xs">
                  Unable to load papers
                </p>

                <p className="!text-red-600 text-xs mt-1">
                  {error}
                </p>

              </div>

            </div>
          )}

          {/* ==================================================
              SUMMARY
          ================================================== */}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">

            <div className="bg-white border border-[#e5e5e5] rounded-xl p-4">

              <p className="!text-[#91877d] text-[10px]">
                accepted Papers
              </p>

              <p className="!text-[#111111] text-2xl font-medium mt-1">
                {filteredPapers.length}
              </p>

            </div>

            <div className="bg-white border border-[#e5e5e5] rounded-xl p-4">

              <p className="!text-[#91877d] text-[10px]">
                Current List
              </p>

              <p className="!text-[#111111] text-2xl font-medium mt-1">
                {totalPages === 0
                  ? 0
                  : page + 1}
              </p>

            </div>

            <div className="hidden sm:block bg-white border border-[#e5e5e5] rounded-xl p-4">

              <p className="!text-[#91877d] text-[10px]">
                Papers Per List
              </p>

              <p className="!text-[#111111] text-2xl font-medium mt-1">
                10
              </p>

            </div>

          </div>

          {/* ==================================================
              MAIN GRID
          ================================================== */}

          <div className="grid xl:grid-cols-[1fr_330px] gap-5">

            {/* =================================================
                PAPER LIST
            ================================================= */}

            <section className="bg-white border border-[#e5e5e5] rounded-2xl overflow-hidden">

              {/* Search */}

              <div className="px-4 py-4 border-b border-[#eee6dd]">

                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">

                  <div className="relative flex-1 max-w-xl">

                    <Search
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 !text-[#aaa097]"
                    />

                    <input
                      type="text"
                      value={search}
                      onChange={(
                        event
                      ) => {
                        setSearch(
                          event.target.value
                        );
                        setPage(0);
                      }}
                      placeholder="Search paper title or submission ID..."
                      className="w-full h-10 pl-10 pr-3 rounded-lg border border-[#e1d9cf] bg-[#fcfaf8] !text-[#302a25] text-xs placeholder:!text-[#aaa097] outline-none focus:border-[#a78b6d] focus:ring-2 focus:ring-[#a78b6d]/10 transition"
                    />

                  </div>

                  <div className="flex items-center gap-2 !text-[#8b6b47]">

                    <FileText
                      size={15}
                    />

                    <span className="text-xs font-medium">
                      {filteredPapers.length}
                      {" "}
                      accepted
                    </span>

                    {selectedPapers.length > 0 && (
                      <span className="text-xs font-semibold !text-[#244e70]">
                        • {selectedPapers.length} selected
                      </span>
                    )}

                  </div>

                </div>

              </div>

              {/* Table */}

              {paginatedPapers.length ===
              0 ? (
                <div className="py-16 px-6 text-center">

                  <div className="w-12 h-12 rounded-xl bg-[#eef3f7] !text-[#244e70] flex items-center justify-center mx-auto">

                    <BookOpen
                      size={20}
                    />

                  </div>

                  <h3 className="!text-[#302a25] text-sm font-semibold mt-4">
                    {search
                      ? "No matching accepted papers"
                      : "No papers ready for publication"}
                  </h3>

                  <p className="!text-[#8f857b] text-xs mt-2 max-w-md mx-auto">
                    {search
                      ? "Try a different search term."
                      : "Only papers with an accepted status that have not yet been published appear here."}
                  </p>

                </div>
              ) : (
                <div className="overflow-x-auto">

                  <table className="w-full min-w-[760px]">

                    <thead>

                      <tr className="bg-[#faf7f3] border-b border-[#eee6dd]">

                        <th className="w-12 px-4 py-3.5">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleSelectAllCurrentPage();
                            }}
                            disabled={paginatedPapers.length === 0}
                            className={`
                              w-5 h-5 rounded border flex items-center justify-center
                              transition
                              ${
                                allCurrentPageSelected
                                  ? "border-[#244e70] bg-[#244e70]"
                                  : "border-[#cfc5ba] bg-white"
                              }
                              disabled:opacity-40
                            `}
                            aria-label={
                              allCurrentPageSelected
                                ? "Deselect all papers on this page"
                                : "Select all papers on this page"
                            }
                          >
                            {allCurrentPageSelected && (
                              <CheckCircle2
                                size={13}
                                className="text-white"
                              />
                            )}
                          </button>
                        </th>

                        <th className="text-left px-3 py-3.5 text-[9px] uppercase tracking-[0.12em] !text-[#91877d] font-semibold">
                          Paper
                        </th>

                        <th className="text-left px-4 py-3.5 text-[9px] uppercase tracking-[0.12em] !text-[#91877d] font-semibold">
                          Submission ID
                        </th>

                        <th className="text-left px-4 py-3.5 text-[9px] uppercase tracking-[0.12em] !text-[#91877d] font-semibold">
                          Status
                        </th>

                        <th className="text-left px-4 py-3.5 text-[9px] uppercase tracking-[0.12em] !text-[#91877d] font-semibold">
                          accepted
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {paginatedPapers.map(
                        (paper) => {
                          const selected =
                            isPaperSelected(paper.id);

                          return (
                            <tr
                              key={
                                paper.id
                              }
                              onClick={() =>
                                handleSelectPaper(
                                  paper
                                )
                              }
                              className={`
                                border-b
                                border-[#eee6dd]
                                last:border-0
                                cursor-pointer
                                transition
                                ${
                                  selected
                                    ? "bg-[#eef3f7]"
                                    : "hover:bg-[#fcfaf8]"
                                }
                              `}
                            >

                              <td className="px-4 py-4">

                                <div
                                  className={`
                                    w-5
                                    h-5
                                    rounded-md
                                    border
                                    flex
                                    items-center
                                    justify-center
                                    ${
                                      selected
                                        ? "border-[#244e70] bg-[#244e70]"
                                        : "border-[#cfc5ba] bg-white"
                                    }
                                  `}
                                >
                                  {selected && (
                                    <CheckCircle2
                                      size={13}
                                      className="text-white"
                                    />
                                  )}
                                </div>

                              </td>

                              <td className="px-3 py-4">

                                <div className="flex items-start gap-3">

                                  <div className="w-9 h-9 rounded-lg bg-[#eef3f7] !text-[#244e70] flex items-center justify-center shrink-0">

                                    <FileText
                                      size={16}
                                    />

                                  </div>

                                  <div className="min-w-0">

                                    <p className="!text-[#302a25] font-semibold text-xs line-clamp-2">
                                      {getSubmissionTitle(
                                        paper
                                      )}
                                    </p>

                                    <p className="!text-[#9a9188] text-[10px] mt-1">
                                      {getAuthorCount(
                                        paper.authors
                                      )}{" "}
                                      author
                                      {getAuthorCount(
                                        paper.authors
                                      ) !==
                                      1
                                        ? "s"
                                        : ""}
                                    </p>

                                  </div>

                                </div>

                              </td>

                              <td className="px-4 py-4">

                                <span className="font-mono text-[10px] !text-[#766e65]">
                                  {paper.id}
                                </span>

                              </td>

                              <td className="px-4 py-4">

                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full border bg-green-50 text-green-700 border-green-100 text-[9px] font-semibold">
                                  <CheckCircle2
                                    size={11}
                                  />
                                  accepted
                                </span>

                              </td>

                              <td className="px-4 py-4">

                                <div className="flex items-center gap-1.5 !text-[#766e65] text-[11px]">

                                  <CalendarDays
                                    size={13}
                                  />

                                  {formatDate(
                                    paper.updatedAt ||
                                      paper.createdAt
                                  )}

                                </div>

                              </td>

                            </tr>
                          );
                        }
                      )}

                    </tbody>

                  </table>

                </div>
              )}

              {/* =================================================
                  PAGINATION
              ================================================= */}

              <div className="px-4 py-3 border-t border-[#eee6dd] flex items-center justify-between">

                <div>

                  <p className="!text-[#8d847b] text-[10px]">

                    {filteredPapers.length ===
                    0
                      ? "No papers"
                      : `Showing ${
                          page *
                            PAPERS_PER_PAGE +
                          1
                        }–${Math.min(
                          (page + 1) *
                            PAPERS_PER_PAGE,
                          filteredPapers.length
                        )} of ${
                          filteredPapers.length
                        }`}

                  </p>

                </div>

                <div className="flex items-center gap-2">

                  <button
                    type="button"
                    onClick={() =>
                      setPage(
                        (current) =>
                          Math.max(
                            current -
                              1,
                            0
                          )
                      )
                    }
                    disabled={
                      page === 0
                    }
                    className="w-9 h-9 rounded-lg border border-[#ded5ca] bg-white flex items-center justify-center !text-[#66594d] hover:bg-[#faf7f3] transition disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Previous list"
                  >
                    <ArrowLeft
                      size={15}
                    />
                  </button>

                  <span className="min-w-[60px] text-center !text-[#766e65] text-[10px]">
                    {totalPages ===
                    0
                      ? "0 / 0"
                      : `${page + 1} / ${totalPages}`}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setPage(
                        (current) =>
                          Math.min(
                            current +
                              1,
                            Math.max(
                              totalPages -
                                1,
                              0
                            )
                          )
                      )
                    }
                    disabled={
                      page >=
                        totalPages -
                          1 ||
                      totalPages ===
                        0
                    }
                    className="w-9 h-9 rounded-lg border border-[#ded5ca] bg-white flex items-center justify-center !text-[#66594d] hover:bg-[#faf7f3] transition disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Next list"
                  >
                    <ArrowRight
                      size={15}
                    />
                  </button>

                </div>

              </div>

            </section>

            {/* =================================================
                PUBLISH PANEL
            ================================================= */}

            <section className="bg-white border border-[#e5e5e5] rounded-2xl overflow-hidden h-fit xl:sticky xl:top-[100px]">

              <div className="px-5 py-4 border-b border-[#eee6dd]">

                <p className="!text-[#91877d] text-[9px] uppercase tracking-[0.14em] font-semibold">
                  Publication
                </p>

                <h3 className="!text-[#302a25] text-base font-semibold mt-1">
                  Publish Paper
                </h3>

              </div>

              {selectedPapers.length === 0 ? (
                <div className="px-5 py-10 text-center">

                  <div className="w-11 h-11 rounded-xl bg-[#eef3f7] !text-[#244e70] flex items-center justify-center mx-auto">

                    <Send
                      size={18}
                    />

                  </div>

                  <p className="!text-[#302a25] text-xs font-semibold mt-4">
                    Select papers
                  </p>

                  <p className="!text-[#8f857b] text-[11px] leading-5 mt-2">
                    Select one or multiple accepted papers from the list to publish them into the same journal year and volume.
                  </p>

                </div>
              ) : (
                <div className="p-5">

                  {/* Selected papers */}

                  <div className="rounded-xl border border-[#e4ddd5] bg-[#fcfaf8] p-4">

                    <div className="flex items-center justify-between gap-3">

                      <div>
                        <p className="!text-[#91877d] text-[9px] uppercase tracking-[0.12em] font-semibold">
                          Selected Papers
                        </p>

                        <h4 className="!text-[#302a25] text-lg font-semibold leading-5 mt-1">
                          {selectedPapers.length}
                        </h4>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPapers([]);
                          setPublishError("");
                          setPublishSuccess(false);
                        }}
                        disabled={publishing}
                        className="text-[10px] font-semibold !text-[#8f6b54] hover:underline disabled:opacity-50"
                      >
                        Clear all
                      </button>

                    </div>

                    <div className="mt-3 max-h-52 overflow-y-auto space-y-2 pr-1">

                      {selectedPapers.map((paper, index) => (
                        <div
                          key={paper.id}
                          className="rounded-lg border border-[#e8e0d8] bg-white p-2.5"
                        >
                          <div className="flex items-start gap-2">

                            <span className="w-5 h-5 rounded-md bg-[#eef3f7] !text-[#244e70] flex items-center justify-center shrink-0 text-[9px] font-bold">
                              {index + 1}
                            </span>

                            <div className="min-w-0">
                              <p className="!text-[#302a25] text-[10px] font-semibold leading-4 line-clamp-2">
                                {getSubmissionTitle(paper)}
                              </p>

                              <p className="font-mono !text-[#91877d] text-[8px] mt-1 break-all">
                                {paper.id}
                              </p>
                            </div>

                          </div>
                        </div>
                      ))}

                    </div>

                  </div>

                  {/* Form */}

                  <div className="mt-5 space-y-4">

                    <div>

                      <label className="block !text-[#665e56] text-[10px] font-semibold mb-1.5">
                        Publication Year
                      </label>

                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        value={
                          publishYear
                        }
                        onChange={(
                          event
                        ) =>
                          setPublishYear(
                            event.target.value.replace(
                              /\D/g,
                              ""
                            )
                          )
                        }
                        placeholder="2026"
                        className="w-full h-10 px-3 rounded-lg border border-[#e1d9cf] bg-[#fcfaf8] !text-[#302a25] text-xs outline-none focus:border-[#244e70] focus:ring-2 focus:ring-[#244e70]/10 transition"
                      />

                    </div>

                    <div>

                      <label className="block !text-[#665e56] text-[10px] font-semibold mb-1.5">
                        Volume
                      </label>

                      <input
                        type="text"
                        value={
                          publishVolume
                        }
                        onChange={(
                          event
                        ) =>
                          setPublishVolume(
                            event.target.value
                          )
                        }
                        placeholder="1"
                        className="w-full h-10 px-3 rounded-lg border border-[#e1d9cf] bg-[#fcfaf8] !text-[#302a25] text-xs outline-none focus:border-[#244e70] focus:ring-2 focus:ring-[#244e70]/10 transition"
                      />

                    </div>

                  </div>

                  {/* Error */}

                  {publishError && (
                    <div className="mt-4 p-3 rounded-lg border border-red-200 bg-red-50 flex gap-2">

                      <XCircle
                        size={15}
                        className="text-red-500 shrink-0 mt-0.5"
                      />

                      <p className="!text-red-700 text-[10px] leading-4">
                        {publishError}
                      </p>

                    </div>
                  )}

                  {/* Bulk publish button */}

                  <button
                    type="button"
                    onClick={
                      handlePublish
                    }
                    disabled={
                      publishing
                    }
                    className="w-full h-11 rounded-xl bg-[#244e70] text-white text-xs font-semibold mt-5 flex items-center justify-center gap-2 hover:bg-[#1b3a54] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >

                    {publishing ? (
                      <>
                        <RefreshCw
                          size={14}
                          className="animate-spin"
                        />

                        Publishing {selectedPapers.length} papers...
                      </>
                    ) : (
                      <>
                        <Send
                          size={14}
                        />

                        Publish {selectedPapers.length} Paper{selectedPapers.length !== 1 ? "s" : ""}
                      </>
                    )}

                  </button>

                  <p className="!text-[#9a9188] text-[9px] leading-4 mt-3 text-center">
                    All selected papers will be published into the same year and volume.
                  </p>

                </div>
              )}

            </section>

          </div>

        </div>

      </div>

    </main>
  );
}

/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

function getSubmissionTitle(
  submission: Submission
) {
  return (
    submission.title ||
    submission.paperTitle ||
    "Untitled submission"
  );
}

function getDateValue(
  value: unknown
): number {
  if (!value) return 0;

  if (
    value instanceof Timestamp
  ) {
    return value.toMillis();
  }

  if (
    value instanceof Date
  ) {
    return value.getTime();
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toMillis" in value &&
    typeof (
      value as {
        toMillis?: unknown;
      }
    ).toMillis ===
      "function"
  ) {
    return (
      value as {
        toMillis: () => number;
      }
    ).toMillis();
  }

  if (
    typeof value ===
    "number"
  ) {
    return value;
  }

  if (
    typeof value ===
    "string"
  ) {
    const parsed =
      new Date(value).getTime();

    return Number.isNaN(parsed)
      ? 0
      : parsed;
  }

  return 0;
}

function formatDate(
  value: unknown
) {
  const timestamp =
    getDateValue(value);

  if (!timestamp) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(
    new Date(timestamp)
  );
}

function getAuthorCount(
  authors: unknown
) {
  if (
    Array.isArray(authors)
  ) {
    return authors.length;
  }

  if (
    typeof authors ===
      "string" &&
    authors.trim()
  ) {
    return authors
      .split(",")
      .filter(Boolean)
      .length;
  }

  return 0;
}