"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ExternalLink,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  Search,
  Settings,
  ShieldAlert,
  Tag,
  User,
  UserCheck,
  Users,
  X,
  XCircle,
  ClipboardCheck,
  BookOpen,
} from "lucide-react";

import {
  onAuthStateChanged,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";

import {
  auth,
  firestore,
} from "@/lib/firebase";

/* ==============================================================
   TYPES
============================================================== */

type AssignedReviewer = {
  reviewerId: string;
  name: string;
  email: string;
  designation?: string;
  affiliation?: string;
  assignedAt?: string;
};

type Reviewer = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  affiliation?: string;
  designation?: string;
  country?: string;
  expertise?: string[];
  status?: string;
};

type ReviewerReview = {
  id: string;

  submissionId?: string;
  paperId?: string;

  reviewerId?: string;
  reviewerName?: string;
  reviewerEmail?: string;

  recommendation?: string;

  comments?: string;
  confidentialComments?: string;

  status?: string;

  submittedAt?: Timestamp | Date | string;
  updatedAt?: Timestamp | Date | string;
};

type EditorialDecision =
  | "accepted"
  | "minor_revision"
  | "major_revision"
  | "rejected";

type Submission = {
  title?: string;
  paperTitle?: string;

  paperId?: string;

  abstract?: string;

  authors?: unknown;
  author?: string;

  keywords?: string | string[];

  email?: string;

  status?: string;

  editorialDecision?: string;
  decisionAt?: Timestamp | Date | string;

  pdfUrl?: string;
  manuscriptUrl?: string;
  fileUrl?: string;

  assignedReviewers?: AssignedReviewer[];

  submittedAt?: Timestamp | Date | string;
  createdAt?: Timestamp | Date | string;

  reviewersAssignedAt?: Timestamp | Date | string;

  updatedAt?: Timestamp | Date | string;

  [key: string]: unknown;
};

type MenuItem = {
  label: string;
  icon: React.ElementType;
  section?: string;
};

/* ==============================================================
   SIDEBAR
============================================================== */

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
    label: "Pending Review",
    icon: Clock3,
  },

  {
    label: "Revision Required",
    icon: AlertCircle,
  },

  {
    label: "Accepted",
    icon: Check,
  },

  {
    label: "Reviewers",
    icon: Users,
    section: "Reviewers",
  },

  // {
  //   label: "Assignments",
  //   icon: ClipboardCheck,
  // },

  {
    label: "Editorial Board",
    icon: Users,
    section: "Editorial",
  },

  // {
  //   label: "Published Papers",
  //   icon: BookOpen,
  //   section: "Journal",
  // },

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

/* ==============================================================
   PAGE
============================================================== */

export default function SubmissionDetailsPage() {
  const router = useRouter();

  const params = useParams();

  const id =
    typeof params.id === "string"
      ? params.id
      : "";

  /* ============================================================
     AUTH
  ============================================================ */

  const [user, setUser] =
    useState<FirebaseUser | null>(null);

  const [authLoading, setAuthLoading] =
    useState(true);

  /* ============================================================
     SIDEBAR
  ============================================================ */

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [activeMenu, setActiveMenu] =
    useState("All Submissions");

  /* ============================================================
     SUBMISSION
  ============================================================ */

  const [submission, setSubmission] =
    useState<Submission | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* ============================================================
     REVIEWERS
  ============================================================ */

  const [reviewers, setReviewers] =
    useState<Reviewer[]>([]);

  const [
    showReviewerModal,
    setShowReviewerModal,
  ] = useState(false);

  const [
    selectedReviewerIds,
    setSelectedReviewerIds,
  ] = useState<string[]>([]);

  const [
    reviewerSearch,
    setReviewerSearch,
  ] = useState("");

  const [
    loadingReviewers,
    setLoadingReviewers,
  ] = useState(false);

  const [
    assigningReviewers,
    setAssigningReviewers,
  ] = useState(false);

  const [
    reviewerError,
    setReviewerError,
  ] = useState("");

  const [
    reviewerSuccess,
    setReviewerSuccess,
  ] = useState("");

  /* ============================================================
     REVIEWS
  ============================================================ */

  const [reviews, setReviews] =
    useState<ReviewerReview[]>([]);

  const [
    reviewsLoading,
    setReviewsLoading,
  ] = useState(true);

  const [
    reviewsError,
    setReviewsError,
  ] = useState("");

  /* ============================================================
     EDITORIAL DECISION
  ============================================================ */

  const [
    decisionLoading,
    setDecisionLoading,
  ] = useState(false);

  const [
    decisionError,
    setDecisionError,
  ] = useState("");

  const [
    decisionSuccess,
    setDecisionSuccess,
  ] = useState("");

  /* ============================================================
     AUTH CHECK
  ============================================================ */

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (currentUser) => {
          if (!currentUser) {
            router.replace("/login");
            return;
          }

          setUser(currentUser);
          setAuthLoading(false);
        }
      );

    return () =>
      unsubscribe();
  }, [router]);

  /* ============================================================
     LOAD SUBMISSION
  ============================================================ */

  const loadSubmission =
    async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError("");

        const reference =
          doc(
            firestore,
            "submissions",
            id
          );

        const snapshot =
          await getDoc(reference);

        if (!snapshot.exists()) {
          setError(
            "This submission could not be found."
          );

          return;
        }

        setSubmission(
          snapshot.data() as Submission
        );
      } catch (err) {
        console.error(
          "SUBMISSION DETAILS:",
          err
        );

        setError(
          "Unable to load this submission."
        );
      } finally {
        setLoading(false);
      }
    };

  /* ============================================================
     LOAD REVIEWS
  ============================================================ */

  const loadReviews =
    async () => {
      if (!id) return;

      try {
        setReviewsLoading(true);
        setReviewsError("");

        const reviewsQuery =
          query(
            collection(
              firestore,
              "reviews"
            ),
            where(
              "submissionId",
              "==",
              id
            )
          );

        const snapshot =
          await getDocs(
            reviewsQuery
          );

        const data: ReviewerReview[] =
          snapshot.docs.map(
            (reviewDoc) =>
              ({
                id: reviewDoc.id,
                ...reviewDoc.data(),
              }) as ReviewerReview
          );

        data.sort(
          (a, b) =>
            getTimestampMillis(
              b.submittedAt
            ) -
            getTimestampMillis(
              a.submittedAt
            )
        );

        setReviews(data);
      } catch (err) {
        console.error(
          "REVIEWS LOAD ERROR:",
          err
        );

        setReviewsError(
          "Unable to load reviewer reviews."
        );

        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };

  /* ============================================================
     INITIAL LOAD
  ============================================================ */

  useEffect(() => {
    if (
      !id ||
      authLoading
    ) {
      return;
    }

    loadSubmission();
    loadReviews();
  }, [
    id,
    authLoading,
  ]);

  /* ============================================================
     LOAD ACTIVE REVIEWERS
  ============================================================ */

  const loadReviewers =
    async () => {
      try {
        setLoadingReviewers(true);
        setReviewerError("");

        const snapshot =
          await getDocs(
            collection(
              firestore,
              "reviewer"
            )
          );

        const data: Reviewer[] =
          snapshot.docs
            .map((item) => {
              const d =
                item.data();

              return {
                id: item.id,

                name:
                  d.name || "",

                email:
                  d.email || "",

                phone:
                  d.phone || "",

                designation:
                  d.designation || "",

                affiliation:
                  d.affiliation || "",

                country:
                  d.country || "",

                expertise:
                  Array.isArray(
                    d.expertise
                  )
                    ? d.expertise
                    : [],

                status:
                  d.status || "active",
              };
            })
            .filter(
              (reviewer) =>
                reviewer.status ===
                "active"
            );

        data.sort(
          (a, b) =>
            a.name.localeCompare(
              b.name
            )
        );

        setReviewers(data);
      } catch (err) {
        console.error(
          "REVIEWERS LOAD ERROR:",
          err
        );

        setReviewerError(
          "Unable to load active reviewers. Please check Firestore permissions."
        );
      } finally {
        setLoadingReviewers(false);
      }
    };

  /* ============================================================
     OPEN REVIEWER MODAL
  ============================================================ */

  const openReviewerModal =
    async () => {
      if (!submission) return;

      setReviewerSuccess("");
      setReviewerError("");
      setReviewerSearch("");

      const existingReviewers =
        Array.isArray(
          submission.assignedReviewers
        )
          ? submission.assignedReviewers
          : [];

      setSelectedReviewerIds(
        existingReviewers.map(
          (reviewer) =>
            reviewer.reviewerId
        )
      );

      setShowReviewerModal(true);

      await loadReviewers();
    };

  /* ============================================================
     CLOSE REVIEWER MODAL
  ============================================================ */

  const closeReviewerModal =
    () => {
      if (assigningReviewers) {
        return;
      }

      setShowReviewerModal(false);
      setReviewerSearch("");
      setReviewerError("");
    };

  /* ============================================================
     TOGGLE REVIEWER
  ============================================================ */

  const toggleReviewer = (
    reviewerId: string
  ) => {
    setSelectedReviewerIds(
      (current) => {
        if (
          current.includes(
            reviewerId
          )
        ) {
          return current.filter(
            (id) =>
              id !== reviewerId
          );
        }

        return [
          ...current,
          reviewerId,
        ];
      }
    );
  };

  /* ============================================================
     ASSIGN REVIEWERS
  ============================================================ */

  const assignReviewers =
    async () => {
      if (!submission || !id) {
        return;
      }

      if (
        selectedReviewerIds.length ===
        0
      ) {
        setReviewerError(
          "Please select at least one reviewer."
        );

        return;
      }

      try {
        setAssigningReviewers(true);
        setReviewerError("");
        setReviewerSuccess("");

        const selectedReviewers =
          reviewers.filter(
            (reviewer) =>
              selectedReviewerIds.includes(
                reviewer.id
              )
          );

        if (
          selectedReviewers.length ===
          0
        ) {
          setReviewerError(
            "No valid active reviewers were selected."
          );

          return;
        }

        const assignedReviewers: AssignedReviewer[] =
          selectedReviewers.map(
            (reviewer) => ({
              reviewerId:
                reviewer.id,

              name:
                reviewer.name,

              email:
                reviewer.email,

              designation:
                reviewer.designation ||
                "",

              affiliation:
                reviewer.affiliation ||
                "",

              assignedAt:
                new Date().toISOString(),
            })
          );

        await updateDoc(
          doc(
            firestore,
            "submissions",
            id
          ),
          {
            assignedReviewers,

            status:
              "under_review",

            reviewersAssignedAt:
              serverTimestamp(),

            updatedAt:
              serverTimestamp(),
          }
        );

        setSubmission(
          (current) =>
            current
              ? {
                  ...current,

                  assignedReviewers,

                  status:
                    "under_review",
                }
              : current
        );

        setReviewerSuccess(
          `${assignedReviewers.length} reviewer${
            assignedReviewers.length !==
            1
              ? "s"
              : ""
          } connected successfully.`
        );

        setShowReviewerModal(false);
      } catch (err) {
        console.error(
          "REVIEWER ASSIGNMENT ERROR:",
          err
        );

        setReviewerError(
          "Unable to assign reviewers. Please try again."
        );
      } finally {
        setAssigningReviewers(false);
      }
    };

  /* ============================================================
     EDITORIAL DECISION
  ============================================================ */

  const makeEditorialDecision =
    async (
      decision: EditorialDecision
    ) => {
      if (!submission || !id) {
        return;
      }

      if (reviews.length === 0) {
        setDecisionError(
          "Editorial decision is available only after reviewer feedback is received."
        );

        return;
      }

      const labels: Record<
        EditorialDecision,
        string
      > = {
        accepted:
          "Accept",

        minor_revision:
          "Minor Revision",

        major_revision:
          "Major Revision",

        rejected:
          "Reject",
      };

      const label =
        labels[decision];

      const confirmed =
        window.confirm(
          `Are you sure you want to ${label.toLowerCase()} this manuscript?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setDecisionLoading(true);
        setDecisionError("");
        setDecisionSuccess("");

        let status:
          | "accepted"
          | "revision_required"
          | "rejected";

        if (
          decision ===
          "accepted"
        ) {
          status = "accepted";
        } else if (
          decision ===
            "minor_revision" ||
          decision ===
            "major_revision"
        ) {
          status =
            "revision_required";
        } else {
          status = "rejected";
        }

        await updateDoc(
          doc(
            firestore,
            "submissions",
            id
          ),
          {
            status,

            editorialDecision:
              decision,

            decisionAt:
              serverTimestamp(),

            updatedAt:
              serverTimestamp(),
          }
        );

        setSubmission(
          (current) =>
            current
              ? {
                  ...current,

                  status,

                  editorialDecision:
                    decision,
                }
              : current
        );

        setDecisionSuccess(
          `Manuscript ${label.toLowerCase()} successfully.`
        );
      } catch (err) {
        console.error(
          "EDITORIAL DECISION ERROR:",
          err
        );

        setDecisionError(
          "Unable to save the editorial decision. Please try again."
        );
      } finally {
        setDecisionLoading(false);
      }
    };

  /* ============================================================
     FILTERED REVIEWERS
  ============================================================ */

  const filteredReviewers =
    useMemo(() => {
      const search =
        reviewerSearch
          .trim()
          .toLowerCase();

      if (!search) {
        return reviewers;
      }

      return reviewers.filter(
        (reviewer) =>
          [
            reviewer.name,
            reviewer.email,
            reviewer.designation,
            reviewer.affiliation,
            reviewer.country,
            ...(reviewer.expertise ||
              []),
          ]
            .join(" ")
            .toLowerCase()
            .includes(search)
      );
    }, [
      reviewers,
      reviewerSearch,
    ]);

  /* ============================================================
     LOGOUT
  ============================================================ */

  const handleLogout =
    async () => {
      try {
        await signOut(auth);

        router.replace(
          "/login"
        );
      } catch (err) {
        console.error(
          "ADMIN LOGOUT:",
          err
        );

        router.replace(
          "/login"
        );
      }
    };

  /* ============================================================
     NAVIGATION
  ============================================================ */

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

  /* ============================================================
     LOADING
  ============================================================ */

  if (
    authLoading ||
    loading
  ) {
    return (
      <main className="min-h-[100dvh] bg-[#f7f7f7] flex items-center justify-center">

        <div className="text-center">

          <div className="w-11 h-11 rounded-xl bg-[#244e70] text-white flex items-center justify-center mx-auto animate-pulse">
            <FileText size={20} />
          </div>

          <p className="!text-[#777777] text-xs mt-4">
            Loading submission...
          </p>

        </div>

      </main>
    );
  }

  /* ============================================================
     ERROR
  ============================================================ */

  if (
    error ||
    !submission
  ) {
    return (
      <main className="min-h-[100dvh] bg-[#f7f7f7] flex items-center justify-center p-6">

        <div className="w-full max-w-md bg-white border border-[#e5e5e5] rounded-2xl p-7 text-center shadow-xl">

          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mx-auto">
            <AlertCircle size={22} />
          </div>

          <h1 className="!text-[#111111] text-xl font-semibold mt-5">
            Submission unavailable
          </h1>

          <p className="!text-[#777777] text-sm mt-2 leading-6">
            {error ||
              "This submission could not be loaded."}
          </p>

          <button
            onClick={() =>
              router.push(
                "/admin/submissions"
              )
            }
            className="mt-6 h-10 px-5 rounded-xl bg-[#244e70] text-white text-xs font-semibold hover:bg-[#1b3a54] transition"
          >
            Back to submissions
          </button>

        </div>

      </main>
    );
  }

  /* ============================================================
     DERIVED DATA
  ============================================================ */

  const title =
    submission.title ||
    submission.paperTitle ||
    "Untitled submission";

  const pdfUrl =
    submission.pdfUrl ||
    submission.manuscriptUrl ||
    submission.fileUrl;

  const assignedReviewers =
    Array.isArray(
      submission.assignedReviewers
    )
      ? submission.assignedReviewers
      : [];

  const hasReviews =
    reviews.length > 0;

  const decisionAlreadyMade =
    submission.status ===
      "accepted" ||
    submission.status ===
      "rejected" ||
    submission.status ===
      "revision_required";

  /* ============================================================
     MAIN UI
  ============================================================ */

  return (
    <main className="min-h-[100dvh] bg-[#f7f7f7]">

      {/* ========================================================
          MOBILE HEADER
      ======================================================== */}

      <header className="lg:hidden h-16 bg-white border-b border-[#e5e5e5] flex items-center justify-between px-4 sticky top-0 z-40">

        <div className="flex items-center gap-3">

          <div className="w-9 h-9 rounded-lg bg-[#244e70] text-white flex items-center justify-center font-bold">
            J
          </div>

          <span className="!text-[#332c26] text-sm font-semibold">
            JFER Admin
          </span>

        </div>

        <button
          onClick={() =>
            setSidebarOpen(true)
          }
          className="w-9 h-9 rounded-lg flex items-center justify-center !text-[#555555] hover:bg-[#f7f7f7]"
        >
          <Menu size={20} />
        </button>

      </header>

      {/* ========================================================
          MOBILE OVERLAY
      ======================================================== */}

      {sidebarOpen && (
        <button
          aria-label="Close navigation"
          onClick={() =>
            setSidebarOpen(false)
          }
          className="lg:hidden fixed inset-0 z-40 bg-black/30"
        />
      )}

      {/* ========================================================
          SIDEBAR
      ======================================================== */}

      <aside
        className={`
          fixed
          left-0
          top-0
          bottom-0
          z-50
          bg-[#2f2923]
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

        {/* SIDEBAR TOP */}

        <div className="h-[77px] border-b border-white/10 px-4 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="w-8 h-8 flex items-center justify-center text-white text-xl font-bold">
              J
            </div>

            {!sidebarCollapsed && (
              <div>

                <p className="!text-white text-sm font-bold">
                  JFER
                </p>

                <p className="!text-white/45 text-[9px]">
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
            <X size={18} />
          </button>

        </div>

        {/* NAV */}

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
                      transition

                      ${
                        activeMenu ===
                        item.label
                          ? "bg-[#244e70] text-white"
                          : "text-white/60 hover:text-white hover:bg-white/5"
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
              hover:text-red-300
              hover:bg-red-500/10
              transition
            `}
          >

            <LogOut
              size={15}
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
          MAIN CONTENT
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
        ====================================================== */}

        <header className="hidden lg:flex h-[77px] bg-white border-b border-[#e5e5e5] items-center justify-between px-7 sticky top-0 z-30">

          <div className="flex items-center gap-3">

            <button
              onClick={() =>
                setSidebarCollapsed(
                  (prev) =>
                    !prev
                )
              }
              className="w-8 h-8 rounded-lg flex items-center justify-center !text-[#666666] hover:bg-[#f7f7f7]"
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

              <h2 className="!text-[#111111] text-[24px] leading-7 font-medium">
                Submission Details
              </h2>

              <p className="!text-[#888888] text-[10px] mt-0.5">
                Editorial Management
              </p>

            </div>

          </div>

          <div className="flex items-center gap-3">

            <div className="text-right">

              <p className="!text-[#111111] text-xs font-semibold">
                Administrator
              </p>

              <p className="!text-[#888888] text-[10px]">
                {user?.email}
              </p>

            </div>

            <div className="w-9 h-9 rounded-full bg-[#dce8ef] text-[#244e70] flex items-center justify-center text-sm font-bold">
              A
            </div>

          </div>

        </header>

        {/* ======================================================
            CONTENT
        ====================================================== */}

        <div className="max-w-[1200px] mx-auto px-5 sm:px-7 py-6">

          {/* ====================================================
              BACK
          ==================================================== */}

          <button
            onClick={() =>
              router.push(
                "/admin/submissions"
              )
            }
            className="flex items-center gap-2 !text-[#777777] text-xs font-medium hover:!text-[#244e70] transition mb-5"
          >

            <ArrowLeft size={15} />

            Back to submissions

          </button>

          {/* ====================================================
              ALERTS
          ==================================================== */}

          {reviewerSuccess && (
            <AlertBox
              type="success"
              message={
                reviewerSuccess
              }
              onClose={() =>
                setReviewerSuccess("")
              }
            />
          )}

          {decisionSuccess && (
            <AlertBox
              type="success"
              message={
                decisionSuccess
              }
              onClose={() =>
                setDecisionSuccess("")
              }
            />
          )}

          {decisionError && (
            <AlertBox
              type="error"
              message={
                decisionError
              }
              onClose={() =>
                setDecisionError("")
              }
            />
          )}

          {/* ====================================================
              TITLE CARD
          ==================================================== */}

          <section className="bg-white border border-[#e5e5e5] rounded-2xl p-5 md:p-6">

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">

              <div className="min-w-0">

                <div className="flex items-center gap-2.5 mb-3">

                  <div className="w-9 h-9 rounded-lg bg-[#eef3f7] !text-[#244e70] flex items-center justify-center shrink-0">
                    <FileText
                      size={17}
                    />
                  </div>

                  <span className="font-mono !text-[#999999] text-[10px] truncate">
                    {submission.paperId ||
                      id}
                  </span>

                </div>

                <h2 className="!text-[#111111] text-[24px] md:text-[28px] font-medium leading-tight">
                  {title}
                </h2>

                <div className="flex flex-wrap items-center gap-3 mt-4">

                  <div className="flex items-center gap-1.5 !text-[#777777] text-xs">
                    <CalendarDays
                      size={14}
                    />

                    {formatDate(
                      submission.submittedAt ||
                        submission.createdAt
                    )}
                  </div>

                  <StatusBadge
                    status={
                      submission.status
                    }
                  />

                </div>

              </div>

              {pdfUrl && (
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg bg-[#244e70] text-white text-xs font-semibold hover:bg-[#1b3a54] transition shrink-0"
                >

                  <ExternalLink
                    size={14}
                  />

                  View Manuscript

                </a>
              )}

            </div>

          </section>

          {/* ====================================================
              MAIN GRID
          ==================================================== */}

          <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-5 mt-5">

            {/* ==================================================
                LEFT COLUMN
            ================================================== */}

            <div className="space-y-5">

              {/* ABSTRACT */}

              <section className="bg-white border border-[#e5e5e5] rounded-xl p-5">

                <SectionTitle
                  icon={
                    FileText
                  }
                  title="Abstract"
                />

                <div className="mt-4">

                  {submission.abstract ? (
                    <p className="!text-[#555555] text-sm leading-7 whitespace-pre-wrap">
                      {
                        submission.abstract
                      }
                    </p>
                  ) : (
                    <p className="!text-[#999999] text-sm">
                      No abstract provided.
                    </p>
                  )}

                </div>

              </section>

              {/* AUTHORS */}

              <section className="bg-white border border-[#e5e5e5] rounded-2xl p-5">

                <SectionTitle
                  icon={User}
                  title="Authors"
                />

                <div className="mt-4">

                  {submission.authors ? (
                    <AuthorList
                      authors={
                        submission.authors
                      }
                    />
                  ) : submission.author ? (
                    <p className="!text-[#555555] text-sm">
                      {
                        submission.author
                      }
                    </p>
                  ) : (
                    <p className="!text-[#999999] text-sm">
                      No author information available.
                    </p>
                  )}

                </div>

              </section>

              {/* KEYWORDS */}

              <section className="bg-white border border-[#e5e5e5] rounded-2xl p-5">

                <SectionTitle
                  icon={Tag}
                  title="Keywords"
                />

                <div className="flex flex-wrap gap-1.5 mt-4">

                  {getKeywords(
                    submission.keywords
                  ).length >
                  0 ? (
                    getKeywords(
                      submission.keywords
                    ).map(
                      (
                        keyword,
                        index
                      ) => (
                        <span
                          key={`${keyword}-${index}`}
                          className="px-2.5 py-1 rounded-full bg-[#eef3f7] !text-[#365a75] text-[10px] font-medium"
                        >
                          {
                            keyword
                          }
                        </span>
                      )
                    )
                  ) : (
                    <p className="!text-[#999999] text-sm">
                      No keywords provided.
                    </p>
                  )}

                </div>

              </section>

              {/* REVIEWER REVIEWS */}

              <section className="bg-white border border-[#e5e5e5] rounded-2xl p-5">

                <div className="flex items-center justify-between gap-3">

                  <SectionTitle
                    icon={
                      MessageSquareText
                    }
                    title="Reviewer Reviews"
                  />

                  <span className="px-2.5 py-1 rounded-full bg-[#eef3f7] !text-[#365a75] text-[10px] font-semibold">
                    {reviews.length}{" "}
                    {reviews.length ===
                    1
                      ? "Review"
                      : "Reviews"}
                  </span>

                </div>

                {reviewsError && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5">

                    <p className="!text-red-700 text-xs">
                      {
                        reviewsError
                      }
                    </p>

                  </div>
                )}

                {reviewsLoading ? (
                  <div className="py-10 text-center">

                    <RefreshCw
                      size={20}
                      className="mx-auto animate-spin !text-[#244e70]"
                    />

                    <p className="!text-[#777777] text-xs mt-3">
                      Loading reviewer reviews...
                    </p>

                  </div>
                ) : reviews.length ===
                  0 ? (
                  <div className="mt-4 rounded-xl border border-[#e8e8e8] bg-[#fafafa] p-7 text-center">

                    <Clock3
                      size={20}
                      className="mx-auto !text-[#aaa]"
                    />

                    <p className="!text-[#555555] text-sm font-semibold mt-3">
                      No reviewer feedback yet
                    </p>

                    <p className="!text-[#999999] text-xs mt-1.5">
                      Editorial decision controls will become available after reviewer feedback is received.
                    </p>

                  </div>
                ) : (
                  <div className="mt-4 space-y-4">

                    {reviews.map(
                      (
                        review,
                        index
                      ) => (
                        <ReviewCard
                          key={
                            review.id
                          }
                          review={
                            review
                          }
                          index={
                            index
                          }
                        />
                      )
                    )}

                  </div>
                )}

              </section>

            </div>

            {/* ==================================================
                RIGHT COLUMN
            ================================================== */}

            <aside className="space-y-5">

              {/* STATUS */}

              <section className="bg-white border border-[#e5e5e5] rounded-2xl p-5">

                <h3 className="!text-[#111111] text-sm font-semibold">
                  Editorial Status
                </h3>

                <div className="mt-3">

                  <StatusBadge
                    status={
                      submission.status
                    }
                  />

                </div>

                {submission.editorialDecision && (
                  <div className="mt-4 pt-4 border-t border-[#eeeeee]">

                    <p className="!text-[#999999] text-[9px] uppercase tracking-[0.15em] font-semibold">
                      Decision
                    </p>

                    <p className="!text-[#444444] text-xs font-semibold mt-1">
                      {formatRecommendation(
                        submission.editorialDecision
                      )}
                    </p>

                  </div>
                )}

              </section>

              {/* REVIEWER ASSIGNMENT */}

              <section className="bg-white border border-[#e5e5e5] rounded-2xl p-5">

                <div className="flex items-center justify-between">

                  <h3 className="!text-[#111111] text-sm font-semibold">
                    Reviewer Assignment
                  </h3>

                  <span className="px-2 py-1 rounded-full bg-[#eef3f7] !text-[#365a75] text-[10px] font-semibold">
                    {
                      assignedReviewers.length
                    }
                  </span>

                </div>

                <p className="!text-[#888888] text-xs leading-5 mt-2">
                  Assign active reviewers to evaluate this manuscript.
                </p>

                {assignedReviewers.length >
                0 ? (
                  <div className="mt-4 space-y-2.5">

                    {assignedReviewers.map(
                      (
                        reviewer
                      ) => (
                        <div
                          key={
                            reviewer.reviewerId
                          }
                          className="rounded-xl bg-[#fafafa] border border-[#e9e9e9] p-3"
                        >

                          <div className="flex items-start gap-2.5">

                            <div className="w-8 h-8 rounded-lg bg-[#eaf0f4] !text-[#244e70] flex items-center justify-center shrink-0">
                              <UserCheck
                                size={14}
                              />
                            </div>

                            <div className="min-w-0">

                              <p className="!text-[#333333] text-xs font-semibold truncate">
                                {
                                  reviewer.name
                                }
                              </p>

                              <p className="!text-[#888888] text-[10px] mt-1 truncate">
                                {
                                  reviewer.email
                                }
                              </p>

                              {reviewer.designation && (
                                <p className="!text-[#777777] text-[10px] mt-1">
                                  {
                                    reviewer.designation
                                  }
                                </p>
                              )}

                            </div>

                          </div>

                        </div>
                      )
                    )}

                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-dashed border-[#dddddd] bg-[#fafafa] p-5 text-center">

                    <Users
                      size={20}
                      className="mx-auto !text-[#aaa]"
                    />

                    <p className="!text-[#888888] text-xs mt-2">
                      No reviewers assigned.
                    </p>

                  </div>
                )}

                <button
                  onClick={
                    openReviewerModal
                  }
                  className="w-full mt-4 h-9 rounded-lg bg-[#244e70] text-white text-xs font-semibold hover:bg-[#1b3a54] transition flex items-center justify-center gap-2"
                >

                  <Users
                    size={14}
                  />

                  {assignedReviewers.length >
                  0
                    ? "Change Reviewers"
                    : "Connect Reviewer"}

                </button>

              </section>

              {/* EDITORIAL DECISION */}

              <section className="bg-white border border-[#e5e5e5] rounded-2xl p-5">

                <div className="flex items-start justify-between gap-3">

                  <div>

                    <h3 className="!text-[#111111] text-sm font-semibold">
                      Editorial Decision
                    </h3>

                    <p className="!text-[#888888] text-xs leading-5 mt-1.5">
                      Final decision based on reviewer feedback.
                    </p>

                  </div>

                  <div
                    className={`
                      w-8
                      h-8
                      rounded-lg
                      flex
                      items-center
                      justify-center

                      ${
                        hasReviews
                          ? "bg-green-50 !text-green-600"
                          : "bg-[#f4f4f4] !text-[#999999]"
                      }
                    `}
                  >

                    {hasReviews ? (
                      <CheckCircle2
                        size={15}
                      />
                    ) : (
                      <Clock3
                        size={15}
                      />
                    )}

                  </div>

                </div>

                <div
                  className={`
                    mt-4
                    rounded-xl
                    border
                    p-3

                    ${
                      hasReviews
                        ? "border-green-200 bg-green-50"
                        : "border-[#e8e8e8] bg-[#fafafa]"
                    }
                  `}
                >

                  <div className="flex items-center gap-2.5">

                    {hasReviews ? (
                      <CheckCircle2
                        size={15}
                        className="text-green-600 shrink-0"
                      />
                    ) : (
                      <Clock3
                        size={15}
                        className="!text-[#999999] shrink-0"
                      />
                    )}

                    <div>

                      <p
                        className={`
                          text-xs
                          font-semibold

                          ${
                            hasReviews
                              ? "!text-green-700"
                              : "!text-[#555555]"
                          }
                        `}
                      >
                        {hasReviews
                          ? "Feedback received"
                          : "Waiting for feedback"}
                      </p>

                      <p
                        className={`
                          text-[10px]
                          mt-0.5

                          ${
                            hasReviews
                              ? "!text-green-600"
                              : "!text-[#999999]"
                          }
                        `}
                      >
                        {hasReviews
                          ? `${reviews.length} reviewer ${
                              reviews.length ===
                              1
                                ? "has"
                                : "have"
                            } submitted feedback.`
                          : "Decision controls are disabled."}
                      </p>

                    </div>

                  </div>

                </div>

                <div className="grid gap-2 mt-4">

                  <button
                    type="button"
                    disabled={
                      !hasReviews ||
                      decisionLoading
                    }
                    onClick={() =>
                      makeEditorialDecision(
                        "accepted"
                      )
                    }
                    className="h-9 rounded-lg bg-[#5f7958] text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#50684b] disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >

                    <Check
                      size={14}
                    />

                    Accept Manuscript

                  </button>

                  <button
                    type="button"
                    disabled={
                      !hasReviews ||
                      decisionLoading
                    }
                    onClick={() =>
                      makeEditorialDecision(
                        "minor_revision"
                      )
                    }
                    className="h-9 rounded-lg border border-amber-200 bg-amber-50 !text-amber-700 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-amber-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >

                    <RefreshCw
                      size={14}
                    />

                    Minor Revision

                  </button>

                  <button
                    type="button"
                    disabled={
                      !hasReviews ||
                      decisionLoading
                    }
                    onClick={() =>
                      makeEditorialDecision(
                        "major_revision"
                      )
                    }
                    className="h-9 rounded-lg border border-orange-200 bg-orange-50 !text-orange-700 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-orange-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >

                    <RefreshCw
                      size={14}
                    />

                    Major Revision

                  </button>

                  <button
                    type="button"
                    disabled={
                      !hasReviews ||
                      decisionLoading
                    }
                    onClick={() =>
                      makeEditorialDecision(
                        "rejected"
                      )
                    }
                    className="h-9 rounded-lg bg-[#a35d57] text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#914f49] disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >

                    <XCircle
                      size={14}
                    />

                    Reject Manuscript

                  </button>

                </div>

                {decisionAlreadyMade && (
                  <div className="mt-3 rounded-lg border border-[#eadbc7] bg-[#fffaf3] p-3">

                    <p className="!text-[#765a3d] text-[10px] leading-5">
                      A final editorial decision has already been recorded for this manuscript.
                    </p>

                  </div>
                )}

              </section>

              {/* REVIEW SUMMARY */}

              <section className="bg-white border border-[#e5e5e5] rounded-2xl p-5">

                <div className="flex items-center gap-2.5">

                  <div className="w-8 h-8 rounded-lg bg-[#eef3f7] !text-[#244e70] flex items-center justify-center">
                    <MessageSquareText
                      size={14}
                    />
                  </div>

                  <div>

                    <h3 className="!text-[#111111] text-sm font-semibold">
                      Review Summary
                    </h3>

                    <p className="!text-[#999999] text-[10px] mt-0.5">
                      Reviewer activity
                    </p>

                  </div>

                </div>

                <div className="grid grid-cols-2 gap-2.5 mt-4">

                  <div className="rounded-xl bg-[#fafafa] border border-[#e9e9e9] p-3">

                    <p className="!text-[#999999] text-[10px]">
                      Assigned
                    </p>

                    <p className="!text-[#222222] text-xl font-semibold mt-1">
                      {
                        assignedReviewers.length
                      }
                    </p>

                  </div>

                  <div className="rounded-xl bg-[#fafafa] border border-[#e9e9e9] p-3">

                    <p className="!text-[#999999] text-[10px]">
                      Submitted
                    </p>

                    <p className="!text-[#222222] text-xl font-semibold mt-1">
                      {
                        reviews.length
                      }
                    </p>

                  </div>

                </div>

                <div className="mt-4">

                  <div className="flex justify-between mb-1.5">

                    <span className="!text-[#888888] text-[10px]">
                      Review progress
                    </span>

                    <span className="!text-[#244e70] text-[10px] font-semibold">
                      {assignedReviewers.length >
                      0
                        ? `${Math.min(
                            100,
                            Math.round(
                              (reviews.length /
                                assignedReviewers.length) *
                                100
                            )
                          )}%`
                        : "0%"}
                    </span>

                  </div>

                  <div className="h-1.5 rounded-full bg-[#e9e9e9] overflow-hidden">

                    <div
                      className="h-full rounded-full bg-[#244e70] transition-all"
                      style={{
                        width:
                          assignedReviewers.length >
                          0
                            ? `${Math.min(
                                100,
                                (reviews.length /
                                  assignedReviewers.length) *
                                  100
                              )}%`
                            : "0%",
                      }}
                    />

                  </div>

                </div>

              </section>

            </aside>

          </div>

        </div>

      </div>

      {/* ========================================================
          REVIEWER MODAL
      ======================================================== */}

      {showReviewerModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">

          <button
            type="button"
            aria-label="Close reviewer modal"
            onClick={
              closeReviewerModal
            }
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl border border-[#e5e5e5]">

            {/* HEADER */}

            <div className="px-5 py-4 border-b border-[#e5e5e5] flex items-center justify-between">

              <div>

                <p className="!text-[#244e70] text-[9px] uppercase tracking-[0.2em] font-semibold">
                  Peer Review
                </p>

                <h2 className="!text-[#111111] text-lg font-semibold mt-1">
                  Connect Reviewers
                </h2>

                <p className="!text-[#888888] text-xs mt-1">
                  Select one or more active reviewers.
                </p>

              </div>

              <button
                onClick={
                  closeReviewerModal
                }
                disabled={
                  assigningReviewers
                }
                className="w-8 h-8 rounded-lg bg-[#f7f7f7] !text-[#666666] flex items-center justify-center hover:bg-[#eeeeee] disabled:opacity-50"
              >
                <X size={16} />
              </button>

            </div>

            {/* SEARCH */}

            <div className="px-5 pt-4">

              <div className="relative">

                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 !text-[#aaa]"
                />

                <input
                  type="text"
                  value={
                    reviewerSearch
                  }
                  onChange={(event) =>
                    setReviewerSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search reviewers..."
                  className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#dddddd] bg-[#fafafa] !text-[#333333] placeholder:!text-[#aaa] text-xs outline-none focus:border-[#244e70] focus:ring-2 focus:ring-[#244e70]/10"
                />

              </div>

            </div>

            {/* ERROR */}

            {reviewerError && (
              <div className="mx-5 mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 flex items-start gap-2">

                <AlertCircle
                  size={14}
                  className="text-red-500 mt-0.5"
                />

                <p className="!text-red-700 text-xs">
                  {
                    reviewerError
                  }
                </p>

              </div>
            )}

            {/* LIST */}

            <div className="p-5 max-h-[52vh] overflow-y-auto">

              {loadingReviewers ? (
                <div className="py-10 text-center">

                  <RefreshCw
                    size={21}
                    className="mx-auto animate-spin !text-[#244e70]"
                  />

                  <p className="!text-[#777777] text-xs mt-3">
                    Loading active reviewers...
                  </p>

                </div>
              ) : filteredReviewers.length ===
                0 ? (
                <div className="py-10 text-center">

                  <Users
                    size={22}
                    className="mx-auto !text-[#aaa]"
                  />

                  <p className="!text-[#777777] text-xs mt-3">
                    {reviewerSearch
                      ? "No reviewers match your search."
                      : "No active reviewers are available."}
                  </p>

                </div>
              ) : (
                filteredReviewers.map(
                  (reviewer) => {

                    const selected =
                      selectedReviewerIds.includes(
                        reviewer.id
                      );

                    return (
                      <button
                        type="button"
                        key={
                          reviewer.id
                        }
                        onClick={() =>
                          toggleReviewer(
                            reviewer.id
                          )
                        }
                        className={`
                          w-full
                          text-left
                          rounded-xl
                          border
                          p-3.5
                          mb-2
                          transition

                          ${
                            selected
                              ? "border-[#244e70] bg-[#f1f5f8]"
                              : "border-[#e5e5e5] bg-white hover:bg-[#fafafa]"
                          }
                        `}
                      >

                        <div className="flex items-center gap-3">

                          <div className="w-9 h-9 rounded-lg bg-[#eef3f7] !text-[#244e70] flex items-center justify-center shrink-0">
                            <User
                              size={15}
                            />
                          </div>

                          <div className="flex-1 min-w-0">

                            <div className="flex items-center justify-between gap-3">

                              <p className="!text-[#333333] text-xs font-semibold truncate">
                                {
                                  reviewer.name
                                }
                              </p>

                              <div
                                className={`
                                  w-5
                                  h-5
                                  rounded-md
                                  border
                                  flex
                                  items-center
                                  justify-center
                                  shrink-0

                                  ${
                                    selected
                                      ? "bg-[#244e70] border-[#244e70] text-white"
                                      : "bg-white border-[#d7d7d7] !text-transparent"
                                  }
                                `}
                              >
                                <Check
                                  size={12}
                                />
                              </div>

                            </div>

                            <p className="!text-[#888888] text-[10px] mt-1 truncate">
                              {
                                reviewer.email
                              }
                            </p>

                            {reviewer.designation && (
                              <p className="!text-[#777777] text-[10px] mt-1">
                                {
                                  reviewer.designation
                                }
                              </p>
                            )}

                            {reviewer.expertise &&
                              reviewer.expertise
                                .length >
                                0 && (
                                <div className="flex flex-wrap gap-1 mt-2">

                                  {reviewer.expertise
                                    .slice(
                                      0,
                                      5
                                    )
                                    .map(
                                      (
                                        expertise,
                                        index
                                      ) => (
                                        <span
                                          key={`${expertise}-${index}`}
                                          className="px-1.5 py-0.5 rounded-full bg-[#f1f1f1] !text-[#666666] text-[9px]"
                                        >
                                          {
                                            expertise
                                          }
                                        </span>
                                      )
                                    )}

                                </div>
                              )}

                          </div>

                        </div>

                      </button>
                    );
                  }
                )
              )}

            </div>

            {/* FOOTER */}

            <div className="px-5 py-4 border-t border-[#e5e5e5] bg-[#fafafa]">

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                <p className="!text-[#777777] text-xs">

                  <span className="font-semibold !text-[#333333]">
                    {
                      selectedReviewerIds.length
                    }
                  </span>{" "}
                  reviewer
                  {
                    selectedReviewerIds.length !==
                    1
                      ? "s"
                      : ""
                  }{" "}
                  selected

                </p>

                <div className="flex gap-2">

                  <button
                    type="button"
                    onClick={
                      closeReviewerModal
                    }
                    disabled={
                      assigningReviewers
                    }
                    className="h-9 px-4 rounded-lg border border-[#dddddd] bg-white !text-[#666666] text-xs font-semibold hover:bg-[#f5f5f5] transition disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={
                      assigningReviewers ||
                      selectedReviewerIds.length ===
                        0
                    }
                    onClick={
                      assignReviewers
                    }
                    className="h-9 px-4 rounded-lg bg-[#244e70] text-white text-xs font-semibold hover:bg-[#1b3a54] transition disabled:opacity-50 flex items-center gap-2"
                  >

                    {assigningReviewers ? (
                      <>
                        <RefreshCw
                          size={14}
                          className="animate-spin"
                        />

                        Assigning...
                      </>
                    ) : (
                      <>
                        <Check
                          size={14}
                        />

                        Assign Reviewers
                      </>
                    )}

                  </button>

                </div>

              </div>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}

/* ==============================================================
   ALERT
============================================================== */

function AlertBox({
  type,
  message,
  onClose,
}: {
  type: "success" | "error";
  message: string;
  onClose: () => void;
}) {
  const success =
    type === "success";

  return (
    <div
      className={`
        mb-4
        rounded-xl
        border
        px-4
        py-3
        flex
        items-center
        gap-2.5

        ${
          success
            ? "border-green-200 bg-green-50"
            : "border-red-200 bg-red-50"
        }
      `}
    >

      {success ? (
        <CheckCircle2
          size={16}
          className="text-green-600 shrink-0"
        />
      ) : (
        <AlertCircle
          size={16}
          className="text-red-600 shrink-0"
        />
      )}

      <p
        className={`
          text-xs
          font-medium
          flex-1

          ${
            success
              ? "!text-green-700"
              : "!text-red-700"
          }
        `}
      >
        {message}
      </p>

      <button
        onClick={onClose}
        className={
          success
            ? "!text-green-600"
            : "!text-red-600"
        }
      >
        <X size={14} />
      </button>

    </div>
  );
}

/* ==============================================================
   SECTION TITLE
============================================================== */

function SectionTitle({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2.5">

      <div className="w-8 h-8 rounded-lg bg-[#eef3f7] !text-[#244e70] flex items-center justify-center shrink-0">
        <Icon size={10} />
      </div>

      <h2 className="!text-[#111111] text-sm font-semibold">
        {title}
      </h2>

    </div>
  );
}

/* ==============================================================
   REVIEW CARD
============================================================== */

function ReviewCard({
  review,
  index,
}: {
  review: ReviewerReview;
  index: number;
}) {
  return (
    <div className="rounded-xl border border-[#e5e5e5] overflow-hidden">

      <div className="px-4 py-3 bg-[#fafafa] border-b border-[#e9e9e9]">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

          <div className="flex items-center gap-2.5">

            <div className="w-8 h-8 rounded-lg bg-[#eef3f7] !text-[#244e70] flex items-center justify-center">
              <User size={14} />
            </div>

            <div>

              <p className="!text-[#333333] text-xs font-semibold">
                {
                  review.reviewerName ||
                  "Reviewer"
                }
              </p>

              <p className="!text-[#888888] text-[10px] mt-0.5">
                {
                  review.reviewerEmail ||
                  "Email unavailable"
                }
              </p>

            </div>

          </div>

          <div className="flex items-center gap-2">

            <span className="px-2 py-1 rounded-full bg-green-50 border border-green-100 !text-green-700 text-[9px] font-semibold">
              {
                formatReviewStatus(
                  review.status
                )
              }
            </span>

            <span className="text-[9px] !text-[#999999]">
              Review #{index + 1}
            </span>

          </div>

        </div>

      </div>

      <div className="p-4 space-y-4">

        {/* RECOMMENDATION */}

        <div>

          <p className="!text-[#999999] text-[9px] uppercase tracking-[0.15em] font-semibold mb-2">
            Recommendation
          </p>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#eef3f7] border border-[#dfe8ee]">

            <CheckCircle2
              size={13}
              className="!text-[#244e70]"
            />

            <span className="!text-[#405b70] text-xs font-semibold">
              {
                formatRecommendation(
                  review.recommendation
                )
              }
            </span>

          </div>

        </div>

        {/* COMMENTS */}

        <div>

          <p className="!text-[#999999] text-[9px] uppercase tracking-[0.15em] font-semibold mb-2">
            Reviewer Comments
          </p>

          <div className="rounded-lg bg-[#fafafa] border border-[#e9e9e9] p-3">

            {review.comments ? (
              <p className="!text-[#555555] text-xs leading-6 whitespace-pre-wrap">
                {
                  review.comments
                }
              </p>
            ) : (
              <p className="!text-[#999999] text-xs italic">
                No reviewer comments provided.
              </p>
            )}

          </div>

        </div>

        {/* CONFIDENTIAL COMMENTS */}

        <div>

          <div className="flex items-center gap-1.5 mb-2">

            <ShieldAlert
              size={12}
              className="!text-[#a48768]"
            />

            <p className="!text-[#999999] text-[9px] uppercase tracking-[0.15em] font-semibold">
              Confidential Comments
            </p>

          </div>

          <div className="rounded-lg bg-[#fffaf3] border border-[#eadbc7] p-3">

            {review.confidentialComments ? (
              <p className="!text-[#555555] text-xs leading-6 whitespace-pre-wrap">
                {
                  review.confidentialComments
                }
              </p>
            ) : (
              <p className="!text-[#999999] text-xs italic">
                No confidential comments provided.
              </p>
            )}

          </div>

        </div>

      </div>

      <div className="px-4 py-2.5 bg-[#fafafa] border-t border-[#e9e9e9] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">

        <p className="!text-[#999999] text-[9px]">
          Reviewer ID:{" "}
          <span className="font-mono">
            {
              review.reviewerId ||
              "—"
            }
          </span>
        </p>

        <p className="!text-[#999999] text-[9px]">
          Submitted:{" "}
          {formatDate(
            review.submittedAt
          )}
        </p>

      </div>

    </div>
  );
}

/* ==============================================================
   AUTHORS
============================================================== */

function AuthorList({
  authors,
}: {
  authors: unknown;
}) {
  if (!authors) {
    return (
      <p className="!text-[#999999] text-sm">
        No author information available.
      </p>
    );
  }

  if (Array.isArray(authors)) {
    return (
      <div className="space-y-2.5">

        {authors.map(
          (author, index) => {

            if (
              typeof author ===
              "string"
            ) {
              return (
                <div
                  key={index}
                  className="p-3 rounded-xl bg-[#fafafa] border border-[#e9e9e9]"
                >

                  <p className="!text-[#333333] text-xs font-medium">
                    {author}
                  </p>

                </div>
              );
            }

            if (
              typeof author ===
                "object" &&
              author !== null
            ) {
              const item =
                author as Record<
                  string,
                  unknown
                >;

              return (
                <div
                  key={index}
                  className="p-3 rounded-xl bg-[#fafafa] border border-[#e9e9e9]"
                >

                  <p className="!text-[#333333] text-xs font-semibold">
                    {String(
                      item.name ||
                        "Unnamed author"
                    )}
                  </p>

                  {typeof item.affiliation === "string" && item.affiliation.trim() && (
                    <p className="!text-[#888888] text-[10px] mt-1">
                      {item.affiliation}
                    </p>
                  )}

                  {item.email && (
                    <p className="!text-[#888888] text-[10px] mt-1">
                      {String(
                        item.email
                      )}
                    </p>
                  )}

                </div>
              );
            }

            return null;
          }
        )}

      </div>
    );
  }

  return (
    <p className="!text-[#555555] text-sm">
      {String(authors)}
    </p>
  );
}

/* ==============================================================
   STATUS BADGE
============================================================== */

function StatusBadge({
  status,
}: {
  status?: string;
}) {
  const normalized =
    normalizeStatus(status);

  const config: Record<
    string,
    {
      label: string;
      className: string;
      icon: React.ElementType;
    }
  > = {
    submitted: {
      label: "Submitted",
      className:
        "bg-blue-50 !text-blue-700 border-blue-100",
      icon: FileText,
    },

    under_review: {
      label: "Under Review",
      className:
        "bg-amber-50 !text-amber-700 border-amber-100",
      icon: Clock3,
    },

    revision_required: {
      label: "Revision Required",
      className:
        "bg-orange-50 !text-orange-700 border-orange-100",
      icon: RefreshCw,
    },

    accepted: {
      label: "Accepted",
      className:
        "bg-green-50 !text-green-700 border-green-100",
      icon: CheckCircle2,
    },

    rejected: {
      label: "Rejected",
      className:
        "bg-red-50 !text-red-700 border-red-100",
      icon: XCircle,
    },

    published: {
      label: "Published",
      className:
        "bg-purple-50 !text-purple-700 border-purple-100",
      icon: CheckCircle2,
    },
  };

  const current =
    config[normalized] || {
      label:
        formatStatusLabel(
          normalized
        ),
      className:
        "bg-gray-50 !text-gray-600 border-gray-100",
      icon: FileText,
    };

  const Icon =
    current.icon;

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        px-2.5
        py-1.5
        rounded-full
        border
        text-[10px]
        font-semibold
        whitespace-nowrap
        ${current.className}
      `}
    >

      <Icon size={12} />

      {current.label}

    </span>
  );
}

/* ==============================================================
   HELPERS
============================================================== */

function normalizeStatus(
  status?: string
) {
  if (!status) {
    return "submitted";
  }

  return status
    .trim()
    .toLowerCase()
    .replace(
      /[\s-]+/g,
      "_"
    );
}

function formatStatusLabel(
  status: string
) {
  return status
    .replace(/_/g, " ")
    .replace(
      /\b\w/g,
      (char) =>
        char.toUpperCase()
    );
}

function formatRecommendation(
  recommendation?: string
) {
  if (!recommendation) {
    return "Not specified";
  }

  return recommendation
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (char) =>
        char.toUpperCase()
    );
}

function formatReviewStatus(
  status?: string
) {
  if (!status) {
    return "Submitted";
  }

  return status
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (char) =>
        char.toUpperCase()
    );
}

function getTimestampMillis(
  value?:
    | Timestamp
    | Date
    | string
) {
  if (!value) {
    return 0;
  }

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

  const parsed =
    new Date(value).getTime();

  return Number.isNaN(parsed)
    ? 0
    : parsed;
}

function formatDate(
  value?:
    | Timestamp
    | Date
    | string
) {
  if (!value) {
    return "—";
  }

  try {
    let date: Date;

    if (
      value instanceof Timestamp
    ) {
      date = value.toDate();
    } else if (
      value instanceof Date
    ) {
      date = value;
    } else {
      date = new Date(value);
    }

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "—";
    }

    return date.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  } catch {
    return "—";
  }
}

function getKeywords(
  keywords?:
    | string
    | string[]
) {
  if (!keywords) {
    return [];
  }

  if (Array.isArray(keywords)) {
    return keywords
      .map((item) =>
        String(item).trim()
      )
      .filter(Boolean);
  }

  return keywords
    .split(",")
    .map((item) =>
      item.trim()
    )
    .filter(Boolean);
}
