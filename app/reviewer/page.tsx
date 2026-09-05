"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  doc,
} from "firebase/firestore";

import {
  onAuthStateChanged,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";

import {
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ExternalLink,
  Search,
  X,
  Send,
  UserRound,
  CalendarDays,
  Mail,
  Building2,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  Pencil,
} from "lucide-react";

import { auth, firestore } from "@/lib/firebase";

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

type AssignedReviewer = {
  reviewerId: string;
  name: string;
  email: string;
  designation?: string;
  affiliation?: string;
  assignedAt?: string;
};

type Submission = {
  id: string;

  title?: string;
  abstract?: string;

  author?: string;
  email?: string;

  keywords?: string | string[];

  paperId?: string;

  pdfUrl?: string;

  status?: string;

  submittedAt?: Timestamp | Date | string;

  assignedReviewers?: AssignedReviewer[];

  [key: string]: unknown;
};

type Reviewer = {
  id: string;
  name: string;
  email: string;

  phone?: string;
  affiliation?: string;
  designation?: string;

  expertise?: string[];

  status?: string;
};

type Review = {
  id: string;

  submissionId: string;
  paperId?: string;

  reviewerId: string;

  reviewerName?: string;
  reviewerEmail?: string;

  recommendation?: string;

  comments?: string;
  confidentialComments?: string;

  status?: string;

  submittedAt?: Timestamp | Date | string;
};

/*
|--------------------------------------------------------------------------
| RECOMMENDATIONS
|--------------------------------------------------------------------------
*/

const recommendations = [
  {
    value: "accept",
    label: "Accept",
    description:
      "The manuscript is suitable for publication.",
  },
  {
    value: "minor_revision",
    label: "Minor Revision",
    description:
      "Small corrections are required before acceptance.",
  },
  {
    value: "major_revision",
    label: "Major Revision",
    description:
      "Significant changes are required.",
  },
  {
    value: "reject",
    label: "Reject",
    description:
      "The manuscript is not suitable for publication.",
  },
];

/*
|--------------------------------------------------------------------------
| PAGE
|--------------------------------------------------------------------------
*/

export default function ReviewerDashboard() {
  const router = useRouter();

  /*
  |--------------------------------------------------------------------------
  | AUTH
  |--------------------------------------------------------------------------
  */

  const [firebaseUser, setFirebaseUser] =
    useState<FirebaseUser | null>(null);

  const [authLoading, setAuthLoading] =
    useState(true);

  /*
  |--------------------------------------------------------------------------
  | REVIEWER
  |--------------------------------------------------------------------------
  */

  const [reviewer, setReviewer] =
    useState<Reviewer | null>(null);

  /*
  |--------------------------------------------------------------------------
  | DATA
  |--------------------------------------------------------------------------
  */

  const [submissions, setSubmissions] =
    useState<Submission[]>([]);

  const [reviews, setReviews] =
    useState<Review[]>([]);

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [activeMenu, setActiveMenu] =
    useState("Dashboard");

  const [activeTab, setActiveTab] =
    useState<
      "all" | "pending" | "completed"
    >("all");

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | PAGINATION
  |--------------------------------------------------------------------------
  */

  const PAPERS_PER_PAGE = 10;

  const [currentPage, setCurrentPage] =
    useState(1);

  /*
  |--------------------------------------------------------------------------
  | SELECTED PAPER
  |--------------------------------------------------------------------------
  */

  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);

  /*
  |--------------------------------------------------------------------------
  | REVIEW MODAL
  |--------------------------------------------------------------------------
  */

  const [showReviewModal, setShowReviewModal] =
    useState(false);

  const [recommendation, setRecommendation] =
    useState("");

  const [comments, setComments] =
    useState("");

  const [confidentialComments, setConfidentialComments] =
    useState("");

  const [submittingReview, setSubmittingReview] =
    useState(false);

  const [reviewError, setReviewError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | PROFILE MODAL
  |--------------------------------------------------------------------------
  */

  const [showProfileModal, setShowProfileModal] =
    useState(false);

  const [editingProfile, setEditingProfile] =
    useState(false);

  const [profileForm, setProfileForm] = useState({
    name: "",
    affiliation: "",
    expertise: "",
    email: "",
  });

  const [profileSaving, setProfileSaving] =
    useState(false);

  const [profileError, setProfileError] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | AUTH LISTENER
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (user) => {
          setFirebaseUser(user);
          setAuthLoading(false);
        }
      );

    return () => unsubscribe();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | LOAD DASHBOARD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (authLoading) return;

    if (!firebaseUser) {
      router.replace("/login");
      return;
    }

    loadReviewerDashboard(
      firebaseUser.email || ""
    );
  }, [
    authLoading,
    firebaseUser,
    router,
  ]);

  /*
  |--------------------------------------------------------------------------
  | LOAD REVIEWER DATA
  |--------------------------------------------------------------------------
  */

  const loadReviewerDashboard =
    async (email: string) => {
      try {
        setLoading(true);
        setError("");

        if (!email) {
          setError(
            "Your account does not have an email address."
          );
          return;
        }

        const normalizedEmail =
          email.trim().toLowerCase();

        /*
        |--------------------------------------------------------------------------
        | REVIEWER PROFILE
        |--------------------------------------------------------------------------
        */

        const reviewerQuery = query(
          collection(
            firestore,
            "reviewer"
          ),
          where(
            "email",
            "==",
            normalizedEmail
          )
        );

        const reviewerSnapshot =
          await getDocs(
            reviewerQuery
          );

        if (
          reviewerSnapshot.empty
        ) {
          setError(
            "Your account is not registered as an active reviewer."
          );
          return;
        }

        const reviewerDoc =
          reviewerSnapshot.docs[0];

        const reviewerData =
          reviewerDoc.data();

        const reviewerProfile: Reviewer =
          {
            id: reviewerDoc.id,

            name:
              reviewerData.name ||
              "Reviewer",

            email:
              reviewerData.email ||
              normalizedEmail,

            phone:
              reviewerData.phone ||
              "",

            affiliation:
              reviewerData.affiliation ||
              "",

            designation:
              reviewerData.designation ||
              "",

            expertise:
              Array.isArray(
                reviewerData.expertise
              )
                ? reviewerData.expertise
                : [],

            status:
              reviewerData.status ||
              "active",
          };

        if (
          reviewerProfile.status !==
          "active"
        ) {
          setError(
            "Your reviewer account is currently inactive."
          );
          return;
        }

        setReviewer(
          reviewerProfile
        );

        /*
        |--------------------------------------------------------------------------
        | ASSIGNED SUBMISSIONS
        |--------------------------------------------------------------------------
        */

        const submissionsSnapshot =
          await getDocs(
            collection(
              firestore,
              "submissions"
            )
          );

        const assignedSubmissions: Submission[] =
          [];

        submissionsSnapshot.forEach(
          (submissionDoc) => {
            const data =
              submissionDoc.data();

            const assignedReviewers =
              Array.isArray(
                data.assignedReviewers
              )
                ? (data.assignedReviewers as AssignedReviewer[])
                : [];

            const isAssigned =
              assignedReviewers.some(
                (assigned) =>
                  assigned.reviewerId ===
                  reviewerDoc.id
              );

            if (isAssigned) {
              assignedSubmissions.push(
                {
                  id:
                    submissionDoc.id,

                  ...(data as Omit<
                    Submission,
                    "id"
                  >),
                }
              );
            }
          }
        );

        assignedSubmissions.sort(
          (a, b) =>
            getDateValue(
              b.submittedAt
            ) -
            getDateValue(
              a.submittedAt
            )
        );

        setSubmissions(
          assignedSubmissions
        );

        /*
        |--------------------------------------------------------------------------
        | REVIEWS
        |--------------------------------------------------------------------------
        */

        const reviewsQuery =
          query(
            collection(
              firestore,
              "reviews"
            ),
            where(
              "reviewerId",
              "==",
              reviewerDoc.id
            )
          );

        const reviewsSnapshot =
          await getDocs(
            reviewsQuery
          );

        const reviewerReviews: Review[] =
          reviewsSnapshot.docs.map(
            (reviewDoc) => ({
              id: reviewDoc.id,

              ...(reviewDoc.data() as Omit<
                Review,
                "id"
              >),
            })
          );

        setReviews(
          reviewerReviews
        );
      } catch (err) {
        console.error(
          "REVIEWER DASHBOARD ERROR:",
          err
        );

        setError(
          "Unable to load your reviewer dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | REVIEW LOOKUP
  |--------------------------------------------------------------------------
  */

  const hasReviewed = (
    submissionId: string
  ) => {
    return reviews.some(
      (review) =>
        review.submissionId ===
        submissionId
    );
  };

  const getReviewForSubmission = (
    submissionId: string
  ) => {
    return reviews.find(
      (review) =>
        review.submissionId ===
        submissionId
    );
  };

  /*
  |--------------------------------------------------------------------------
  | OPEN REVIEW
  |--------------------------------------------------------------------------
  */

  const openReviewModal = (
    submission: Submission
  ) => {
    const existingReview =
      getReviewForSubmission(
        submission.id
      );

    setSelectedSubmission(
      submission
    );

    if (existingReview) {
      setRecommendation(
        existingReview.recommendation ||
          ""
      );

      setComments(
        existingReview.comments ||
          ""
      );

      setConfidentialComments(
        existingReview.confidentialComments ||
          ""
      );
    } else {
      setRecommendation("");
      setComments("");
      setConfidentialComments("");
    }

    setReviewError("");
    setShowReviewModal(true);
  };

  /*
  |--------------------------------------------------------------------------
  | CLOSE REVIEW MODAL
  |--------------------------------------------------------------------------
  */

  const closeReviewModal = () => {
    if (submittingReview) return;

    setShowReviewModal(false);
    setSelectedSubmission(null);

    setRecommendation("");
    setComments("");
    setConfidentialComments("");

    setReviewError("");
  };

  /*
  |--------------------------------------------------------------------------
  | SUBMIT REVIEW
  |--------------------------------------------------------------------------
  */

  const submitReview = async () => {
    if (
      !selectedSubmission ||
      !reviewer
    ) {
      return;
    }

    if (!recommendation) {
      setReviewError(
        "Please select a recommendation."
      );
      return;
    }

    if (
      comments.trim().length <
      20
    ) {
      setReviewError(
        "Please provide at least 20 characters of reviewer comments."
      );
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewError("");

      /*
      |--------------------------------------------------------------------------
      | DUPLICATE CHECK
      |--------------------------------------------------------------------------
      */

      const duplicateQuery =
        query(
          collection(
            firestore,
            "reviews"
          ),
          where(
            "submissionId",
            "==",
            selectedSubmission.id
          ),
          where(
            "reviewerId",
            "==",
            reviewer.id
          )
        );

      const duplicateSnapshot =
        await getDocs(
          duplicateQuery
        );

      if (
        !duplicateSnapshot.empty
      ) {
        setReviewError(
          "You have already submitted a review for this manuscript."
        );
        return;
      }

      /*
      |--------------------------------------------------------------------------
      | CREATE REVIEW
      |--------------------------------------------------------------------------
      */

      await addDoc(
        collection(
          firestore,
          "reviews"
        ),
        {
          submissionId:
            selectedSubmission.id,

          paperId:
            selectedSubmission.paperId ||
            "",

          reviewerId:
            reviewer.id,

          reviewerName:
            reviewer.name,

          reviewerEmail:
            reviewer.email,

          recommendation,

          comments:
            comments.trim(),

          confidentialComments:
            confidentialComments.trim(),

          status:
            "submitted",

          submittedAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),
        }
      );

      /*
      |--------------------------------------------------------------------------
      | LOCAL STATE
      |--------------------------------------------------------------------------
      */

      const newReview: Review = {
        id: `local-${Date.now()}`,

        submissionId:
          selectedSubmission.id,

        paperId:
          selectedSubmission.paperId ||
          "",

        reviewerId:
          reviewer.id,

        reviewerName:
          reviewer.name,

        reviewerEmail:
          reviewer.email,

        recommendation,

        comments:
          comments.trim(),

        confidentialComments:
          confidentialComments.trim(),

        status:
          "submitted",

        submittedAt:
          new Date(),
      };

      setReviews(
        (current) => [
          ...current,
          newReview,
        ]
      );

      setSuccessMessage(
        "Your review has been submitted successfully."
      );

      closeReviewModal();
    } catch (err) {
      console.error(
        "REVIEW SUBMISSION ERROR:",
        err
      );

      setReviewError(
        "Unable to submit your review. Please try again."
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | PROFILE
  |--------------------------------------------------------------------------
  */

  const openProfile = () => {
    if (!reviewer) return;

    setProfileForm({
      name:
        reviewer.name || "",

      affiliation:
        reviewer.affiliation || "",

      expertise:
        reviewer.expertise?.join(", ") ||
        "",

      email:
        reviewer.email || "",
    });

    setProfileError("");
    setEditingProfile(false);
    setShowProfileModal(true);
  };

  /*
  |--------------------------------------------------------------------------
  | START EDITING PROFILE
  |--------------------------------------------------------------------------
  */

  const startEditingProfile = () => {
    if (!reviewer) return;

    setProfileForm({
      name:
        reviewer.name || "",

      affiliation:
        reviewer.affiliation || "",

      expertise:
        reviewer.expertise?.join(", ") ||
        "",

      email:
        reviewer.email || "",
    });

    setProfileError("");
    setEditingProfile(true);
  };

  /*
  |--------------------------------------------------------------------------
  | CLOSE PROFILE
  |--------------------------------------------------------------------------
  */

  const closeProfileModal = () => {
    if (profileSaving) return;

    setShowProfileModal(false);
    setEditingProfile(false);
    setProfileError("");
  };

  /*
  |--------------------------------------------------------------------------
  | SAVE PROFILE
  |--------------------------------------------------------------------------
  */

  const saveProfile = async () => {
    if (!reviewer) return;

    const name =
      profileForm.name.trim();

    const affiliation =
      profileForm.affiliation.trim();

    const email =
      profileForm.email
        .trim()
        .toLowerCase();

    const expertise =
      profileForm.expertise
        .split(",")
        .map(
          (item) =>
            item.trim()
        )
        .filter(Boolean);

    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */

    if (!name) {
      setProfileError(
        "Please enter your name."
      );
      return;
    }

    if (!email) {
      setProfileError(
        "Please enter your email address."
      );
      return;
    }

    if (
      !email.includes("@") ||
      !email.includes(".")
    ) {
      setProfileError(
        "Please enter a valid email address."
      );
      return;
    }

    try {
      setProfileSaving(true);
      setProfileError("");

      /*
      |--------------------------------------------------------------------------
      | UPDATE EXISTING REVIEWER DOCUMENT
      |--------------------------------------------------------------------------
      |
      | Existing collection:
      | reviewer
      |
      | Existing fields:
      | name
      | affiliation
      | expertise
      | email
      |
      */

      await updateDoc(
        doc(
          firestore,
          "reviewer",
          reviewer.id
        ),
        {
          name,
          affiliation,
          expertise,
          email,
        }
      );

      /*
      |--------------------------------------------------------------------------
      | UPDATE LOCAL PROFILE
      |--------------------------------------------------------------------------
      */

      setReviewer({
        ...reviewer,

        name,

        affiliation,

        expertise,

        email,
      });

      setProfileForm({
        name,

        affiliation,

        expertise:
          expertise.join(", "),

        email,
      });

      setEditingProfile(false);

      setSuccessMessage(
        "Your profile has been updated successfully."
      );
    } catch (err) {
      console.error(
        "PROFILE UPDATE ERROR:",
        err
      );

      setProfileError(
        "Unable to update your profile. Please try again."
      );
    } finally {
      setProfileSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | LOGOUT
  |--------------------------------------------------------------------------
  */

  const handleLogout =
    async () => {
      try {
        await signOut(auth);

        router.replace("/login");
      } catch (err) {
        console.error(
          "LOGOUT ERROR:",
          err
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | NAVIGATION
  |--------------------------------------------------------------------------
  */

  const handleNavigation = (
    label: string
  ) => {
    setActiveMenu(label);
    setSidebarOpen(false);

    switch (label) {
      case "Dashboard":
        router.push("/reviewer");
        break;

      default:
        break;
    }
  };

  /*
  |--------------------------------------------------------------------------
  | FILTERED SUBMISSIONS
  |--------------------------------------------------------------------------
  */

  const filteredSubmissions =
    useMemo(() => {
      let result = [
        ...submissions,
      ];

      if (
        activeTab ===
        "pending"
      ) {
        result =
          result.filter(
            (submission) =>
              !hasReviewed(
                submission.id
              )
          );
      }

      if (
        activeTab ===
        "completed"
      ) {
        result =
          result.filter(
            (submission) =>
              hasReviewed(
                submission.id
              )
          );
      }

      const searchValue =
        search
          .trim()
          .toLowerCase();

      if (searchValue) {
        result =
          result.filter(
            (submission) => {
              const text =
                [
                  submission.title,
                  submission.paperId,
                  submission.author,
                  submission.email,
                  submission.abstract,
                  submission.keywords,
                ]
                  .flat()
                  .filter(Boolean)
                  .join(" ")
                  .toLowerCase();

              return text.includes(
                searchValue
              );
            }
          );
      }

      return result;
    }, [
      submissions,
      reviews,
      activeTab,
      search,
    ]);

  /*
  |--------------------------------------------------------------------------
  | RESET PAGE WHEN FILTER CHANGES
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    setCurrentPage(1);
  }, [
    activeTab,
    search,
  ]);

  /*
  |--------------------------------------------------------------------------
  | PAGINATION
  |--------------------------------------------------------------------------
  */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredSubmissions.length /
        PAPERS_PER_PAGE
    )
  );

  const paginatedSubmissions =
    filteredSubmissions.slice(
      (currentPage - 1) *
        PAPERS_PER_PAGE,
      currentPage *
        PAPERS_PER_PAGE
    );

  useEffect(() => {
    if (
      currentPage >
      totalPages
    ) {
      setCurrentPage(totalPages);
    }
  }, [
    currentPage,
    totalPages,
  ]);

  /*
  |--------------------------------------------------------------------------
  | STATS
  |--------------------------------------------------------------------------
  */

  const totalAssigned =
    submissions.length;

  const completedReviews =
    submissions.filter(
      (submission) =>
        hasReviewed(
          submission.id
        )
    ).length;

  const pendingReviews =
    totalAssigned -
    completedReviews;

  /*
  |--------------------------------------------------------------------------
  | AUTH LOADING
  |--------------------------------------------------------------------------
  */

  if (authLoading) {
    return (
      <ReviewerSkeleton />
    );
  }

  /*
  |--------------------------------------------------------------------------
  | PAGE LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <ReviewerSkeleton />
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ERROR
  |--------------------------------------------------------------------------
  */

  if (error) {
    return (
      <main className="min-h-[100dvh] bg-[#f7f7f7] flex items-center justify-center px-6">
        <div className="w-full max-w-lg bg-white border border-[#e5e5e5] rounded-2xl p-7 shadow-xl shadow-[#111111]/5">

          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mb-5">
            <AlertCircle size={24} />
          </div>

          <p className="text-[10px] uppercase tracking-[0.2em] font-semibold !text-[#244e70]">
            Reviewer Access
          </p>

          <h1 className="!text-[#111111] text-2xl font-semibold mt-2">
            Access verification failed
          </h1>

          <p className="!text-[#666666] text-sm mt-3 leading-6">
            {error}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">

            <button
              onClick={() =>
                window.location.reload()
              }
              className="flex-1 h-11 rounded-xl bg-[#244e70] text-white text-sm font-semibold hover:bg-[#1b3a54] transition"
            >
              Try again
            </button>

            <button
              onClick={async () => {
                await signOut(auth);
                router.replace("/login");
              }}
              className="flex-1 h-11 rounded-xl border border-[#d8d8d8] !text-[#5e5145] text-sm font-semibold hover:bg-[#f7f7f7] transition"
            >
              Back to login
            </button>

          </div>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | MAIN PAGE
  |--------------------------------------------------------------------------
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
            JFER Reviewer
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

        {/* SIDEBAR HEADER */}

        <div className="h-[77px] px-4 border-b border-white/10 flex items-center justify-between">

          <div className="flex items-center gap-3 min-w-0">

            <div className="w-8 h-8 rounded-lg bg-[#2f2923] flex items-center justify-center shrink-0">
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
                  Reviewer Dashboard
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

        {/* NAVIGATION */}

        <nav className="px-2.5 py-4 overflow-y-auto h-[calc(100%-125px)] scrollbar-thin">

          <SidebarItem
            label="Dashboard"
            icon={LayoutDashboard}
            active={
              activeMenu ===
              "Dashboard"
            }
            collapsed={
              sidebarCollapsed
            }
            onClick={() =>
              handleNavigation(
                "Dashboard"
              )
            }
          />

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
            TOP BAR
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
                Reviewer Dashboard
              </h2>

              <p className="!text-[#888888] text-[11px] mt-0.5">
                JFER Editorial System
              </p>

            </div>

          </div>

          <div className="flex items-center gap-3">

            <div className="text-right">

              <p className="!text-[#111111] text-xs font-semibold">
                {reviewer?.name ||
                  "Reviewer"}
              </p>

              <p className="!text-[#888888] text-[10px]">
                {reviewer?.email}
              </p>

            </div>

            <div className="w-9 h-9 rounded-full bg-[#dce8ef] text-[#244e70] flex items-center justify-center text-sm font-bold">
              {(reviewer?.name ||
                "R")
                .charAt(0)
                .toUpperCase()}
            </div>

          </div>

        </header>

        {/* ======================================================
            CONTENT
        ====================================================== */}

        <div className="px-7 py-7 max-w-[1200px] mx-auto">

          {/* MOBILE TITLE */}

          <div className="lg:hidden mb-6">

            <p className="!text-[#888888] text-xs">
              Editorial System
            </p>

            <h1 className="!text-[#111111] text-2xl font-semibold mt-1">
              Reviewer Dashboard
            </h1>

          </div>

          {/* ====================================================
              GREETING
          ==================================================== */}

          <div className="mb-7">

            <h2 className="!text-[#111111] text-[26px] leading-8 font-medium">
              Welcome back
              {reviewer?.name
                ? `, ${reviewer.name}`
                : ""}
            </h2>

            <p className="!text-[#666666] text-sm mt-1.5">
              Review your assigned manuscripts
              and submit your editorial
              recommendations.
            </p>

          </div>

          {/* ====================================================
              SUCCESS
          ==================================================== */}

          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl px-4 py-3 flex items-center gap-3">

              <CheckCircle2
                size={17}
                className="text-green-600 shrink-0"
              />

              <p className="text-sm text-green-700 font-medium">
                {successMessage}
              </p>

              <button
                onClick={() =>
                  setSuccessMessage("")
                }
                className="ml-auto text-green-600 hover:text-green-800"
              >
                <X size={16} />
              </button>

            </div>
          )}

          {/* ====================================================
              STATISTICS
          ==================================================== */}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            <ReviewerStatCard
              title="Assigned Papers"
              value={totalAssigned}
              icon={FileText}
              description="Papers assigned to you"
            />

            <ReviewerStatCard
              title="Pending Reviews"
              value={pendingReviews}
              icon={ClipboardCheck}
              description="Reviews awaiting submission"
            />

            <ReviewerStatCard
              title="Completed Reviews"
              value={completedReviews}
              icon={CheckCircle2}
              description="Reviews submitted"
            />

          </div>

          {/* ====================================================
              PROFILE
          ==================================================== */}

          <section className="mt-7 bg-white rounded-2xl border border-[#e5e5e5] p-5">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

              <div className="flex items-center gap-3">

                <div className="w-11 h-11 rounded-xl bg-[#eef3f7] text-[#244e70] flex items-center justify-center">
                  <UserRound size={19} />
                </div>

                <div>

                  <h3 className="!text-[#111111] text-sm font-semibold">
                    {reviewer?.name ||
                      "Reviewer"}
                  </h3>

                  <p className="!text-[#888888] text-[11px] mt-0.5">
                    Reviewer profile
                  </p>

                </div>

              </div>

              <div className="flex flex-wrap gap-2">

                {reviewer?.email && (
                  <ProfilePill
                    icon={Mail}
                    text={
                      reviewer.email
                    }
                  />
                )}

                {reviewer?.affiliation && (
                  <ProfilePill
                    icon={Building2}
                    text={
                      reviewer.affiliation
                    }
                  />
                )}

                <button
                  onClick={
                    openProfile
                  }
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#244e70] text-white text-[10px] font-semibold hover:bg-[#1b3a54] transition"
                >
                  <UserRound
                    size={12}
                  />

                  View Profile
                </button>

              </div>

            </div>

            {reviewer?.expertise &&
              reviewer.expertise
                .length > 0 && (
                <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-[#eeeeee]">

                  {reviewer.expertise.map(
                    (
                      expertise,
                      index
                    ) => (
                      <span
                        key={`${expertise}-${index}`}
                        className="px-3 py-1.5 rounded-full bg-[#f3f6f8] !text-[#244e70] text-[10px] font-medium"
                      >
                        {expertise}
                      </span>
                    )
                  )}

                </div>
              )}

          </section>

          {/* ====================================================
              PAPERS
          ==================================================== */}

          <section className="mt-7">

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">

              <div>

                <h3 className="!text-[#111111] text-[17px] font-medium">
                  Assigned Manuscripts
                </h3>

                <p className="!text-[#666666] text-xs mt-1">
                  Papers assigned to your
                  reviewer account.
                </p>

              </div>

              <div className="relative w-full md:w-80">

                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 !text-[#aaa097]"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search manuscripts..."
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-[#dcdcdc] bg-white !text-[#111111] placeholder:!text-[#aaa097] text-xs outline-none focus:border-[#9fb4c4] transition"
                />

              </div>

            </div>

            {/* TABS */}

            <div className="flex items-center gap-2 mb-4 overflow-x-auto">

              <ReviewerTab
                active={
                  activeTab ===
                  "all"
                }
                onClick={() => {
                  setActiveTab("all");
                  setActiveMenu(
                    "Assigned Papers"
                  );
                }}
                label={`All (${totalAssigned})`}
              />

              <ReviewerTab
                active={
                  activeTab ===
                  "pending"
                }
                onClick={() => {
                  setActiveTab(
                    "pending"
                  );
                  setActiveMenu(
                    "Pending Reviews"
                  );
                }}
                label={`Pending (${pendingReviews})`}
              />

              <ReviewerTab
                active={
                  activeTab ===
                  "completed"
                }
                onClick={() => {
                  setActiveTab(
                    "completed"
                  );
                  setActiveMenu(
                    "Completed Reviews"
                  );
                }}
                label={`Completed (${completedReviews})`}
              />

            </div>

            {/* PAPER LIST */}

            {paginatedSubmissions.length ===
            0 ? (

              <div className="bg-white border border-[#e5e5e5] rounded-2xl p-12 text-center">

                <div className="w-12 h-12 rounded-xl bg-[#eef3f7] text-[#244e70] flex items-center justify-center mx-auto">

                  <FileText
                    size={21}
                  />

                </div>

                <h3 className="!text-[#111111] text-lg font-semibold mt-5">
                  No manuscripts found
                </h3>

                <p className="!text-[#777777] text-xs mt-2">
                  {activeTab ===
                  "pending"
                    ? "You have no pending reviews."
                    : activeTab ===
                      "completed"
                    ? "You have not completed any reviews yet."
                    : "No manuscripts have been assigned to you."}
                </p>

              </div>

            ) : (

              <div className="space-y-3">

                {paginatedSubmissions.map(
                  (
                    submission,
                    index
                  ) => {

                    const reviewed =
                      hasReviewed(
                        submission.id
                      );

                    const review =
                      getReviewForSubmission(
                        submission.id
                      );

                    return (
                      <article
                        key={
                          submission.id
                        }
                        className="bg-white border border-[#e5e5e5] rounded-2xl p-5 hover:border-[#b7c7d2] hover:shadow-md hover:shadow-[#111111]/5 transition-all duration-300"
                      >

                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">

                          <div className="flex-1 min-w-0">

                            <div className="flex items-center gap-2 mb-2">

                              <span className="font-mono text-[10px] !text-[#888888]">
                                {submission.paperId ||
                                  submission.id}
                              </span>

                              <span className="text-[10px] !text-[#aaaaaa]">
                                •
                              </span>

                              <span className="text-[10px] !text-[#999999]">
                                #{(currentPage -
                                  1) *
                                  PAPERS_PER_PAGE +
                                  index +
                                  1}
                              </span>

                              {reviewed && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 border border-green-100 text-green-700 text-[9px] font-semibold">

                                  <CheckCircle2
                                    size={10}
                                  />

                                  Reviewed

                                </span>
                              )}

                            </div>

                            <h4 className="!text-[#111111] text-[16px] font-semibold leading-6">
                              {submission.title ||
                                "Untitled manuscript"}
                            </h4>

                            {submission.author && (
                              <div className="flex items-center gap-2 mt-2">

                                <UserRound
                                  size={13}
                                  className="!text-[#999999]"
                                />

                                <p className="!text-[#666666] text-xs">
                                  {submission.author}
                                </p>

                              </div>
                            )}

                            <div className="flex flex-wrap items-center gap-3 mt-2">

                              <div className="flex items-center gap-1.5 !text-[#888888] text-[10px]">

                                <CalendarDays
                                  size={12}
                                />

                                Submitted{" "}
                                {formatDate(
                                  submission.submittedAt
                                )}

                              </div>

                              <StatusBadge
                                status={
                                  submission.status
                                }
                              />

                            </div>

                            {submission.abstract && (
                              <p className="!text-[#666666] text-xs leading-5 mt-4 line-clamp-2">
                                {
                                  submission.abstract
                                }
                              </p>
                            )}

                            {submission.keywords && (
                              <div className="flex flex-wrap gap-1.5 mt-3">

                                {normalizeKeywords(
                                  submission.keywords
                                )
                                  .slice(
                                    0,
                                    5
                                  )
                                  .map(
                                    (
                                      keyword,
                                      keywordIndex
                                    ) => (
                                      <span
                                        key={`${keyword}-${keywordIndex}`}
                                        className="px-2 py-1 rounded-full bg-[#f4f6f7] !text-[#667783] text-[9px]"
                                      >
                                        {
                                          keyword
                                        }
                                      </span>
                                    )
                                  )}

                              </div>
                            )}

                            {reviewed &&
                              review && (
                                <div className="mt-4 p-3 rounded-xl bg-[#f5f7f8] border border-[#e7eaec]">

                                  <p className="!text-[#888888] text-[9px] uppercase tracking-[0.12em] font-semibold">
                                    Your recommendation
                                  </p>

                                  <p className="!text-[#111111] text-xs font-semibold mt-1">
                                    {formatRecommendation(
                                      review.recommendation
                                    )}
                                  </p>

                                </div>
                              )}

                          </div>

                          {/* ACTIONS */}

                          <div className="flex lg:flex-col gap-2 shrink-0">

                            {submission.pdfUrl && (
                              <a
                                href={
                                  submission.pdfUrl
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="h-10 px-3.5 rounded-xl border border-[#d8d8d8] !text-[#5e5145] text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#f7f7f7] transition"
                              >

                                <FileText
                                  size={14}
                                />

                                Manuscript

                                <ExternalLink
                                  size={12}
                                />

                              </a>
                            )}

                            {!reviewed ? (
                              <button
                                onClick={() =>
                                  openReviewModal(
                                    submission
                                  )
                                }
                                className="h-10 px-4 rounded-xl bg-[#244e70] text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#1b3a54] transition"
                              >

                                Submit Review

                                <ChevronRight
                                  size={14}
                                />

                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  openReviewModal(
                                    submission
                                  )
                                }
                                className="h-10 px-4 rounded-xl bg-[#eef3f7] !text-[#244e70] text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#e4edf2] transition"
                              >

                                View Review

                                <ChevronRight
                                  size={14}
                                />

                              </button>
                            )}

                          </div>

                        </div>

                      </article>
                    );
                  }
                )}

              </div>
            )}

            {/* PAGINATION */}

            {filteredSubmissions.length >
              PAPERS_PER_PAGE && (
              <div className="mt-5 bg-white border border-[#e5e5e5] rounded-2xl px-4 py-3 flex items-center justify-between">

                <p className="!text-[#777777] text-[11px]">

                  Showing{" "}
                  <span className="font-semibold !text-[#111111]">
                    {(currentPage -
                      1) *
                      PAPERS_PER_PAGE +
                      1}
                  </span>

                  {" – "}

                  <span className="font-semibold !text-[#111111]">
                    {Math.min(
                      currentPage *
                        PAPERS_PER_PAGE,
                      filteredSubmissions.length
                    )}
                  </span>

                  {" of "}

                  <span className="font-semibold !text-[#111111]">
                    {
                      filteredSubmissions.length
                    }
                  </span>

                </p>

                <div className="flex items-center gap-2">

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
                    className="w-9 h-9 rounded-lg border border-[#d8d8d8] flex items-center justify-center !text-[#666666] hover:bg-[#f7f7f7] disabled:opacity-35 disabled:cursor-not-allowed transition"
                    aria-label="Previous page"
                  >
                    <ChevronLeft
                      size={15}
                    />
                  </button>

                  <div className="min-w-[65px] text-center">

                    <span className="!text-[#111111] text-xs font-semibold">
                      {currentPage}
                    </span>

                    <span className="!text-[#999999] text-xs">
                      {" "}
                      /{" "}
                      {
                        totalPages
                      }
                    </span>

                  </div>

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
                    className="w-9 h-9 rounded-lg border border-[#d8d8d8] flex items-center justify-center !text-[#666666] hover:bg-[#f7f7f7] disabled:opacity-35 disabled:cursor-not-allowed transition"
                    aria-label="Next page"
                  >
                    <ChevronRight
                      size={15}
                    />
                  </button>

                </div>

              </div>
            )}

          </section>

        </div>

      </div>

      {/* ========================================================
          REVIEW MODAL
      ======================================================== */}

      {showReviewModal &&
        selectedSubmission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

            <button
              type="button"
              aria-label="Close review modal"
              onClick={
                closeReviewModal
              }
              className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            />

            <div className="relative w-full max-w-3xl max-h-[92vh] overflow-hidden bg-white rounded-2xl shadow-2xl border border-[#e5e5e5] flex flex-col">

              {/* HEADER */}

              <div className="px-6 py-5 border-b border-[#eeeeee] flex items-start justify-between gap-4">

                <div className="min-w-0">

                  <p className="!text-[#244e70] text-[9px] uppercase tracking-[0.15em] font-semibold">
                    Peer Review
                  </p>

                  <h2 className="!text-[#111111] text-xl font-semibold mt-1">
                    {selectedSubmission.title ||
                      "Untitled manuscript"}
                  </h2>

                  <p className="font-mono !text-[#999999] text-[10px] mt-2">
                    {selectedSubmission.paperId ||
                      selectedSubmission.id}
                  </p>

                </div>

                <button
                  onClick={
                    closeReviewModal
                  }
                  disabled={
                    submittingReview
                  }
                  className="w-9 h-9 rounded-lg border border-[#d8d8d8] !text-[#666666] flex items-center justify-center hover:bg-[#f7f7f7] transition disabled:opacity-50 shrink-0"
                >
                  <X size={17} />
                </button>

              </div>

              {/* BODY */}

              <div className="overflow-y-auto p-6 space-y-6">

                {/* ABSTRACT */}

                <div className="rounded-xl bg-[#f7f7f7] border border-[#e7e7e7] p-5">

                  <div className="flex items-center gap-2">

                    <FileText
                      size={15}
                      className="!text-[#244e70]"
                    />

                    <p className="!text-[#111111] text-sm font-semibold">
                      Abstract
                    </p>

                  </div>

                  <p className="!text-[#666666] text-sm leading-7 mt-3">
                    {selectedSubmission.abstract ||
                      "No abstract available."}
                  </p>

                </div>

                {/* MANUSCRIPT */}

                {selectedSubmission.pdfUrl && (
                  <a
                    href={
                      selectedSubmission.pdfUrl
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-4 rounded-xl border border-[#e5e5e5] p-4 hover:bg-[#f7f7f7] transition"
                  >

                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 rounded-xl bg-[#eef3f7] !text-[#244e70] flex items-center justify-center">

                        <FileText
                          size={17}
                        />

                      </div>

                      <div>

                        <p className="!text-[#111111] text-sm font-semibold">
                          View manuscript
                        </p>

                        <p className="!text-[#999999] text-xs mt-0.5">
                          Open the submitted PDF
                        </p>

                      </div>

                    </div>

                    <ExternalLink
                      size={17}
                      className="!text-[#244e70]"
                    />

                  </a>
                )}

                {/* ERROR */}

                {reviewError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-2">

                    <AlertCircle
                      size={16}
                      className="text-red-500 mt-0.5 shrink-0"
                    />

                    <p className="text-sm text-red-700">
                      {reviewError}
                    </p>

                  </div>
                )}

                {/* RECOMMENDATION */}

                <div>

                  <label className="block !text-[#111111] text-sm font-semibold mb-3">
                    Recommendation
                    <span className="text-red-500 ml-1">
                      *
                    </span>
                  </label>

                  <div className="grid sm:grid-cols-2 gap-3">

                    {recommendations.map(
                      (item) => {

                        const selected =
                          recommendation ===
                          item.value;

                        const alreadyReviewed =
                          hasReviewed(
                            selectedSubmission.id
                          );

                        return (
                          <button
                            type="button"
                            key={
                              item.value
                            }
                            disabled={
                              alreadyReviewed
                            }
                            onClick={() =>
                              setRecommendation(
                                item.value
                              )
                            }
                            className={`text-left p-4 rounded-xl border transition ${
                              selected
                                ? "border-[#244e70] bg-[#f1f5f8]"
                                : "border-[#e5e5e5] bg-white hover:bg-[#f7f7f7]"
                            } ${
                              alreadyReviewed
                                ? "cursor-default"
                                : ""
                            }`}
                          >

                            <div className="flex items-start gap-3">

                              <div
                                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                                  selected
                                    ? "border-[#244e70] bg-[#244e70]"
                                    : "border-[#cfcfcf]"
                                }`}
                              >

                                {selected && (
                                  <CheckCircle2
                                    size={13}
                                    className="text-white"
                                  />
                                )}

                              </div>

                              <div>

                                <p className="!text-[#111111] text-sm font-semibold">
                                  {
                                    item.label
                                  }
                                </p>

                                <p className="!text-[#888888] text-xs leading-5 mt-1">
                                  {
                                    item.description
                                  }
                                </p>

                              </div>

                            </div>

                          </button>
                        );
                      }
                    )}

                  </div>

                </div>

                {/* COMMENTS */}

                <div>

                  <label className="block !text-[#111111] text-sm font-semibold mb-2">
                    Reviewer Comments
                    <span className="text-red-500 ml-1">
                      *
                    </span>
                  </label>

                  <p className="!text-[#999999] text-xs mb-3">
                    Provide constructive
                    feedback for the
                    authors.
                  </p>

                  <textarea
                    value={comments}
                    disabled={
                      hasReviewed(
                        selectedSubmission.id
                      )
                    }
                    onChange={(event) =>
                      setComments(
                        event.target.value
                      )
                    }
                    rows={7}
                    placeholder="Enter your detailed comments..."
                    className="w-full resize-none rounded-xl border border-[#dcdcdc] bg-white px-4 py-3 !text-[#111111] placeholder:!text-[#aaa097] text-sm leading-6 outline-none focus:border-[#9fb4c4] transition disabled:bg-[#f5f5f5]"
                  />

                  <p className="!text-[#aaaaaa] text-[10px] mt-2 text-right">
                    {
                      comments.length
                    }{" "}
                    characters
                  </p>

                </div>

                {/* CONFIDENTIAL */}

                <div>

                  <label className="block !text-[#111111] text-sm font-semibold mb-2">
                    Confidential Comments
                    to Editor
                  </label>

                  <p className="!text-[#999999] text-xs mb-3">
                    These comments are
                    visible only to the
                    editorial team.
                  </p>

                  <textarea
                    value={
                      confidentialComments
                    }
                    disabled={
                      hasReviewed(
                        selectedSubmission.id
                      )
                    }
                    onChange={(event) =>
                      setConfidentialComments(
                        event.target.value
                      )
                    }
                    rows={5}
                    placeholder="Optional confidential comments..."
                    className="w-full resize-none rounded-xl border border-[#dcdcdc] bg-white px-4 py-3 !text-[#111111] placeholder:!text-[#aaa097] text-sm leading-6 outline-none focus:border-[#9fb4c4] transition disabled:bg-[#f5f5f5]"
                  />

                </div>

              </div>

              {/* FOOTER */}

              <div className="px-6 py-5 border-t border-[#eeeeee] bg-[#fafafa] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                {hasReviewed(
                  selectedSubmission.id
                ) ? (

                  <div className="flex items-center gap-2">

                    <CheckCircle2
                      size={17}
                      className="text-green-600"
                    />

                    <p className="text-sm text-green-700 font-medium">
                      Review submitted
                    </p>

                  </div>

                ) : (

                  <p className="!text-[#888888] text-xs">
                    Your recommendation and
                    comments will be sent to
                    the editorial team.
                  </p>

                )}

                <div className="flex gap-3">

                  <button
                    onClick={
                      closeReviewModal
                    }
                    disabled={
                      submittingReview
                    }
                    className="h-10 px-5 rounded-xl border border-[#d8d8d8] !text-[#5e5145] text-xs font-semibold hover:bg-white transition disabled:opacity-50"
                  >
                    Close
                  </button>

                  {!hasReviewed(
                    selectedSubmission.id
                  ) && (
                    <button
                      onClick={
                        submitReview
                      }
                      disabled={
                        submittingReview
                      }
                      className="h-10 px-5 rounded-xl bg-[#244e70] text-white text-xs font-semibold hover:bg-[#1b3a54] transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >

                      {submittingReview ? (
                        <>
                          <RefreshCw
                            size={15}
                            className="animate-spin"
                          />

                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send
                            size={15}
                          />

                          Submit Review
                        </>
                      )}

                    </button>
                  )}

                </div>

              </div>

            </div>

          </div>
        )}

      {/* ========================================================
          PROFILE MODAL
      ======================================================== */}

      {showProfileModal &&
        reviewer && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">

            {/* BACKDROP */}

            <button
              type="button"
              aria-label="Close profile"
              onClick={
                closeProfileModal
              }
              className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            />

            {/* MODAL */}

            <div className="relative w-full max-w-xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-[#e5e5e5] overflow-hidden flex flex-col">

              {/* HEADER */}

              <div className="px-6 py-5 border-b border-[#eeeeee] flex items-start justify-between gap-4 shrink-0">

                <div className="flex items-center gap-3">

                  <div className="w-11 h-11 rounded-xl bg-[#eef3f7] text-[#244e70] flex items-center justify-center shrink-0">

                    <UserRound
                      size={19}
                    />

                  </div>

                  <div>

                    <p className="!text-[#244e70] text-[9px] uppercase tracking-[0.15em] font-semibold">
                      Reviewer Profile
                    </p>

                    <h2 className="!text-[#111111] text-xl font-semibold mt-1">
                      {editingProfile
                        ? "Edit Profile"
                        : "Your Profile"}
                    </h2>

                  </div>

                </div>

                <button
                  onClick={
                    closeProfileModal
                  }
                  disabled={
                    profileSaving
                  }
                  className="w-9 h-9 rounded-lg border border-[#d8d8d8] !text-[#666666] flex items-center justify-center hover:bg-[#f7f7f7] transition disabled:opacity-50 shrink-0"
                >
                  <X size={17} />
                </button>

              </div>

              {/* BODY */}

              <div className="overflow-y-auto p-6">

                {profileError && (
                  <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-2">

                    <AlertCircle
                      size={16}
                      className="text-red-500 mt-0.5 shrink-0"
                    />

                    <p className="text-sm text-red-700">
                      {profileError}
                    </p>

                  </div>
                )}

                {!editingProfile ? (

                  /* ==================================================
                     VIEW PROFILE
                  ================================================== */

                  <div className="space-y-4">

                    <ProfileDetail
                      icon={UserRound}
                      label="Name"
                      value={
                        reviewer.name ||
                        "Not provided"
                      }
                    />

                    <ProfileDetail
                      icon={Building2}
                      label="Affiliation"
                      value={
                        reviewer.affiliation ||
                        "Not provided"
                      }
                    />

                    <ProfileDetail
                      icon={Mail}
                      label="Email"
                      value={
                        reviewer.email ||
                        "Not provided"
                      }
                    />

                    <div className="rounded-xl border border-[#e7e7e7] p-4">

                      <div className="flex items-center gap-3 mb-4">

                        <div className="w-9 h-9 rounded-lg bg-[#eef3f7] text-[#244e70] flex items-center justify-center shrink-0">

                          <ClipboardCheck
                            size={15}
                          />

                        </div>

                        <div>

                          <p className="!text-[#888888] text-[9px] uppercase tracking-[0.12em] font-semibold">
                            Areas of Expertise
                          </p>

                          <p className="!text-[#999999] text-[10px] mt-0.5">
                            Your academic and professional expertise
                          </p>

                        </div>

                      </div>

                      {reviewer.expertise &&
                      reviewer.expertise.length >
                        0 ? (

                        <div className="flex flex-wrap gap-2">

                          {reviewer.expertise.map(
                            (
                              item,
                              index
                            ) => (
                              <span
                                key={`${item}-${index}`}
                                className="px-3 py-1.5 rounded-full bg-[#f3f6f8] !text-[#244e70] text-[10px] font-medium"
                              >
                                {item}
                              </span>
                            )
                          )}

                        </div>

                      ) : (

                        <p className="!text-[#999999] text-xs">
                          No expertise areas added.
                        </p>

                      )}

                    </div>

                  </div>

                ) : (

                  /* ==================================================
                     EDIT PROFILE
                  ================================================== */

                  <div className="space-y-5">

                    {/* NAME */}

                    <ProfileInput
                      label="Name"
                      value={
                        profileForm.name
                      }
                      onChange={(value) =>
                        setProfileForm(
                          (current) => ({
                            ...current,
                            name: value,
                          })
                        )
                      }
                      placeholder="Enter your name"
                      icon={
                        UserRound
                      }
                      required
                    />

                    {/* AFFILIATION */}

                    <ProfileInput
                      label="Affiliation"
                      value={
                        profileForm.affiliation
                      }
                      onChange={(value) =>
                        setProfileForm(
                          (current) => ({
                            ...current,
                            affiliation:
                              value,
                          })
                        )
                      }
                      placeholder="University / Institution / Organization"
                      icon={
                        Building2
                      }
                    />

                    {/* EXPERTISE */}

                    <div>

                      <label className="block !text-[#111111] text-xs font-semibold mb-2">

                        Areas of Expertise

                      </label>

                      <p className="!text-[#999999] text-[10px] mb-2">
                        Enter multiple areas separated by commas.
                      </p>

                      <div className="relative">

                        <ClipboardCheck
                          size={15}
                          className="absolute left-3 top-3 !text-[#999999]"
                        />

                        <textarea
                          value={
                            profileForm.expertise
                          }
                          onChange={(
                            event
                          ) =>
                            setProfileForm(
                              (
                                current
                              ) => ({
                                ...current,
                                expertise:
                                  event
                                    .target
                                    .value,
                              })
                            )
                          }
                          rows={4}
                          placeholder="Artificial Intelligence, Machine Learning, Data Science"
                          className="w-full resize-none rounded-xl border border-[#dcdcdc] bg-white pl-10 pr-4 py-3 !text-[#111111] placeholder:!text-[#aaa097] text-xs leading-5 outline-none focus:border-[#9fb4c4] transition"
                        />

                      </div>

                    </div>

                    {/* EMAIL */}

                    <ProfileInput
                      label="Email"
                      value={
                        profileForm.email
                      }
                      onChange={(value) =>
                        setProfileForm(
                          (current) => ({
                            ...current,
                            email: value,
                          })
                        )
                      }
                      placeholder="Enter your email"
                      icon={Mail}
                      type="email"
                      required
                    />

                    {/* INFO */}

                    <div className="rounded-xl bg-[#f7f9fa] border border-[#e7eaec] px-4 py-3">

                      <p className="!text-[#777777] text-[10px] leading-5">

                        Your profile information is
                        used by the editorial system
                        for reviewer identification and
                        communication.

                      </p>

                    </div>

                  </div>

                )}

              </div>

              {/* FOOTER */}

              <div className="px-6 py-5 border-t border-[#eeeeee] bg-[#fafafa] flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 shrink-0">

                <button
                  onClick={
                    closeProfileModal
                  }
                  disabled={
                    profileSaving
                  }
                  className="h-10 px-5 rounded-xl border border-[#d8d8d8] !text-[#5e5145] text-xs font-semibold hover:bg-white transition disabled:opacity-50"
                >
                  Close
                </button>

                {!editingProfile ? (

                  <button
                    onClick={
                      startEditingProfile
                    }
                    className="h-10 px-5 rounded-xl bg-[#244e70] text-white text-xs font-semibold hover:bg-[#1b3a54] transition flex items-center justify-center gap-2"
                  >

                    <Pencil
                      size={14}
                    />

                    Edit Profile

                  </button>

                ) : (

                  <button
                    onClick={
                      saveProfile
                    }
                    disabled={
                      profileSaving
                    }
                    className="h-10 px-5 rounded-xl bg-[#244e70] text-white text-xs font-semibold hover:bg-[#1b3a54] transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >

                    {profileSaving ? (
                      <>
                        <RefreshCw
                          size={14}
                          className="animate-spin"
                        />

                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2
                          size={14}
                        />

                        Save Changes
                      </>
                    )}

                  </button>

                )}

              </div>

            </div>

          </div>
        )}

    </main>
  );
}

/*
|--------------------------------------------------------------------------
| SIDEBAR ITEM
|--------------------------------------------------------------------------
*/

function SidebarItem({
  label,
  icon: Icon,
  active,
  collapsed,
  onClick,
}: {
  label: string;
  icon: React.ElementType;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={
        collapsed
          ? label
          : undefined
      }
      className={`
        w-full
        flex
        items-center
        ${
          collapsed
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
          active
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

        {!collapsed && (
          <span className="truncate">
            {label}
          </span>
        )}

      </div>

      {!collapsed &&
        active && (
          <ChevronRight
            size={13}
          />
        )}

    </button>
  );
}

/*
|--------------------------------------------------------------------------
| STAT CARD
|--------------------------------------------------------------------------
*/

function ReviewerStatCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  description: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#e5e5e5] p-5 min-h-[154px] hover:shadow-md hover:shadow-[#111111]/5 transition-all duration-300">

      <div className="flex items-start justify-between gap-3">

        <div>

          <p className="!text-[#666666] text-xs">
            {title}
          </p>

          <p className="!text-[#111111] text-[30px] leading-9 font-medium mt-2">
            {value}
          </p>

        </div>

        <div className="w-11 h-11 rounded-xl bg-[#eef3f7] text-[#244e70] flex items-center justify-center shrink-0">

          <Icon
            size={19}
            strokeWidth={1.7}
          />

        </div>

      </div>

      <p className="!text-[#888888] text-[11px] mt-4">
        {description}
      </p>

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| PROFILE PILL
|--------------------------------------------------------------------------
*/

function ProfilePill({
  icon: Icon,
  text,
}: {
  icon: React.ElementType;
  text: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#f7f7f7] border border-[#e8e8e8] !text-[#666666] text-[10px]">

      <Icon
        size={12}
        className="!text-[#244e70]"
      />

      {text}

    </span>
  );
}

/*
|--------------------------------------------------------------------------
| PROFILE DETAIL
|--------------------------------------------------------------------------
*/

function ProfileDetail({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[#e7e7e7] p-4 flex items-center gap-3">

      <div className="w-9 h-9 rounded-lg bg-[#eef3f7] text-[#244e70] flex items-center justify-center shrink-0">

        <Icon
          size={15}
        />

      </div>

      <div className="min-w-0 flex-1">

        <p className="!text-[#888888] text-[9px] uppercase tracking-[0.12em] font-semibold">
          {label}
        </p>

        <p className="!text-[#111111] text-sm font-medium mt-1 break-words">
          {value}
        </p>

      </div>

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| PROFILE INPUT
|--------------------------------------------------------------------------
*/

function ProfileInput({
  label,
  value,
  onChange,
  placeholder,
  icon: Icon,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon: React.ElementType;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>

      <label className="block !text-[#111111] text-xs font-semibold mb-2">

        {label}

        {required && (
          <span className="text-red-500 ml-1">
            *
          </span>
        )}

      </label>

      <div className="relative">

        <Icon
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 !text-[#999999]"
        />

        <input
          type={type}
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          placeholder={placeholder}
          className="w-full h-11 rounded-xl border border-[#dcdcdc] bg-white pl-10 pr-4 !text-[#111111] placeholder:!text-[#aaa097] text-xs outline-none focus:border-[#9fb4c4] transition"
        />

      </div>

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| TAB
|--------------------------------------------------------------------------
*/

function ReviewerTab({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        h-9
        px-4
        rounded-xl
        text-[11px]
        font-semibold
        whitespace-nowrap
        transition

        ${
          active
            ? "bg-[#244e70] text-white"
            : "bg-white border border-[#dedede] !text-[#666666] hover:bg-[#f7f7f7]"
        }
      `}
    >
      {label}
    </button>
  );
}

/*
|--------------------------------------------------------------------------
| STATUS BADGE
|--------------------------------------------------------------------------
*/

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
    }
  > = {
    submitted: {
      label: "Submitted",
      className:
        "bg-blue-50 text-blue-700 border-blue-100",
    },

    under_review: {
      label: "Under Review",
      className:
        "bg-amber-50 text-amber-700 border-amber-100",
    },

    revision_required: {
      label: "Revision Required",
      className:
        "bg-orange-50 text-orange-700 border-orange-100",
    },

    accepted: {
      label: "Accepted",
      className:
        "bg-green-50 text-green-700 border-green-100",
    },

    rejected: {
      label: "Rejected",
      className:
        "bg-red-50 text-red-700 border-red-100",
    },

    published: {
      label: "Published",
      className:
        "bg-purple-50 text-purple-700 border-purple-100",
    },
  };

  const current =
    config[normalized] ||
    config.submitted;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[9px] font-semibold ${current.className}`}
    >
      {current.label}
    </span>
  );
}

/*
|--------------------------------------------------------------------------
| NORMALIZE STATUS
|--------------------------------------------------------------------------
*/

function normalizeStatus(
  status?: string
) {
  if (!status) {
    return "submitted";
  }

  return status
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-/g, "_");
}

/*
|--------------------------------------------------------------------------
| KEYWORDS
|--------------------------------------------------------------------------
*/

function normalizeKeywords(
  keywords: string | string[]
) {
  if (Array.isArray(keywords)) {
    return keywords;
  }

  return keywords
    .split(",")
    .map((item) =>
      item.trim()
    )
    .filter(Boolean);
}

/*
|--------------------------------------------------------------------------
| DATE VALUE
|--------------------------------------------------------------------------
*/

function getDateValue(
  value:
    | Timestamp
    | Date
    | string
    | undefined
) {
  if (!value) {
    return 0;
  }

  try {
    if (value instanceof Timestamp) {
      return value.toMillis();
    }

    if (value instanceof Date) {
      return value.getTime();
    }

    const date =
      new Date(value);

    return Number.isNaN(
      date.getTime()
    )
      ? 0
      : date.getTime();
  } catch {
    return 0;
  }
}

/*
|--------------------------------------------------------------------------
| FORMAT DATE
|--------------------------------------------------------------------------
*/

function formatDate(
  value:
    | Timestamp
    | Date
    | string
    | undefined
) {
  const timestamp =
    getDateValue(value);

  if (!timestamp) {
    return "Date unavailable";
  }

  return new Date(
    timestamp
  ).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

/*
|--------------------------------------------------------------------------
| RECOMMENDATION
|--------------------------------------------------------------------------
*/

function formatRecommendation(
  value?: string
) {
  switch (value) {
    case "accept":
      return "Accept";

    case "minor_revision":
      return "Minor Revision";

    case "major_revision":
      return "Major Revision";

    case "reject":
      return "Reject";

    default:
      return "Not specified";
  }
}

/*
|--------------------------------------------------------------------------
| SKELETON LOADING
|--------------------------------------------------------------------------
*/

function ReviewerSkeleton() {
  return (
    <main className="min-h-[100dvh] bg-[#f7f7f7] animate-pulse">

      {/* MOBILE HEADER */}

      <div className="lg:hidden h-16 bg-white border-b border-[#e5e5e5]" />

      {/* SIDEBAR */}

      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-[203px] bg-[#2f2923]">

        <div className="h-[77px] border-b border-white/10 px-4 flex items-center gap-3">

          <div className="w-8 h-8 rounded-lg bg-white/10" />

          <div className="space-y-2">
            <div className="w-14 h-2 bg-white/10 rounded" />
            <div className="w-24 h-1.5 bg-white/10 rounded" />
          </div>

        </div>

        <div className="px-3 py-5 space-y-2">

          <div className="h-8 bg-white/10 rounded-lg" />

          <div className="h-3 w-12 bg-white/5 rounded mt-5" />

          <div className="h-8 bg-white/10 rounded-lg" />

          <div className="h-3 w-14 bg-white/5 rounded mt-5" />

          <div className="h-8 bg-white/10 rounded-lg" />

          <div className="h-8 bg-white/10 rounded-lg" />

        </div>

      </aside>

      {/* CONTENT */}

      <div className="lg:ml-[203px]">

        <div className="hidden lg:flex h-[77px] bg-white border-b border-[#e5e5e5] items-center px-7">

          <div className="w-8 h-8 bg-[#eeeeee] rounded-lg mr-3" />

          <div className="space-y-2">

            <div className="w-48 h-4 bg-[#e9e9e9] rounded" />

            <div className="w-28 h-2 bg-[#eeeeee] rounded" />

          </div>

        </div>

        <div className="px-7 py-7 max-w-[1200px] mx-auto">

          <div className="space-y-3 mb-7">

            <div className="w-64 h-7 bg-[#e5e5e5] rounded-lg" />

            <div className="w-80 h-3 bg-[#eaeaea] rounded" />

          </div>

          {/* STATS */}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {[1, 2, 3].map(
              (item) => (
                <div
                  key={item}
                  className="bg-white border border-[#e5e5e5] rounded-2xl p-5 min-h-[154px]"
                >

                  <div className="flex justify-between">

                    <div className="space-y-3">

                      <div className="w-24 h-3 bg-[#e7e7e7] rounded" />

                      <div className="w-12 h-9 bg-[#e3e3e3] rounded" />

                    </div>

                    <div className="w-11 h-11 bg-[#eef0f1] rounded-xl" />

                  </div>

                  <div className="w-36 h-2 bg-[#eeeeee] rounded mt-5" />

                </div>
              )
            )}

          </div>

          {/* PROFILE */}

          <div className="mt-7 bg-white border border-[#e5e5e5] rounded-2xl p-5">

            <div className="flex justify-between">

              <div className="flex gap-3">

                <div className="w-10 h-10 bg-[#eef0f1] rounded-xl" />

                <div className="space-y-2">

                  <div className="w-28 h-3 bg-[#e5e5e5] rounded" />

                  <div className="w-20 h-2 bg-[#eeeeee] rounded" />

                </div>

              </div>

              <div className="w-48 h-8 bg-[#eeeeee] rounded-xl" />

            </div>

          </div>

          {/* PAPERS */}

          <div className="mt-7">

            <div className="flex justify-between mb-4">

              <div className="space-y-2">

                <div className="w-40 h-5 bg-[#e5e5e5] rounded" />

                <div className="w-60 h-2.5 bg-[#eeeeee] rounded" />

              </div>

              <div className="w-80 h-10 bg-white border border-[#e5e5e5] rounded-xl" />

            </div>

            <div className="flex gap-2 mb-4">

              <div className="w-20 h-9 bg-[#e5e5e5] rounded-xl" />

              <div className="w-24 h-9 bg-[#eeeeee] rounded-xl" />

              <div className="w-28 h-9 bg-[#eeeeee] rounded-xl" />

            </div>

            <div className="space-y-3">

              {[1, 2, 3].map(
                (item) => (
                  <div
                    key={item}
                    className="bg-white border border-[#e5e5e5] rounded-2xl p-5"
                  >

                    <div className="flex justify-between gap-5">

                      <div className="flex-1 space-y-3">

                        <div className="w-20 h-2 bg-[#eeeeee] rounded" />

                        <div className="w-3/4 h-5 bg-[#e5e5e5] rounded" />

                        <div className="w-32 h-2.5 bg-[#eeeeee] rounded" />

                        <div className="w-full h-2.5 bg-[#eeeeee] rounded" />

                        <div className="w-5/6 h-2.5 bg-[#eeeeee] rounded" />

                      </div>

                      <div className="flex flex-col gap-2">

                        <div className="w-28 h-10 bg-[#eeeeee] rounded-xl" />

                        <div className="w-32 h-10 bg-[#e5e5e5] rounded-xl" />

                      </div>

                    </div>

                  </div>
                )
              )}

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}