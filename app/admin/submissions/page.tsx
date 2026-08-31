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
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  limit,
  Timestamp,
} from "firebase/firestore";

import {
  LayoutDashboard,
  FileText,
  Users,
  BookOpen,
  LogOut,
  Menu,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  RefreshCw,
  X,
  CheckCircle2,
  XCircle,
  Clock3,
  AlertCircle,
  Search,
  Eye,
  Trash2,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import { auth, firestore } from "@/lib/firebase";

/*
 * ==============================================================
 * TYPES
 * ==============================================================
 */

type Submission = {
  id: string;

  title?: string;

  abstract?: string;

  author?: string;

  authors?: string[];

  email?: string;

  affiliation?: string;

  country?: string;

  category?: string;

  keywords?: string[] | string;

  remarks?: string;

  pdfUrl?: string;

  status?: string;

  submittedAt?: Timestamp | Date | string | null;

  createdAt?: Timestamp | Date | string | null;

  updatedAt?: Timestamp | Date | string | null;
};

type AdminProfile = {
  uid?: string;
  email?: string;
  name?: string;
  role?: string;
  status?: string;
};

type MenuItem = {
  label: string;
  icon: React.ElementType;
  section?: string;
};

/*
 * ==============================================================
 * MENU
 * SAME LABEL LAYOUT AS EDITORIAL BOARD
 * ==============================================================
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

  {
    label: "Reviewers",
    icon: Users,
    section: "Reviewers",
  },

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
];

/*
 * ==============================================================
 * CONSTANTS
 * ==============================================================
 */

const PAPERS_PER_PAGE = 10;

/*
 * ==============================================================
 * HELPERS
 * ==============================================================
 */

function getSubmissionDate(
  submission: Submission
) {
  return (
    submission.submittedAt ||
    submission.createdAt ||
    null
  );
}

function dateToMillis(
  value:
    | Timestamp
    | Date
    | string
    | null
    | undefined
) {
  if (!value) return 0;

  try {
    if (value instanceof Timestamp) {
      return value.toDate().getTime();
    }

    if (value instanceof Date) {
      return value.getTime();
    }

    return new Date(value).getTime();
  } catch {
    return 0;
  }
}

function formatDate(
  value:
    | Timestamp
    | Date
    | string
    | null
    | undefined
) {
  if (!value) return "—";

  try {
    const date =
      value instanceof Timestamp
        ? value.toDate()
        : value instanceof Date
        ? value
        : new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  } catch {
    return "—";
  }
}

function formatTime(
  value:
    | Timestamp
    | Date
    | string
    | null
    | undefined
) {
  if (!value) return "";

  try {
    const date =
      value instanceof Timestamp
        ? value.toDate()
        : value instanceof Date
        ? value
        : new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleTimeString(
      "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  } catch {
    return "";
  }
}

function getAuthors(
  submission: Submission
) {
  if (
    Array.isArray(
      submission.authors
    ) &&
    submission.authors.length
  ) {
    return submission.authors.join(
      ", "
    );
  }

  return (
    submission.author ||
    "Unknown author"
  );
}

function getKeywords(
  submission: Submission
) {
  if (
    Array.isArray(
      submission.keywords
    )
  ) {
    return submission.keywords;
  }

  if (
    typeof submission.keywords ===
    "string"
  ) {
    return submission.keywords
      .split(",")
      .map((item) =>
        item.trim()
      )
      .filter(Boolean);
  }

  return [];
}

function getStatusLabel(
  status?: string
) {
  switch (status) {
    case "pending":
    case "submitted":
    case "under_review":
      return "Pending Review";

    case "revision_requested":
      return "Revision Required";

    case "accepted":
    case "approved":
      return "Accepted";

    case "rejected":
      return "Rejected";

    case "published":
      return "Published";

    default:
      return (
        status
          ?.replaceAll("_", " ")
          .replace(
            /\b\w/g,
            (char) =>
              char.toUpperCase()
          ) || "Unknown"
      );
  }
}

function getStatusClass(
  status?: string
) {
  switch (status) {
    case "pending":
    case "submitted":
    case "under_review":
      return "bg-[#fff5d8] text-[#a87500]";

    case "revision_requested":
      return "bg-[#f1eaff] text-[#7252b8]";

    case "accepted":
    case "approved":
      return "bg-[#e2f7eb] text-[#17834d]";

    case "rejected":
      return "bg-[#fde8e8] text-[#bd3434]";

    case "published":
      return "bg-[#e5eff8] text-[#244e70]";

    default:
      return "bg-gray-100 text-gray-600";
  }
}

/*
 * ==============================================================
 * PAGE
 * ==============================================================
 */

export default function SubmissionsPage() {
  const router = useRouter();

  /*
   * ------------------------------------------------------------
   * AUTH
   * ------------------------------------------------------------
   */

  const [user, setUser] =
    useState<User | null>(null);

  const [profile, setProfile] =
    useState<AdminProfile | null>(
      null
    );

  const [authLoading, setAuthLoading] =
    useState(true);

  /*
   * ------------------------------------------------------------
   * SIDEBAR
   * ------------------------------------------------------------
   */

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [
    sidebarCollapsed,
    setSidebarCollapsed,
  ] = useState(false);

  const [activeMenu, setActiveMenu] =
    useState("All Submissions");

  /*
   * ------------------------------------------------------------
   * DATA
   * ------------------------------------------------------------
   */

  const [submissions, setSubmissions] =
    useState<Submission[]>([]);

  const [loading, setLoading] =
    useState(true);

  /*
   * ------------------------------------------------------------
   * FILTERS
   * ------------------------------------------------------------
   */

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  /*
   * ------------------------------------------------------------
   * PAGINATION
   * ------------------------------------------------------------
   */

  const [currentPage, setCurrentPage] =
    useState(1);

  /*
   * ------------------------------------------------------------
   * MODALS
   * ------------------------------------------------------------
   */

  const [
    selectedSubmission,
    setSelectedSubmission,
  ] = useState<Submission | null>(
    null
  );

  const [
    deleteTarget,
    setDeleteTarget,
  ] = useState<Submission | null>(
    null
  );

  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  /*
   * ------------------------------------------------------------
   * MESSAGES
   * ------------------------------------------------------------
   */

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /*
   * ============================================================
   * AUTHENTICATION
   * ============================================================
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
             * First:
             * admin/{uid}
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

            if (
              adminSnapshot.exists()
            ) {
              adminData =
                adminSnapshot.data() as AdminProfile;
            }

            /*
             * Fallback:
             * email lookup
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

              const snapshot =
                await getDocs(
                  adminQuery
                );

              if (
                !snapshot.empty
              ) {
                adminData =
                  snapshot.docs[0]
                    .data() as AdminProfile;
              }
            }

            if (!adminData) {
              setError(
                "Your Firebase account is authenticated, but no administrator record was found in Firestore."
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
              "SUBMISSIONS AUTH ERROR:",
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
   * ============================================================
   * LOAD SUBMISSIONS
   * ============================================================
   */

  const loadSubmissions =
    async () => {
      try {
        setLoading(true);
        setError("");

        const submissionsRef =
          collection(
            firestore,
            "submissions"
          );

        try {
          const q = query(
            submissionsRef,
            orderBy(
              "submittedAt",
              "desc"
            )
          );

          const snapshot =
            await getDocs(q);

          const data: Submission[] =
            snapshot.docs.map(
              (item) => ({
                id: item.id,
                ...item.data(),
              })
            );

          setSubmissions(data);

          return;
        } catch (orderedError) {
          console.warn(
            "Ordered query failed:",
            orderedError
          );
        }

        /*
         * Fallback if some documents don't
         * have submittedAt.
         */

        const snapshot =
          await getDocs(
            submissionsRef
          );

        const data: Submission[] =
          snapshot.docs
            .map((item) => ({
              id: item.id,
              ...item.data(),
            }))
            .sort(
              (a, b) =>
                dateToMillis(
                  getSubmissionDate(b)
                ) -
                dateToMillis(
                  getSubmissionDate(a)
                )
            );

        setSubmissions(data);
      } catch (err) {
        console.error(
          "SUBMISSIONS LOAD ERROR:",
          err
        );

        setError(
          "Unable to load submissions. Check your Firestore permissions."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (
      !authLoading &&
      !error
    ) {
      loadSubmissions();
    }
  }, [
    authLoading,
    error,
  ]);

  /*
   * ============================================================
   * FILTER
   * ============================================================
   */

  const filteredSubmissions =
    useMemo(() => {
      const searchValue =
        search
          .trim()
          .toLowerCase();

      return submissions.filter(
        (submission) => {
          const title =
            submission.title
              ?.toLowerCase() ||
            "";

          const author =
            getAuthors(
              submission
            ).toLowerCase();

          const email =
            submission.email
              ?.toLowerCase() ||
            "";

          const affiliation =
            submission.affiliation
              ?.toLowerCase() ||
            "";

          const category =
            submission.category
              ?.toLowerCase() ||
            "";

          const matchesSearch =
            !searchValue ||
            title.includes(
              searchValue
            ) ||
            author.includes(
              searchValue
            ) ||
            email.includes(
              searchValue
            ) ||
            affiliation.includes(
              searchValue
            ) ||
            category.includes(
              searchValue
            );

          const matchesStatus =
            statusFilter ===
              "all" ||
            (
              statusFilter ===
                "pending"
                ? [
                    "pending",
                    "submitted",
                    "under_review",
                  ].includes(
                    submission.status ||
                      ""
                  )
                : submission.status ===
                  statusFilter
            );

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      submissions,
      search,
      statusFilter,
    ]);

  /*
   * ============================================================
   * RESET PAGE
   * ============================================================
   */

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    statusFilter,
  ]);

  /*
   * ============================================================
   * PAGINATION
   * ============================================================
   */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredSubmissions.length /
          PAPERS_PER_PAGE
      )
    );

  const pageSubmissions =
    filteredSubmissions.slice(
      (currentPage - 1) *
        PAPERS_PER_PAGE,
      currentPage *
        PAPERS_PER_PAGE
    );

  /*
   * ============================================================
   * STATS
   * ============================================================
   */

  const totalCount =
    submissions.length;

  const pendingCount =
    submissions.filter(
      (item) =>
        [
          "pending",
          "submitted",
          "under_review",
        ].includes(
          item.status || ""
        )
    ).length;

  const revisionCount =
    submissions.filter(
      (item) =>
        item.status ===
        "revision_requested"
    ).length;

  const acceptedCount =
    submissions.filter(
      (item) =>
        [
          "accepted",
          "approved",
        ].includes(
          item.status || ""
        )
    ).length;

  /*
   * ============================================================
   * UPDATE STATUS
   * ============================================================
   */

  const updateStatus =
    async (
      submission: Submission,
      newStatus: string
    ) => {
      try {
        setUpdatingId(
          submission.id
        );

        setError("");
        setSuccess("");

        await updateDoc(
          doc(
            firestore,
            "submissions",
            submission.id
          ),
          {
            status: newStatus,
            updatedAt:
              serverTimestamp(),
          }
        );

        setSubmissions(
          (current) =>
            current.map(
              (item) =>
                item.id ===
                submission.id
                  ? {
                      ...item,
                      status:
                        newStatus,
                    }
                  : item
            )
        );

        setSelectedSubmission(
          (current) =>
            current?.id ===
            submission.id
              ? {
                  ...current,
                  status:
                    newStatus,
                }
              : current
        );

        setSuccess(
          `Submission status changed to ${getStatusLabel(
            newStatus
          )}.`
        );
      } catch (err) {
        console.error(
          "STATUS UPDATE ERROR:",
          err
        );

        setError(
          "Unable to update submission status."
        );
      } finally {
        setUpdatingId(null);
      }
    };

  /*
   * ============================================================
   * DELETE
   * ============================================================
   */

  const deleteSubmission =
    async () => {
      if (!deleteTarget) return;

      try {
        setUpdatingId(
          deleteTarget.id
        );

        await deleteDoc(
          doc(
            firestore,
            "submissions",
            deleteTarget.id
          )
        );

        setSubmissions(
          (current) =>
            current.filter(
              (item) =>
                item.id !==
                deleteTarget.id
            )
        );

        if (
          selectedSubmission?.id ===
          deleteTarget.id
        ) {
          setSelectedSubmission(
            null
          );
        }

        setDeleteTarget(null);

        setSuccess(
          "Submission deleted successfully."
        );
      } catch (err) {
        console.error(
          "DELETE ERROR:",
          err
        );

        setError(
          "Unable to delete submission."
        );
      } finally {
        setUpdatingId(null);
      }
    };

  /*
   * ============================================================
   * LOGOUT
   * ============================================================
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
          "LOGOUT ERROR:",
          err
        );

        router.replace(
          "/login"
        );
      }
    };

  /*
   * ============================================================
   * NAVIGATION
   * ============================================================
   */

  const handleNavigation = (
    label: string
  ) => {
    setActiveMenu(label);
    setSidebarOpen(false);

    switch (label) {
      case "Dashboard":
        router.push("/admin");
        break;

      case "All Submissions":
        router.push(
          "/admin/submissions"
        );
        break;

      case "Reviewers":
        router.push(
          "/admin/reviewer"
        );
        break;

      case "Editorial Board":
        router.push(
          "/admin/editorial-board"
        );
        break;

      case "Publish Papers":
        router.push(
          "/admin/journal"
        );
        break;

      default:
        break;
    }
  };

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (
    authLoading ||
    loading
  ) {
    return (
      <main className="min-h-[100dvh] bg-[#f7f7f7] flex items-center justify-center">

        <div className="text-center">

          <div className="w-12 h-12 rounded-xl bg-[#244e70] text-white flex items-center justify-center mx-auto animate-pulse">
            <FileText size={21} />
          </div>

          <p className="!text-[#666666] text-sm mt-4">
            Loading submissions...
          </p>

        </div>

      </main>
    );
  }

  /*
   * ============================================================
   * MAIN UI
   * ============================================================
   */

  return (
    <main className="min-h-[100dvh] bg-[#f7f7f7]">

      {/* ========================================================
          MOBILE HEADER
      ======================================================== */}

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
        >
          <Menu size={20} />
        </button>

      </header>

      {/* ========================================================
          MOBILE OVERLAY
      ======================================================== */}

      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-40"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* ========================================================
          SIDEBAR
          SAME DESIGN AS EDITORIAL BOARD
      ======================================================== */}

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

        {/* HEADER */}

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
          >
            <X size={19} />
          </button>

        </div>

        {/* NAVIGATION */}

        <nav className="px-2.5 py-4 overflow-y-auto h-[calc(100%-125px)]">

          {menuItems.map(
            (item) => {
              const Icon =
                item.icon;

              return (
                <div
                  key={
                    item.label
                  }
                >

                  {item.section &&
                    !sidebarCollapsed && (
                      <p className="!text-white/30 text-[8px] uppercase tracking-[0.18em] font-semibold px-2.5 mt-4 mb-1.5">
                        {
                          item.section
                        }
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
                          {
                            item.label
                          }
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

        {/* LOGOUT */}

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

      {/* ========================================================
          MAIN AREA
      ======================================================== */}

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

        {/* ======================================================
            DESKTOP HEADER
            SAME DESIGN
        ====================================================== */}

        <header className="hidden lg:flex h-[77px] bg-white border-b border-[#e5e5e5] items-center justify-between px-7 sticky top-0 z-30">

          <div className="flex items-center gap-3">

            <button
              onClick={() =>
                setSidebarCollapsed(
                  (prev) => !prev
                )
              }
              className="w-8 h-8 rounded-lg hover:bg-[#f7f7f7] flex items-center justify-center !text-[#666666]"
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
                All Submissions
              </h2>

              <p className="!text-[#888888] text-[11px] mt-0.5">
                Paper Submission Management
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

        {/* ======================================================
            CONTENT
        ====================================================== */}

        <div className="px-7 py-6 max-w-[1250px] mx-auto">

          {/* ====================================================
              PAGE INTRO
          ==================================================== */}

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">

            <div>

              <div className="flex items-center gap-3">

                {/* BACK ARROW */}

                <button
                  onClick={() =>
                    router.push(
                      "/admin"
                    )
                  }
                  className="hidden sm:flex w-8 h-8 rounded-lg border border-[#ddd5cc] bg-white items-center justify-center !text-[#766e65] hover:bg-[#faf7f3] transition"
                  title="Back to dashboard"
                >
                  <ArrowLeft
                    size={15}
                  />
                </button>

                <h2 className="!text-[#111111] text-[24px] leading-7 font-medium">
                  All Submissions
                </h2>

              </div>

              <p className="!text-[#666666] text-sm mt-1.5">
                View and manage all paper
                submissions.
              </p>

            </div>

            <div className="flex gap-2">

              <button
                onClick={
                  loadSubmissions
                }
                disabled={loading}
                className="inline-flex h-9 px-3 rounded-lg border border-[#ddd5cc] bg-white items-center justify-center gap-2 !text-[#66594d] text-xs hover:bg-[#faf7f3] transition disabled:opacity-50"
              >

                <RefreshCw
                  size={14}
                  className={
                    loading
                      ? "animate-spin"
                      : ""
                  }
                />

                Refresh

              </button>

            </div>

          </div>

          {/* ====================================================
              MESSAGES
          ==================================================== */}

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">

              <div className="flex items-start gap-2.5">

                <XCircle
                  size={16}
                  className="mt-0.5 shrink-0"
                />

                <span>
                  {error}
                </span>

              </div>

            </div>
          )}

          {success && (
            <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-xs text-green-700">

              <div className="flex items-center gap-2.5">

                <CheckCircle2
                  size={16}
                />

                <span>
                  {success}
                </span>

              </div>

            </div>
          )}

          {/* ====================================================
              STATS
          ==================================================== */}

          <div className="mb-7 grid grid-cols-2 sm:grid-cols-4 gap-3">

            <SubmissionStat
              icon={FileText}
              label="Total Submissions"
              value={
                totalCount
              }
            />

            <SubmissionStat
              icon={Clock3}
              label="Pending Review"
              value={
                pendingCount
              }
            />

            <SubmissionStat
              icon={AlertCircle}
              label="Revision Required"
              value={
                revisionCount
              }
            />

            <SubmissionStat
              icon={CheckCircle2}
              label="Accepted"
              value={
                acceptedCount
              }
            />

          </div>

          {/* ====================================================
              FILTERS
          ==================================================== */}

          <div className="mb-5 rounded-xl border border-[#e5e5e5] bg-white p-4">

            <div className="flex flex-col sm:flex-row gap-3">

              {/* SEARCH */}

              <div className="relative flex-1">

                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 !text-[#999999]"
                />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search by title, author, email..."
                  className="h-10 w-full rounded-lg border border-[#ddd5cc] bg-white pl-9 pr-3 text-xs !text-[#333333] outline-none placeholder:!text-[#999999] focus:border-[#244e70]"
                />

              </div>

              {/* STATUS */}

              <select
                value={
                  statusFilter
                }
                onChange={(
                  event
                ) =>
                  setStatusFilter(
                    event.target
                      .value
                  )
                }
                className="h-10 sm:w-[190px] rounded-lg border border-[#ddd5cc] bg-white px-3 text-xs !text-[#555555] outline-none focus:border-[#244e70]"
              >

                <option value="all">
                  All Status
                </option>

                <option value="pending">
                  Pending Review
                </option>

                <option value="revision_requested">
                  Revision Required
                </option>

                <option value="accepted">
                  Accepted
                </option>

                <option value="approved">
                  Approved
                </option>

                <option value="rejected">
                  Rejected
                </option>

                <option value="published">
                  Published
                </option>

              </select>

            </div>

          </div>

          {/* ====================================================
              SUBMISSIONS LIST
          ==================================================== */}

          <div className="rounded-2xl border border-[#e5e5e5] bg-white overflow-hidden">

            {/* HEADER */}

            <div className="hidden lg:grid grid-cols-[minmax(300px,1fr)_180px_150px_160px] gap-4 px-5 py-3 border-b border-[#eee7df] bg-[#fafafa]">

              <p className="text-[10px] uppercase tracking-[0.12em] font-semibold !text-[#8b8178]">
                Title / Authors
              </p>

              <p className="text-[10px] uppercase tracking-[0.12em] font-semibold !text-[#8b8178]">
                Status
              </p>

              <p className="text-[10px] uppercase tracking-[0.12em] font-semibold !text-[#8b8178]">
                Submitted
              </p>

              <p className="text-[10px] uppercase tracking-[0.12em] font-semibold !text-[#8b8178] text-right">
                Actions
              </p>

            </div>

            {/* LOADING */}

            {loading ? (
              <>
                {Array.from({
                  length: 10,
                }).map(
                  (_, index) => (
                    <SubmissionSkeleton
                      key={index}
                    />
                  )
                )}
              </>
            ) : pageSubmissions.length ===
              0 ? (
              <EmptyState
                search={search}
                statusFilter={
                  statusFilter
                }
                clearFilters={() => {
                  setSearch("");
                  setStatusFilter(
                    "all"
                  );
                }}
              />
            ) : (
              <>
                {pageSubmissions.map(
                  (
                    submission
                  ) => (
                    <SubmissionRow
                      key={
                        submission.id
                      }
                      submission={
                        submission
                      }
                      updating={
                        updatingId ===
                        submission.id
                      }
                      view={() =>
                        setSelectedSubmission(
                          submission
                        )
                      }
                      changeStatus={(
                        status
                      ) =>
                        updateStatus(
                          submission,
                          status
                        )
                      }
                      remove={() =>
                        setDeleteTarget(
                          submission
                        )
                      }
                    />
                  )
                )}
              </>
            )}

            {/* ==================================================
                PAGINATION
            ================================================== */}

            {!loading &&
              filteredSubmissions.length >
                0 && (
                <div className="border-t border-[#eee7df] px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                  <p className="!text-[#777777] text-xs">

                    Showing{" "}

                    <span className="font-semibold !text-[#444444]">
                      {(currentPage -
                        1) *
                        PAPERS_PER_PAGE +
                        1}
                    </span>

                    {" "}to{" "}

                    <span className="font-semibold !text-[#444444]">
                      {Math.min(
                        currentPage *
                          PAPERS_PER_PAGE,
                        filteredSubmissions.length
                      )}
                    </span>

                    {" "}of{" "}

                    <span className="font-semibold !text-[#444444]">
                      {
                        filteredSubmissions.length
                      }
                    </span>

                    {" "}submissions

                  </p>

                  {/* PAGINATION BUTTONS */}

                  <div className="flex items-center gap-1">

                    <button
                      onClick={() =>
                        setCurrentPage(
                          (page) =>
                            Math.max(
                              1,
                              page - 1
                            )
                        )
                      }
                      disabled={
                        currentPage ===
                        1
                      }
                      className="w-8 h-8 rounded-lg border border-[#ddd5cc] bg-white flex items-center justify-center !text-[#777777] hover:bg-[#faf7f3] disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft
                        size={14}
                      />
                    </button>

                    {Array.from(
                      {
                        length:
                          totalPages,
                      },
                      (_, index) =>
                        index + 1
                    ).map(
                      (page) => (
                        <button
                          key={
                            page
                          }
                          onClick={() =>
                            setCurrentPage(
                              page
                            )
                          }
                          className={`
                            min-w-8
                            h-8
                            rounded-lg
                            px-2
                            text-xs
                            font-medium
                            border
                            transition

                            ${
                              currentPage ===
                              page
                                ? "bg-[#244e70] border-[#244e70] text-white"
                                : "bg-white border-[#ddd5cc] !text-[#666666] hover:bg-[#faf7f3]"
                            }
                          `}
                        >
                          {page}
                        </button>
                      )
                    )}

                    <button
                      onClick={() =>
                        setCurrentPage(
                          (page) =>
                            Math.min(
                              totalPages,
                              page + 1
                            )
                        )
                      }
                      disabled={
                        currentPage ===
                        totalPages
                      }
                      className="w-8 h-8 rounded-lg border border-[#ddd5cc] bg-white flex items-center justify-center !text-[#777777] hover:bg-[#faf7f3] disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronRight
                        size={14}
                      />
                    </button>

                  </div>

                </div>
              )}

          </div>

        </div>

      </div>

      {/* ========================================================
          VIEW MODAL
      ======================================================== */}

      {selectedSubmission && (
        <SubmissionModal
          submission={
            selectedSubmission
          }
          updating={
            updatingId ===
            selectedSubmission.id
          }
          close={() =>
            setSelectedSubmission(
              null
            )
          }
          changeStatus={(
            status
          ) =>
            updateStatus(
              selectedSubmission,
              status
            )
          }
          remove={() =>
            setDeleteTarget(
              selectedSubmission
            )
          }
        />
      )}

      {/* ========================================================
          DELETE MODAL
      ======================================================== */}

      {deleteTarget && (
        <DeleteModal
          submission={
            deleteTarget
          }
          deleting={
            updatingId ===
            deleteTarget.id
          }
          cancel={() =>
            setDeleteTarget(null)
          }
          confirm={
            deleteSubmission
          }
        />
      )}

    </main>
  );
}

/*
 * ==============================================================
 * STAT
 * ==============================================================
 */

function SubmissionStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-[#e5e5e5] bg-white p-4">

      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#eef3f7] text-[#244e70]">
        <Icon
          size={17}
          strokeWidth={1.8}
        />
      </div>

      <p className="text-[10px] !text-[#8a8075]">
        {label}
      </p>

      <p className="mt-1 text-2xl font-medium !text-[#302923]">
        {value}
      </p>

    </div>
  );
}

/*
 * ==============================================================
 * SKELETON
 * ==============================================================
 */

function SubmissionSkeleton() {
  return (
    <div className="border-b border-[#eee7df] px-5 py-5 animate-pulse">

      <div className="grid gap-4 lg:grid-cols-[minmax(300px,1fr)_180px_150px_160px] lg:items-center">

        <div>

          <div className="h-4 w-3/4 rounded bg-[#e8e4df]" />

          <div className="mt-3 h-3 w-1/3 rounded bg-[#eeeae6]" />

          <div className="mt-2 h-3 w-1/2 rounded bg-[#eeeae6]" />

        </div>

        <div className="h-6 w-28 rounded-full bg-[#eeeae6]" />

        <div className="h-3 w-24 rounded bg-[#eeeae6]" />

        <div className="flex justify-end gap-2">

          <div className="h-8 w-14 rounded-lg bg-[#eeeae6]" />

          <div className="h-8 w-8 rounded-lg bg-[#eeeae6]" />

        </div>

      </div>

    </div>
  );
}

/*
 * ==============================================================
 * SUBMISSION ROW
 * ==============================================================
 */

function SubmissionRow({
  submission,
  updating,
  view,
  changeStatus,
  remove,
}: {
  submission: Submission;
  updating: boolean;
  view: () => void;
  changeStatus: (
    status: string
  ) => void;
  remove: () => void;
}) {
  const date =
    getSubmissionDate(
      submission
    );

  return (
    <div className="border-b border-[#eee7df] last:border-b-0 px-5 py-5">

      <div className="grid gap-4 lg:grid-cols-[minmax(300px,1fr)_180px_150px_160px] lg:items-center">

        {/* TITLE */}

        <button
          onClick={view}
          className="min-w-0 text-left"
        >

          <p className="text-sm font-semibold leading-5 !text-[#302923] hover:!text-[#244e70] transition">
            {submission.title ||
              "Untitled submission"}
          </p>

          <p className="mt-2 truncate text-xs !text-[#766d64]">
            {getAuthors(
              submission
            )}
          </p>

          {submission.email && (
            <p className="mt-1 truncate text-[10px] !text-[#99918a]">
              {submission.email}
            </p>
          )}

        </button>

        {/* STATUS */}

        <div>

          <span
            className={`
              inline-flex
              rounded-full
              px-2.5
              py-1
              text-[9px]
              font-semibold
              ${getStatusClass(
                submission.status
              )}
            `}
          >
            {getStatusLabel(
              submission.status
            )}
          </span>

        </div>

        {/* DATE */}

        <div>

          <p className="text-xs font-medium !text-[#4d443d]">
            {formatDate(
              date
            )}
          </p>

          <p className="mt-1 text-[10px] !text-[#99918a]">
            {formatTime(
              date
            )}
          </p>

        </div>

        {/* ACTIONS */}

        <div className="flex items-center gap-1.5 justify-start lg:justify-end">

          <button
            onClick={view}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#ddd5cc] bg-white px-3 text-[10px] font-medium !text-[#66594d] hover:bg-[#faf7f3] transition"
          >

            <Eye size={12} />

            View

          </button>

          <select
            value={
              submission.status ||
              "submitted"
            }
            disabled={updating}
            onChange={(event) =>
              changeStatus(
                event.target.value
              )
            }
            className="h-8 max-w-[115px] rounded-lg border border-[#ddd5cc] bg-white px-2 text-[9px] !text-[#66594d] outline-none disabled:opacity-50"
          >

            <option value="submitted">
              Pending Review
            </option>

            <option value="under_review">
              Under Review
            </option>

            <option value="revision_requested">
              Revision
            </option>

            <option value="accepted">
              Accepted
            </option>

            <option value="rejected">
              Rejected
            </option>

            <option value="published">
              Published
            </option>

          </select>

          <button
            onClick={remove}
            disabled={updating}
            className="h-8 w-8 rounded-lg border border-[#eee0d8] bg-white flex items-center justify-center !text-[#9b8174] hover:bg-red-50 hover:!text-red-600 hover:border-red-200 transition disabled:opacity-50"
            title="Delete"
          >
            <Trash2 size={12} />
          </button>

        </div>

      </div>

    </div>
  );
}

/*
 * ==============================================================
 * EMPTY
 * ==============================================================
 */

function EmptyState({
  search,
  statusFilter,
  clearFilters,
}: {
  search: string;
  statusFilter: string;
  clearFilters: () => void;
}) {
  return (
    <div className="min-h-[300px] flex flex-col items-center justify-center px-5 text-center">

      <div className="w-11 h-11 rounded-xl bg-[#eef3f7] text-[#244e70] flex items-center justify-center">
        <FileText size={19} />
      </div>

      <h3 className="mt-4 text-sm font-semibold !text-[#302923]">
        No submissions found
      </h3>

      <p className="mt-1 max-w-sm text-xs !text-[#777777]">
        {search ||
        statusFilter !==
          "all"
          ? "Try changing your search or status filter."
          : "There are no paper submissions yet."}
      </p>

      {(search ||
        statusFilter !==
          "all") && (
        <button
          onClick={
            clearFilters
          }
          className="mt-4 rounded-lg border border-[#ddd5cc] bg-white px-3 py-2 text-xs font-medium !text-[#66594d] hover:bg-[#faf7f3]"
        >
          Clear Filters
        </button>
      )}

    </div>
  );
}

/*
 * ==============================================================
 * SUBMISSION MODAL
 * ==============================================================
 */

function SubmissionModal({
  submission,
  updating,
  close,
  changeStatus,
  remove,
}: {
  submission: Submission;
  updating: boolean;
  close: () => void;
  changeStatus: (
    status: string
  ) => void;
  remove: () => void;
}) {
  const keywords =
    getKeywords(
      submission
    );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 py-5 backdrop-blur-sm">

      <div className="max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* HEADER */}

        <div className="flex items-start justify-between border-b border-[#eee7df] bg-white px-5 py-4">

          <div className="min-w-0 pr-4">

            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] !text-[#244e70]">
              Paper Submission
            </p>

            <h2 className="mt-1 text-xl font-semibold !text-[#302923]">
              {submission.title ||
                "Untitled submission"}
            </h2>

            <span
              className={`
                mt-2
                inline-flex
                rounded-full
                px-2.5
                py-1
                text-[9px]
                font-semibold
                ${getStatusClass(
                  submission.status
                )}
              `}
            >
              {getStatusLabel(
                submission.status
              )}
            </span>

          </div>

          <button
            onClick={close}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#e4d9cc] !text-[#6e6257] hover:bg-[#f7f1e9]"
          >
            <X size={16} />
          </button>

        </div>

        {/* BODY */}

        <div className="max-h-[calc(92vh-150px)] overflow-y-auto px-5 py-5">

          <div className="grid gap-5 sm:grid-cols-2">

            <ModalDetail
              label="Author(s)"
              value={getAuthors(
                submission
              )}
            />

            <ModalDetail
              label="Email"
              value={
                submission.email ||
                "—"
              }
            />

            <ModalDetail
              label="Affiliation"
              value={
                submission.affiliation ||
                "—"
              }
            />

            <ModalDetail
              label="Country"
              value={
                submission.country ||
                "—"
              }
            />

            <ModalDetail
              label="Category"
              value={
                submission.category ||
                "—"
              }
            />

            <ModalDetail
              label="Submitted"
              value={formatDate(
                getSubmissionDate(
                  submission
                )
              )}
            />

          </div>

          {/* KEYWORDS */}

          {keywords.length >
            0 && (
            <section className="mt-6">

              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] !text-[#8a8075] mb-2">
                Keywords
              </p>

              <div className="flex flex-wrap gap-1.5">

                {keywords.map(
                  (
                    keyword,
                    index
                  ) => (
                    <span
                      key={`${keyword}-${index}`}
                      className="rounded-full bg-[#eef3f7] px-2.5 py-1 text-[9px] !text-[#365a75]"
                    >
                      {keyword}
                    </span>
                  )
                )}

              </div>

            </section>
          )}

          {/* ABSTRACT */}

          <section className="mt-6">

            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] !text-[#8a8075] mb-2">
              Abstract
            </p>

            <div className="rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-4">

              <p className="whitespace-pre-wrap text-sm leading-6 !text-[#55504b]">
                {submission.abstract ||
                  "No abstract provided."}
              </p>

            </div>

          </section>

          {/* REMARKS */}

          {submission.remarks && (
            <section className="mt-6">

              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] !text-[#8a8075] mb-2">
                Remarks
              </p>

              <div className="rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-4">

                <p className="whitespace-pre-wrap text-sm leading-6 !text-[#55504b]">
                  {
                    submission.remarks
                  }
                </p>

              </div>

            </section>
          )}

          {/* PDF */}

          {submission.pdfUrl && (
            <section className="mt-6">

              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] !text-[#8a8075] mb-2">
                Manuscript
              </p>

              <a
                href={
                  submission.pdfUrl
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-[#244e70] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1b3a54] transition"
              >
                <FileText
                  size={14}
                />

                Open Manuscript

              </a>

            </section>
          )}

        </div>

        {/* FOOTER */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-[#eee7df] bg-[#fafafa] px-5 py-4">

          <button
            onClick={remove}
            disabled={updating}
            className="inline-flex items-center gap-1.5 text-xs font-medium !text-red-600 hover:!text-red-700 disabled:opacity-50"
          >
            <Trash2 size={13} />
            Delete Submission
          </button>

          <div className="flex flex-wrap gap-2">

            <button
              disabled={
                updating
              }
              onClick={() =>
                changeStatus(
                  "revision_requested"
                )
              }
              className="rounded-lg border border-[#dfd2ec] bg-white px-3 py-2 text-[10px] font-semibold !text-[#7252b8] hover:bg-[#f7f1fb]"
            >
              Request Revision
            </button>

            <button
              disabled={
                updating
              }
              onClick={() =>
                changeStatus(
                  "rejected"
                )
              }
              className="rounded-lg border border-red-200 bg-white px-3 py-2 text-[10px] font-semibold !text-red-600 hover:bg-red-50"
            >
              Reject
            </button>

            <button
              disabled={
                updating
              }
              onClick={() =>
                changeStatus(
                  "accepted"
                )
              }
              className="rounded-lg bg-[#244e70] px-4 py-2 text-[10px] font-semibold text-white hover:bg-[#1b3a54]"
            >
              {updating
                ? "Updating..."
                : "Accept"}
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

/*
 * ==============================================================
 * MODAL DETAIL
 * ==============================================================
 */

function ModalDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>

      <p className="text-[9px] uppercase tracking-[0.16em] font-semibold !text-[#8a8075]">
        {label}
      </p>

      <p className="mt-1 text-xs leading-5 !text-[#433a32] break-words">
        {value}
      </p>

    </div>
  );
}

/*
 * ==============================================================
 * DELETE MODAL
 * ==============================================================
 */

function DeleteModal({
  submission,
  deleting,
  cancel,
  confirm,
}: {
  submission: Submission;
  deleting: boolean;
  cancel: () => void;
  confirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4">

      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

        <div className="w-11 h-11 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mb-4">
          <Trash2 size={19} />
        </div>

        <h2 className="text-lg font-semibold !text-[#302923]">
          Delete submission?
        </h2>

        <p className="mt-2 text-sm leading-6 !text-[#777777]">

          This will permanently
          remove{" "}

          <span className="font-semibold !text-[#433a32]">
            {submission.title ||
              "this submission"}
          </span>

          . This action cannot
          be undone.

        </p>

        <div className="mt-6 flex justify-end gap-2">

          <button
            onClick={cancel}
            disabled={deleting}
            className="rounded-lg border border-[#ddd5cc] bg-white px-4 py-2.5 text-xs font-semibold !text-[#66594d] hover:bg-[#faf7f3]"
          >
            Cancel
          </button>

          <button
            onClick={confirm}
            disabled={deleting}
            className="rounded-lg bg-red-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {deleting
              ? "Deleting..."
              : "Delete"}
          </button>

        </div>

      </div>

    </div>
  );
}