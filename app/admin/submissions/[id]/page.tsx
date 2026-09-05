
"use client";

import {
  FormEvent,
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
  BookOpen,
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
  ShieldAlert,
  Tag,
  User,
  UserCheck,
  Users,
  X,
  XCircle,
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
  //   icon: Check,
  // },
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
    label: "Published Papers",
    icon: BookOpen,
    section: "Journal",
  },
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
     DECISION
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
     AUTH
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
     LOAD REVIEWERS
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
          "Unable to load active reviewers."
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

      const existing =
        Array.isArray(
          submission.assignedReviewers
        )
          ? submission.assignedReviewers
          : [];

      setSelectedReviewerIds(
        existing.map(
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

  const toggleReviewer =
    (
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

      if (
        !submission ||
        !id
      ) {
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

        const selected =
          reviewers.filter(
            (reviewer) =>
              selectedReviewerIds.includes(
                reviewer.id
              )
          );

        if (
          selected.length ===
          0
        ) {

          setReviewerError(
            "No valid active reviewers were selected."
          );

          return;
        }

        const assignedReviewers: AssignedReviewer[] =
          selected.map(
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
          "Unable to assign reviewers."
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

      if (
        !submission ||
        !id
      ) {
        return;
      }

      if (
        reviews.length === 0
      ) {

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

          status =
            "accepted";

        } else if (
          decision ===
            "minor_revision" ||
          decision ===
            "major_revision"
        ) {

          status =
            "revision_required";

        } else {

          status =
            "rejected";

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
          "Unable to save the editorial decision."
        );

      } finally {

        setDecisionLoading(false);

      }
    };


  /* ============================================================
     FILTER REVIEWERS
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
          "LOGOUT ERROR:",
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

  const handleNavigation =
    (
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
      <div className="min-h-screen bg-[#f5f6f7] flex items-center justify-center">

        <div className="text-center">

          <div className="w-12 h-12 bg-[#202b35] rounded-2xl flex items-center justify-center mx-auto shadow-lg">

            <BookOpen
              size={20}
              className="text-[#c7a77d]"
            />

          </div>

          <div className="mt-5 flex items-center justify-center gap-2">

            <RefreshCw
              size={13}
              className="animate-spin text-[#244e70]"
            />

            <p className="text-xs text-[#777]">
              Loading manuscript
            </p>

          </div>

        </div>

      </div>
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
      <div className="min-h-screen bg-[#f5f6f7] flex items-center justify-center p-6">

        <div className="max-w-md w-full bg-white rounded-2xl border border-[#e4e6e8] shadow-xl p-8 text-center">

          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mx-auto">

            <AlertCircle
              size={22}
            />

          </div>

          <h1 className="mt-5 text-xl font-semibold text-[#16191c]">
            Manuscript unavailable
          </h1>

          <p className="mt-2 text-sm text-[#777] leading-6">
            {error ||
              "This submission could not be loaded."}
          </p>

          <button
            onClick={() =>
              router.push(
                "/admin/submissions"
              )
            }
            className="mt-6 h-10 px-5 rounded-xl bg-[#202b35] text-white text-xs font-semibold hover:bg-[#16212a] transition"
          >
            Return to Submissions
          </button>

        </div>

      </div>
    );
  }


  /* ============================================================
     DERIVED DATA
  ============================================================ */

  const title =
    submission.title ||
    submission.paperTitle ||
    "Untitled manuscript";

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

  const progress =
    assignedReviewers.length > 0
      ? Math.min(
          100,
          Math.round(
            (reviews.length /
              assignedReviewers.length) *
              100
          )
        )
      : 0;


  /* ============================================================
     UI
  ============================================================ */

  return (
    <main className="min-h-screen bg-[#f5f6f7] text-[#16191c]">


      {/* ========================================================
          MOBILE HEADER
      ======================================================== */}

      <header className="lg:hidden sticky top-0 z-40 h-16 bg-[#202b35] text-white px-4 flex items-center justify-between shadow-md">

        <div className="flex items-center gap-3">

          <div className="w-9 h-9 rounded-xl bg-[#c7a77d] text-[#202b35] flex items-center justify-center font-bold">
            J
          </div>

          <div>

            <p className="text-sm font-semibold">
              JFER
            </p>

            <p className="text-[9px] text-white/40">
              Editorial Office
            </p>

          </div>

        </div>

        <button
          onClick={() =>
            setSidebarOpen(true)
          }
          className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center"
        >

          <Menu
            size={20}
          />

        </button>

      </header>


      {/* ========================================================
          MOBILE OVERLAY
      ======================================================== */}

      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() =>
            setSidebarOpen(false)
          }
          className="lg:hidden fixed inset-0 z-40 bg-black/40"
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
          min-h-screen
          transition-all
          duration-300

          ${
            sidebarCollapsed
              ? "lg:ml-[72px]"
              : "lg:ml-[230px]"
          }
        `}
      >


        {/* ======================================================
            TOP HEADER
        ====================================================== */}

        <header className="hidden lg:flex h-[74px] bg-white border-b border-[#e3e5e7] sticky top-0 z-30 px-7 items-center justify-between">

          <div className="flex items-center gap-4">

            <button
              onClick={() =>
                setSidebarCollapsed(
                  (value) =>
                    !value
                )
              }
              className="w-9 h-9 rounded-xl hover:bg-[#f4f5f6] flex items-center justify-center text-[#666]"
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

              <p className="text-[9px] uppercase tracking-[0.2em] text-[#a0a3a5] font-semibold">
                Editorial Workspace
              </p>

              <h2 className="text-[20px] font-semibold text-[#171a1d]">
                Manuscript Review
              </h2>

            </div>

          </div>


          <div className="flex items-center gap-3">

            <div className="text-right">

              <p className="text-xs font-semibold text-[#333]">
                Administrator
              </p>

              <p className="text-[10px] text-[#999] mt-0.5">
                {user?.email}
              </p>

            </div>

            <div className="w-9 h-9 rounded-full bg-[#e9dfd1] text-[#765b3d] flex items-center justify-center text-xs font-bold">
              A
            </div>

          </div>

        </header>


        {/* ======================================================
            PAGE CONTENT
        ====================================================== */}

        <div className="max-w-[1280px] mx-auto px-5 sm:px-7 lg:px-9 py-6 lg:py-8">


          {/* BACK */}

          <button
            onClick={() =>
              router.push(
                "/admin/submissions"
              )
            }
            className="inline-flex items-center gap-2 text-xs text-[#777] hover:text-[#244e70] transition mb-6"
          >

            <ArrowLeft
              size={15}
            />

            All Submissions

          </button>


          {/* ====================================================
              SUCCESS / ERROR
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
              MANUSCRIPT HERO
          ==================================================== */}

          <section className="relative overflow-hidden bg-[#202b35] rounded-2xl shadow-sm">

            <div className="absolute -right-20 -top-24 w-72 h-72 rounded-full border border-white/5" />

            <div className="absolute -right-8 bottom-[-150px] w-80 h-80 rounded-full border border-[#c7a77d]/10" />

            <div className="relative p-6 md:p-8 lg:p-9">

              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-7">

                <div className="min-w-0 max-w-4xl">

                  <div className="flex flex-wrap items-center gap-2 mb-5">

                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-3 py-1.5 text-[9px] text-white/60 font-mono">

                      <FileText
                        size={12}
                      />

                      {submission.paperId ||
                        id}

                    </span>

                    <StatusBadge
                      status={
                        submission.status
                      }
                      dark
                    />

                  </div>

                  <h3 className="text-2xl md:text-3xl lg:text-[34px] leading-[1.18] font-semibold tracking-[-0.025em] text-white">
                    {title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-5 text-xs text-white/45">

                    <span className="inline-flex items-center gap-2">

                      <CalendarDays
                        size={14}
                      />

                      {formatDate(
                        submission.submittedAt ||
                          submission.createdAt
                      )}

                    </span>

                    <span className="inline-flex items-center gap-2">

                      <MessageSquareText
                        size={14}
                      />

                      {reviews.length}{" "}
                      reviewer{" "}
                      {reviews.length ===
                      1
                        ? "review"
                        : "reviews"}

                    </span>

                    <span className="inline-flex items-center gap-2">

                      <Users
                        size={14}
                      />

                      {
                        assignedReviewers.length
                      }{" "}
                      assigned

                    </span>

                  </div>

                </div>


                {pdfUrl && (
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-[#c7a77d] text-[#202b35] text-xs font-semibold hover:bg-[#d3b891] transition shrink-0"
                  >

                    <ExternalLink
                      size={14}
                    />

                    Open Manuscript

                  </a>
                )}

              </div>

            </div>

          </section>


          {/* ====================================================
              WORKFLOW STRIP
          ==================================================== */}

          <section className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">

            <WorkflowStep
              number="01"
              title="Submitted"
              active
            />

            <WorkflowStep
              number="02"
              title="Reviewers"
              active={
                assignedReviewers.length >
                0
              }
            />

            <WorkflowStep
              number="03"
              title="Feedback"
              active={
                reviews.length >
                0
              }
            />

            <WorkflowStep
              number="04"
              title="Decision"
              active={
                !!submission.editorialDecision
              }
            />

          </section>


          {/* ====================================================
              MAIN LAYOUT
          ==================================================== */}

          <div className="grid xl:grid-cols-[minmax(0,1fr)_350px] gap-5 mt-5">


            {/* ==================================================
                LEFT
            ================================================== */}

            <div className="space-y-5">


              {/* ABSTRACT */}

              <EditorialSection
                eyebrow="Manuscript"
                title="Abstract"
                icon={FileText}
              >

                {submission.abstract ? (
                  <p className="text-sm leading-7 text-[#555] whitespace-pre-wrap">
                    {
                      submission.abstract
                    }
                  </p>
                ) : (
                  <EmptyText>
                    No abstract was provided.
                  </EmptyText>
                )}

              </EditorialSection>


              {/* AUTHORS */}

              <EditorialSection
                eyebrow="Contributors"
                title="Authors"
                icon={User}
              >

                {submission.authors ? (
                  <AuthorList
                    authors={
                      submission.authors
                    }
                  />
                ) : submission.author ? (
                  <p className="text-sm text-[#555]">
                    {
                      submission.author
                    }
                  </p>
                ) : (
                  <EmptyText>
                    No author information available.
                  </EmptyText>
                )}

              </EditorialSection>


              {/* KEYWORDS */}

              <EditorialSection
                eyebrow="Classification"
                title="Keywords"
                icon={Tag}
              >

                <div className="flex flex-wrap gap-2">

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
                          className="px-3 py-1.5 rounded-lg bg-[#f1f4f6] border border-[#e3e7e9] text-[10px] text-[#526b7d] font-medium"
                        >
                          {
                            keyword
                          }
                        </span>

                      )
                    )

                  ) : (

                    <EmptyText>
                      No keywords provided.
                    </EmptyText>

                  )}

                </div>

              </EditorialSection>


              {/* ==================================================
                  REVIEW SECTION
              ================================================== */}

              <section className="bg-white border border-[#e1e4e6] rounded-2xl overflow-hidden">

                <div className="px-5 md:px-6 py-5 border-b border-[#e8eaec]">

                  <div className="flex items-center justify-between gap-4">

                    <div className="flex items-center gap-3">

                      <div className="w-9 h-9 rounded-xl bg-[#edf2f5] text-[#244e70] flex items-center justify-center">

                        <MessageSquareText
                          size={16}
                        />

                      </div>

                      <div>

                        <p className="text-[9px] uppercase tracking-[0.18em] text-[#9a9d9f] font-semibold">
                          Peer Review
                        </p>

                        <h2 className="text-base font-semibold text-[#202326] mt-0.5">
                          Reviewer Feedback
                        </h2>

                      </div>

                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-[#f1f4f6] text-[#526b7d] text-[10px] font-semibold">
                      {reviews.length}
                    </span>

                  </div>

                </div>


                {reviewsError && (
                  <div className="m-5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                    {
                      reviewsError
                    }
                  </div>
                )}


                {reviewsLoading ? (

                  <div className="py-14 text-center">

                    <RefreshCw
                      size={20}
                      className="mx-auto animate-spin text-[#244e70]"
                    />

                    <p className="text-xs text-[#888] mt-3">
                      Loading reviewer feedback...
                    </p>

                  </div>

                ) : reviews.length ===
                  0 ? (

                  <div className="p-10 text-center">

                    <div className="w-12 h-12 rounded-2xl bg-[#f5f6f7] flex items-center justify-center mx-auto text-[#aaa]">

                      <Clock3
                        size={20}
                      />

                    </div>

                    <h3 className="mt-4 text-sm font-semibold text-[#444]">
                      Waiting for reviewer feedback
                    </h3>

                    <p className="mt-1.5 text-xs text-[#999] max-w-sm mx-auto leading-5">
                      Once assigned reviewers submit their evaluations, their feedback will appear here.
                    </p>

                  </div>

                ) : (

                  <div className="p-5 md:p-6 space-y-4">

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
                RIGHT SIDEBAR
            ================================================== */}

            <aside className="space-y-5">


              {/* STATUS */}

              <SidePanel
                eyebrow="Current State"
                title="Editorial Status"
              >

                <div className="flex items-center justify-between gap-3">

                  <StatusBadge
                    status={
                      submission.status
                    }
                  />

                  {submission.editorialDecision && (
                    <span className="text-[10px] text-[#888]">
                      {
                        formatRecommendation(
                          submission.editorialDecision
                        )
                      }
                    </span>
                  )}

                </div>

              </SidePanel>


              {/* REVIEWER PANEL */}

              <SidePanel
                eyebrow="Peer Review"
                title="Assigned Reviewers"
                action={
                  <button
                    onClick={
                      openReviewerModal
                    }
                    className="text-[10px] font-semibold text-[#244e70] hover:text-[#183b55]"
                  >
                    Manage
                  </button>
                }
              >

                {assignedReviewers.length ===
                0 ? (

                  <div className="rounded-xl border border-dashed border-[#d9dddf] bg-[#fafbfb] p-5 text-center">

                    <Users
                      size={19}
                      className="mx-auto text-[#aaa]"
                    />

                    <p className="mt-2 text-xs text-[#777]">
                      No reviewers assigned
                    </p>

                    <button
                      onClick={
                        openReviewerModal
                      }
                      className="mt-4 h-9 px-4 rounded-lg bg-[#202b35] text-white text-[10px] font-semibold hover:bg-[#16212a]"
                    >
                      Connect Reviewer
                    </button>

                  </div>

                ) : (

                  <div className="space-y-2.5">

                    {assignedReviewers.map(
                      (
                        reviewer
                      ) => (

                        <div
                          key={
                            reviewer.reviewerId
                          }
                          className="flex items-center gap-3 p-3 rounded-xl bg-[#f8f9fa] border border-[#e8eaec]"
                        >

                          <div className="w-8 h-8 rounded-lg bg-[#e8eef2] text-[#244e70] flex items-center justify-center shrink-0">

                            <UserCheck
                              size={14}
                            />

                          </div>

                          <div className="min-w-0">

                            <p className="text-xs font-semibold text-[#333] truncate">
                              {
                                reviewer.name
                              }
                            </p>

                            <p className="text-[10px] text-[#999] mt-0.5 truncate">
                              {
                                reviewer.email
                              }
                            </p>

                          </div>

                        </div>

                      )
                    )}

                    <button
                      onClick={
                        openReviewerModal
                      }
                      className="w-full h-9 mt-1 rounded-lg border border-[#d9dfe2] text-[#526b7d] text-[10px] font-semibold hover:bg-[#f5f7f8] transition"
                    >
                      Change Reviewers
                    </button>

                  </div>

                )}

              </SidePanel>


              {/* REVIEW PROGRESS */}

              <SidePanel
                eyebrow="Progress"
                title="Review Completion"
              >

                <div className="flex items-end justify-between">

                  <div>

                    <p className="text-2xl font-semibold text-[#202326]">
                      {progress}%
                    </p>

                    <p className="text-[10px] text-[#999] mt-1">
                      {
                        reviews.length
                      } of{" "}
                      {
                        assignedReviewers.length
                      } reviews received
                    </p>

                  </div>

                  <MessageSquareText
                    size={19}
                    className="text-[#244e70]"
                  />

                </div>

                <div className="h-2 bg-[#eceff0] rounded-full mt-5 overflow-hidden">

                  <div
                    className="h-full bg-[#244e70] rounded-full transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                    }}
                  />

                </div>

              </SidePanel>


              {/* ==================================================
                  DECISION PANEL
              ================================================== */}

              <section className="bg-[#202b35] rounded-2xl p-5 shadow-sm">

                <div className="flex items-start justify-between gap-3">

                  <div>

                    <p className="text-[9px] uppercase tracking-[0.2em] text-[#c7a77d] font-semibold">
                      Final Review
                    </p>

                    <h2 className="text-base font-semibold text-white mt-1">
                      Editorial Decision
                    </h2>

                  </div>

                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    hasReviews
                      ? "bg-green-500/10 text-green-300"
                      : "bg-white/5 text-white/30"
                  }`}>

                    {hasReviews ? (
                      <CheckCircle2
                        size={17}
                      />
                    ) : (
                      <Clock3
                        size={17}
                      />
                    )}

                  </div>

                </div>


                <div className={`mt-5 rounded-xl p-3 border ${
                  hasReviews
                    ? "bg-green-500/5 border-green-400/10"
                    : "bg-white/5 border-white/5"
                }`}>

                  <p className={`text-[10px] font-semibold ${
                    hasReviews
                      ? "text-green-300"
                      : "text-white/60"
                  }`}>

                    {hasReviews
                      ? "Reviewer feedback available"
                      : "Awaiting reviewer feedback"}

                  </p>

                  <p className="text-[9px] text-white/35 mt-1 leading-4">

                    {hasReviews
                      ? "You can now record the editorial outcome."
                      : "Decision controls will unlock after feedback is received."}

                  </p>

                </div>


                <div className="mt-4 space-y-2">

                  <DecisionButton
                    label="Accept Manuscript"
                    icon={Check}
                    disabled={
                      !hasReviews ||
                      decisionLoading
                    }
                    onClick={() =>
                      makeEditorialDecision(
                        "accepted"
                      )
                    }
                    variant="accept"
                  />

                  <DecisionButton
                    label="Minor Revision"
                    icon={RefreshCw}
                    disabled={
                      !hasReviews ||
                      decisionLoading
                    }
                    onClick={() =>
                      makeEditorialDecision(
                        "minor_revision"
                      )
                    }
                    variant="minor"
                  />

                  <DecisionButton
                    label="Major Revision"
                    icon={RefreshCw}
                    disabled={
                      !hasReviews ||
                      decisionLoading
                    }
                    onClick={() =>
                      makeEditorialDecision(
                        "major_revision"
                      )
                    }
                    variant="major"
                  />

                  <DecisionButton
                    label="Reject Manuscript"
                    icon={XCircle}
                    disabled={
                      !hasReviews ||
                      decisionLoading
                    }
                    onClick={() =>
                      makeEditorialDecision(
                        "rejected"
                      )
                    }
                    variant="reject"
                  />

                </div>


                {submission.editorialDecision && (

                  <div className="mt-4 pt-4 border-t border-white/10">

                    <p className="text-[9px] uppercase tracking-[0.15em] text-white/30 font-semibold">
                      Recorded Decision
                    </p>

                    <p className="text-xs font-semibold text-white mt-1">
                      {
                        formatRecommendation(
                          submission.editorialDecision
                        )
                      }
                    </p>

                  </div>

                )}

              </section>


              {/* PAPER INFO */}

              <SidePanel
                eyebrow="Submission"
                title="Manuscript Information"
              >

                <InfoRow
                  label="Paper ID"
                  value={
                    submission.paperId ||
                    id
                  }
                  mono
                />

                <InfoRow
                  label="Submitted"
                  value={formatDate(
                    submission.submittedAt ||
                      submission.createdAt
                  )}
                />

                <InfoRow
                  label="Reviewers"
                  value={String(
                    assignedReviewers.length
                  )}
                />

                <InfoRow
                  label="Reviews"
                  value={String(
                    reviews.length
                  )}
                />

              </SidePanel>

            </aside>

          </div>

        </div>

      </div>


      {/* ========================================================
          REVIEWER MODAL
      ======================================================== */}

      {showReviewerModal && (

        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">

          <button
            aria-label="Close"
            onClick={
              closeReviewerModal
            }
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl border border-[#e4e6e8]">

            {/* HEADER */}

            <div className="px-5 md:px-6 py-5 border-b border-[#e5e7e9] flex items-center justify-between">

              <div>

                <p className="text-[9px] uppercase tracking-[0.2em] text-[#244e70] font-semibold">
                  Peer Review
                </p>

                <h2 className="text-lg font-semibold text-[#171a1d] mt-1">
                  Connect Reviewers
                </h2>

                <p className="text-xs text-[#999] mt-1">
                  Select the researchers who should evaluate this manuscript.
                </p>

              </div>

              <button
                onClick={
                  closeReviewerModal
                }
                disabled={
                  assigningReviewers
                }
                className="w-9 h-9 rounded-xl bg-[#f5f6f7] text-[#666] flex items-center justify-center hover:bg-[#eceeef]"
              >

                <X
                  size={17}
                />

              </button>

            </div>


            {/* SEARCH */}

            <div className="px-5 md:px-6 pt-4">

              <div className="relative">

                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]"
                />

                <input
                  value={
                    reviewerSearch
                  }
                  onChange={(event) =>
                    setReviewerSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search by name, email, affiliation or expertise..."
                  className="w-full h-10 rounded-xl border border-[#dfe2e4] bg-[#fafbfb] pl-9 pr-3 text-xs text-[#333] outline-none focus:border-[#244e70] focus:ring-2 focus:ring-[#244e70]/10"
                />

              </div>

            </div>


            {/* ERROR */}

            {reviewerError && (

              <div className="mx-5 md:mx-6 mt-3 rounded-xl bg-red-50 border border-red-200 p-3 flex gap-2">

                <AlertCircle
                  size={14}
                  className="text-red-500 shrink-0 mt-0.5"
                />

                <p className="text-xs text-red-700">
                  {
                    reviewerError
                  }
                </p>

              </div>

            )}


            {/* LIST */}

            <div className="p-5 md:p-6 max-h-[50vh] overflow-y-auto">

              {loadingReviewers ? (

                <div className="py-12 text-center">

                  <RefreshCw
                    size={20}
                    className="mx-auto animate-spin text-[#244e70]"
                  />

                  <p className="text-xs text-[#888] mt-3">
                    Loading reviewers...
                  </p>

                </div>

              ) : filteredReviewers.length ===
                0 ? (

                <div className="py-12 text-center">

                  <Users
                    size={22}
                    className="mx-auto text-[#aaa]"
                  />

                  <p className="text-xs text-[#777] mt-3">
                    {reviewerSearch
                      ? "No reviewers match your search."
                      : "No active reviewers available."}
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
                        key={
                          reviewer.id
                        }
                        type="button"
                        onClick={() =>
                          toggleReviewer(
                            reviewer.id
                          )
                        }
                        className={`
                          w-full
                          text-left
                          p-3.5
                          rounded-xl
                          border
                          mb-2
                          transition

                          ${
                            selected
                              ? "border-[#244e70] bg-[#f0f5f8]"
                              : "border-[#e5e7e9] hover:bg-[#fafbfb]"
                          }
                        `}
                      >

                        <div className="flex gap-3">

                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            selected
                              ? "bg-[#244e70] text-white"
                              : "bg-[#edf1f3] text-[#244e70]"
                          }`}>

                            {selected ? (
                              <Check
                                size={15}
                              />
                            ) : (
                              <User
                                size={15}
                              />
                            )}

                          </div>

                          <div className="min-w-0 flex-1">

                            <div className="flex items-start justify-between gap-3">

                              <div>

                                <p className="text-xs font-semibold text-[#333]">
                                  {
                                    reviewer.name
                                  }
                                </p>

                                <p className="text-[10px] text-[#999] mt-1">
                                  {
                                    reviewer.email
                                  }
                                </p>

                              </div>

                              <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                                selected
                                  ? "bg-[#244e70] border-[#244e70] text-white"
                                  : "border-[#d8dcde] text-transparent"
                              }`}>

                                <Check
                                  size={11}
                                />

                              </div>

                            </div>

                            {reviewer.designation && (
                              <p className="text-[10px] text-[#777] mt-1">
                                {
                                  reviewer.designation
                                }
                              </p>
                            )}

                            {reviewer.affiliation && (
                              <p className="text-[10px] text-[#999] mt-1">
                                {
                                  reviewer.affiliation
                                }
                              </p>
                            )}

                            {reviewer.expertise &&
                              reviewer.expertise.length >
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
                                        className="px-2 py-1 rounded-md bg-[#f3f4f5] text-[8px] text-[#666]"
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
            <div className="sticky bottom-0 z-10 px-5 md:px-6 py-4 bg-white border-t border-[#e5e7e9] shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">

                <div className="text-xs text-[#777]">

                  <span className="font-semibold text-[#202b35]">
                    {selectedReviewerIds.length}
                  </span>{" "}

                  reviewer
                  {selectedReviewerIds.length !== 1 ? "s" : ""} selected

                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">

                  <button
                    type="button"
                    onClick={closeReviewerModal}
                    disabled={assigningReviewers}
                    className="
                      h-10
                      px-5
                      rounded-lg
                      border
                      border-[#dfe2e4]
                      bg-white
                      text-[#666]
                      text-xs
                      font-semibold
                      hover:bg-[#f4f5f6]
                      transition
                      flex-1
                      sm:flex-none
                    "
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={assignReviewers}
                    disabled={
                      assigningReviewers ||
                      selectedReviewerIds.length === 0
                    }
                    className="
                      h-10
                      px-5
                      rounded-lg
                      bg-[#244e70]
                      text-white
                      text-xs
                      font-semibold
                      hover:bg-[#183b55]
                      disabled:opacity-40
                      disabled:cursor-not-allowed
                      transition
                      flex-1
                      sm:flex-none
                      flex
                      items-center
                      justify-center
                      gap-2
                    "
                  >

                    {assigningReviewers ? (
                      <>
                        <RefreshCw
                          size={13}
                          className="animate-spin"
                        />

                        Connecting...
                      </>
                    ) : (
                      <>
                        <UserCheck size={13} />

                        Save & Connect
                        {selectedReviewerIds.length > 0
                          ? ` (${selectedReviewerIds.length})`
                          : ""}
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
   EDITORIAL SECTION
============================================================== */

function EditorialSection({
  eyebrow,
  title,
  icon: Icon,
  children,
}: {
  eyebrow: string;
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {

  return (

    <section className="bg-white border border-[#e1e4e6] rounded-2xl overflow-hidden">

      <div className="px-5 md:px-6 py-5 border-b border-[#e8eaec] flex items-center gap-3">

        <div className="w-9 h-9 rounded-xl bg-[#edf2f5] text-[#244e70] flex items-center justify-center">

          <Icon
            size={16}
          />

        </div>

        <div>

          <p className="text-[9px] uppercase tracking-[0.18em] text-[#a0a3a5] font-semibold">
            {eyebrow}
          </p>

          <h2 className="text-base font-semibold text-[#202326] mt-0.5">
            {title}
          </h2>

        </div>

      </div>

      <div className="p-5 md:p-6">

        {children}

      </div>

    </section>
  );
}


/* ==============================================================
   SIDE PANEL
============================================================== */

function SidePanel({
  eyebrow,
  title,
  action,
  children,
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {

  return (

    <section className="bg-white border border-[#e1e4e6] rounded-2xl p-5">

      <div className="flex items-start justify-between gap-3 mb-4">

        <div>

          <p className="text-[9px] uppercase tracking-[0.18em] text-[#a0a3a5] font-semibold">
            {eyebrow}
          </p>

          <h2 className="text-sm font-semibold text-[#202326] mt-1">
            {title}
          </h2>

        </div>

        {action}

      </div>

      {children}

    </section>
  );
}


/* ==============================================================
   WORKFLOW STEP
============================================================== */

function WorkflowStep({
  number,
  title,
  active,
}: {
  number: string;
  title: string;
  active: boolean;
}) {

  return (

    <div className={`bg-white rounded-xl border p-3.5 flex items-center gap-3 ${
      active
        ? "border-[#dce4e9]"
        : "border-[#e8eaec]"
    }`}>

      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[9px] font-semibold ${
        active
          ? "bg-[#202b35] text-[#c7a77d]"
          : "bg-[#f1f2f3] text-[#aaa]"
      }`}>

        {active ? (
          <Check
            size={13}
          />
        ) : (
          number
        )}

      </div>

      <div>

        <p className={`text-[10px] uppercase tracking-[0.1em] font-semibold ${
          active
            ? "text-[#4b5f6d]"
            : "text-[#aaa]"
        }`}>
          {title}
        </p>

      </div>

    </div>
  );
}


/* ==============================================================
   DECISION BUTTON
============================================================== */

function DecisionButton({
  label,
  icon: Icon,
  disabled,
  onClick,
  variant,
}: {
  label: string;
  icon: React.ElementType;
  disabled: boolean;
  onClick: () => void;
  variant:
    | "accept"
    | "minor"
    | "major"
    | "reject";
}) {

  const styles = {

    accept:
      "bg-[#62805b] hover:bg-[#536f4d] text-white",

    minor:
      "bg-[#b58a42] hover:bg-[#9e7738] text-white",

    major:
      "bg-[#9b7041] hover:bg-[#835f37] text-white",

    reject:
      "bg-[#a45e58] hover:bg-[#8f4f4a] text-white",

  };

  return (

    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`w-full h-10 rounded-xl flex items-center justify-center gap-2 text-[10px] font-semibold transition disabled:opacity-30 disabled:cursor-not-allowed ${styles[variant]}`}
    >

      <Icon
        size={13}
      />

      {label}

    </button>
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

    <article className="rounded-xl border border-[#e3e6e8] overflow-hidden">

      <div className="px-4 py-3.5 bg-[#fafbfb] border-b border-[#e8eaec]">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

          <div className="flex items-center gap-3">

            <div className="w-9 h-9 rounded-xl bg-[#e8eef2] text-[#244e70] flex items-center justify-center">

              <User
                size={15}
              />

            </div>

            <div>

              <p className="text-xs font-semibold text-[#333]">
                {
                  review.reviewerName ||
                  "Reviewer"
                }
              </p>

              <p className="text-[10px] text-[#999] mt-0.5">
                {
                  review.reviewerEmail ||
                  "Email unavailable"
                }
              </p>

            </div>

          </div>

          <div className="flex items-center gap-2">

            <span className="px-2 py-1 rounded-md bg-green-50 border border-green-100 text-green-700 text-[9px] font-semibold">
              {
                formatReviewStatus(
                  review.status
                )
              }
            </span>

            <span className="text-[9px] text-[#aaa]">
              #{index + 1}
            </span>

          </div>

        </div>

      </div>


      <div className="p-4 space-y-5">

        {/* RECOMMENDATION */}

        <div>

          <p className="text-[9px] uppercase tracking-[0.16em] text-[#999] font-semibold mb-2">
            Recommendation
          </p>

          <div className="inline-flex items-center gap-2 rounded-lg bg-[#edf2f5] border border-[#dfe6ea] px-3 py-2">

            <CheckCircle2
              size={14}
              className="text-[#244e70]"
            />

            <span className="text-xs font-semibold text-[#405b70]">
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

          <p className="text-[9px] uppercase tracking-[0.16em] text-[#999] font-semibold mb-2">
            Reviewer Comments
          </p>

          <div className="rounded-xl bg-[#fafbfb] border border-[#e7e9ea] p-4">

            {review.comments ? (

              <p className="text-xs leading-6 text-[#555] whitespace-pre-wrap">
                {
                  review.comments
                }
              </p>

            ) : (

              <p className="text-xs text-[#aaa] italic">
                No reviewer comments provided.
              </p>

            )}

          </div>

        </div>


        {/* CONFIDENTIAL */}

        <div>

          <div className="flex items-center gap-2 mb-2">

            <ShieldAlert
              size={12}
              className="text-[#a48768]"
            />

            <p className="text-[9px] uppercase tracking-[0.16em] text-[#999] font-semibold">
              Confidential Comments
            </p>

          </div>

          <div className="rounded-xl bg-[#fffaf4] border border-[#eadbc7] p-4">

            {review.confidentialComments ? (

              <p className="text-xs leading-6 text-[#555] whitespace-pre-wrap">
                {
                  review.confidentialComments
                }
              </p>

            ) : (

              <p className="text-xs text-[#aaa] italic">
                No confidential comments provided.
              </p>

            )}

          </div>

        </div>

      </div>


      <div className="px-4 py-2.5 bg-[#fafbfb] border-t border-[#e8eaec] flex flex-col sm:flex-row sm:justify-between gap-1">

        <p className="text-[9px] text-[#aaa]">

          Reviewer ID:{" "}

          <span className="font-mono">
            {
              review.reviewerId ||
              "—"
            }
          </span>

        </p>

        <p className="text-[9px] text-[#aaa]">

          Submitted{" "}

          {formatDate(
            review.submittedAt
          )}

        </p>

      </div>

    </article>
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
      <EmptyText>
        No author information available.
      </EmptyText>
    );
  }

  if (
    Array.isArray(authors)
  ) {

    return (

      <div className="grid gap-2.5">

        {authors.map(
          (
            author,
            index
          ) => {

            if (
              typeof author ===
              "string"
            ) {

              return (

                <div
                  key={index}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-[#fafbfb] border border-[#e7e9ea]"
                >

                  <div className="w-8 h-8 rounded-lg bg-[#edf2f5] text-[#244e70] flex items-center justify-center">

                    <User
                      size={14}
                    />

                  </div>

                  <p className="text-xs font-medium text-[#444]">
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
                  className="p-3.5 rounded-xl bg-[#fafbfb] border border-[#e7e9ea]"
                >

                  <p className="text-xs font-semibold text-[#333]">

                    {String(
                      item.name ||
                        "Unnamed author"
                    )}

                  </p>

                 {item.affiliation != null && (
                    <p className="!text-[#888888] text-[10px] mt-1">
                      {String(item.affiliation)}
                    </p>
                  )}

                  {item.email && (

                    <p className="text-[10px] text-[#999] mt-1">

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
    <p className="text-sm text-[#555]">
      {String(authors)}
    </p>
  );
}


/* ==============================================================
   STATUS BADGE
============================================================== */

function StatusBadge({
  status,
  dark = false,
}: {
  status?: string;
  dark?: boolean;
}) {

  const normalized =
    normalizeStatus(status);

  const config: Record<
    string,
    {
      label: string;
      className: string;
      darkClass: string;
      icon: React.ElementType;
    }
  > = {

    submitted: {
      label: "Submitted",
      className:
        "bg-blue-50 text-blue-700 border-blue-100",
      darkClass:
        "bg-blue-400/10 text-blue-200 border-blue-300/10",
      icon: FileText,
    },

    under_review: {
      label: "Under Review",
      className:
        "bg-amber-50 text-amber-700 border-amber-100",
      darkClass:
        "bg-amber-400/10 text-amber-200 border-amber-300/10",
      icon: Clock3,
    },

    revision_required: {
      label: "Revision Required",
      className:
        "bg-orange-50 text-orange-700 border-orange-100",
      darkClass:
        "bg-orange-400/10 text-orange-200 border-orange-300/10",
      icon: RefreshCw,
    },

    accepted: {
      label: "Accepted",
      className:
        "bg-green-50 text-green-700 border-green-100",
      darkClass:
        "bg-green-400/10 text-green-200 border-green-300/10",
      icon: CheckCircle2,
    },

    rejected: {
      label: "Rejected",
      className:
        "bg-red-50 text-red-700 border-red-100",
      darkClass:
        "bg-red-400/10 text-red-200 border-red-300/10",
      icon: XCircle,
    },

    published: {
      label: "Published",
      className:
        "bg-purple-50 text-purple-700 border-purple-100",
      darkClass:
        "bg-purple-400/10 text-purple-200 border-purple-300/10",
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
        "bg-gray-50 text-gray-600 border-gray-100",

      darkClass:
        "bg-white/10 text-white/60 border-white/10",

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
        text-[9px]
        font-semibold
        whitespace-nowrap

        ${
          dark
            ? current.darkClass
            : current.className
        }
      `}
    >

      <Icon
        size={11}
      />

      {
        current.label
      }

    </span>
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

    <div className={`mb-4 rounded-xl border px-4 py-3 flex items-center gap-3 ${
      success
        ? "border-green-200 bg-green-50"
        : "border-red-200 bg-red-50"
    }`}>

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

      <p className={`text-xs font-medium flex-1 ${
        success
          ? "text-green-700"
          : "text-red-700"
      }`}>
        {message}
      </p>

      <button
        onClick={onClose}
        className={
          success
            ? "text-green-600"
            : "text-red-600"
        }
      >

        <X
          size={14}
        />

      </button>

    </div>
  );
}


/* ==============================================================
   INFO ROW
============================================================== */

function InfoRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {

  return (

    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-[#f0f1f2] last:border-0">

      <span className="text-[10px] text-[#999]">
        {label}
      </span>

      <span className={`text-[10px] text-[#444] text-right max-w-[190px] break-words ${
        mono
          ? "font-mono"
          : "font-medium"
      }`}>
        {value}
      </span>

    </div>
  );
}


/* ==============================================================
   EMPTY TEXT
============================================================== */

function EmptyText({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <p className="text-xs text-[#aaa]">
      {children}
    </p>
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
    .replace(
      /_/g,
      " "
    )
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
    .replaceAll(
      "_",
      " "
    )
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
    .replaceAll(
      "_",
      " "
    )
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

      date =
        value.toDate();

    } else if (
      value instanceof Date
    ) {

      date =
        value;

    } else {

      date =
        new Date(value);

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

  if (
    Array.isArray(
      keywords
    )
  ) {

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
