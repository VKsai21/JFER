"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  onAuthStateChanged,
  signOut,
  User,
} from "firebase/auth";

import {
  collection,
  doc,
  getDocs,
  getDoc,
  Timestamp,
  updateDoc,
  serverTimestamp,
  query,
  where,
  limit,
} from "firebase/firestore";

import {
  ArrowLeft,
  Check,
  ChevronRight,
  Clock3,
  Mail,
  Search,
  ShieldCheck,
  UserCheck,
  UserX,
  Users,
  X,
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  UserPlus,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  AlertCircle,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
} from "lucide-react";

import {
  auth,
  firestore,
} from "@/lib/firebase";

/* ==========================================================
   TYPES
========================================================== */

type ReviewerApplication = {
  id: string;

  name?: string;
  email?: string;
  phone?: string;

  affiliation?: string;
  designation?: string;

  expertise?: string[];

  status?: string;

  submittedAt?: Timestamp;
  reviewedAt?: Timestamp;

  [key: string]: unknown;
};

type Reviewer = {
  id: string;

  uid?: string;

  name?: string;
  email?: string;
  phone?: string;

  affiliation?: string;
  designation?: string;

  expertise?: string[];

  status?: string;

  applicationId?: string;

  approvedAt?: Timestamp;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;

  [key: string]: unknown;
};

type TabType =
  | "applications"
  | "reviewers";

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

/* ==========================================================
   SIDEBAR MENU
========================================================== */

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
    label: "Published Papers",
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

/* ==========================================================
   HELPERS
========================================================== */

function getName(
  person:
    | ReviewerApplication
    | Reviewer
) {
  return (
    String(
      person.name || ""
    ).trim() ||
    "Unnamed Reviewer"
  );
}

function getEmail(
  person:
    | ReviewerApplication
    | Reviewer
) {
  return (
    String(
      person.email || ""
    ).trim() ||
    "No email"
  );
}

function normalizeStatus(
  status?: string
) {
  return String(
    status || "pending"
  )
    .trim()
    .toLowerCase();
}

function normalizeReviewerStatus(
  status?: string
) {
  return String(
    status || "active"
  )
    .trim()
    .toLowerCase();
}

function formatDate(
  timestamp?: Timestamp
) {
  if (!timestamp) {
    return "—";
  }

  try {
    return timestamp
      .toDate()
      .toLocaleDateString(
        "en-IN",
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

/* ==========================================================
   PAGE
========================================================== */

export default function ReviewerManagementPage() {
  const router =
    useRouter();

  /* ========================================================
     AUTH
  ======================================================== */

  const [user, setUser] =
    useState<User | null>(
      null
    );

  const [profile, setProfile] =
    useState<AdminProfile | null>(
      null
    );

  const [authLoading, setAuthLoading] =
    useState(true);

  /* ========================================================
     SIDEBAR
  ======================================================== */

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [activeMenu, setActiveMenu] =
    useState("Reviewers");

  /* ========================================================
     DATA
  ======================================================== */

  const [
    applications,
    setApplications,
  ] = useState<
    ReviewerApplication[]
  >([]);

  const [
    reviewers,
    setReviewers,
  ] = useState<Reviewer[]>(
    []
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    processingId,
    setProcessingId,
  ] = useState("");

  const [
    selectedApplication,
    setSelectedApplication,
  ] =
    useState<ReviewerApplication | null>(
      null
    );

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    tab,
    setTab,
  ] = useState<TabType>(
    "applications"
  );

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  /* ========================================================
     AUTHENTICATION
  ======================================================== */

  useEffect(() => {
    let mounted = true;

    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (currentUser) => {
          if (!currentUser) {
            router.replace(
              "/login"
            );
            return;
          }

          if (!mounted) {
            return;
          }

          setUser(
            currentUser
          );

          try {
            /*
             * Check admin/{uid}
             */

            const adminRef =
              doc(
                firestore,
                "admin",
                currentUser.uid
              );

            const adminSnapshot =
              await getDoc(
                adminRef
              );

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
             * Fallback email lookup
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
                  adminQuerySnapshot.docs[0]
                    .data() as AdminProfile;
              }
            }

            if (!adminData) {
              setError(
                "Your Firebase account is authenticated, but no administrator record was found in Firestore."
              );

              setAuthLoading(
                false
              );

              setLoading(
                false
              );

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

              setAuthLoading(
                false
              );

              setLoading(
                false
              );

              return;
            }

            if (!mounted) {
              return;
            }

            setProfile(
              adminData
            );

            setAuthLoading(
              false
            );
          } catch (err) {
            console.error(
              "REVIEWERS: Auth error:",
              err
            );

            if (!mounted) {
              return;
            }

            setError(
              "Unable to verify administrator access."
            );

            setAuthLoading(
              false
            );

            setLoading(
              false
            );
          }
        }
      );

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [router]);

  /* ========================================================
     LOAD DATA
  ======================================================== */

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        applicationsSnapshot,
        reviewersSnapshot,
      ] = await Promise.all([
        getDocs(
          collection(
            firestore,
            "reviewerApplications"
          )
        ),

        getDocs(
          collection(
            firestore,
            "reviewer"
          )
        ),
      ]);

      const applicationData =
        applicationsSnapshot.docs.map(
          (item) => ({
            id: item.id,
            ...item.data(),
          })
        ) as ReviewerApplication[];

      const reviewerData =
        reviewersSnapshot.docs.map(
          (item) => ({
            id: item.id,
            ...item.data(),
          })
        ) as Reviewer[];

      setApplications(
        applicationData
      );

      setReviewers(
        reviewerData
      );
    } catch (err) {
      console.error(
        "REVIEWERS: Load error:",
        err
      );

      setError(
        "Unable to load reviewer data."
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
      loadData();
    }
  }, [
    authLoading,
    error,
  ]);

  /* ========================================================
     SUCCESS MESSAGE TIMER
  ======================================================== */

  useEffect(() => {
    if (!success) {
      return;
    }

    const timer =
      window.setTimeout(
        () => {
          setSuccess("");
        },
        5000
      );

    return () =>
      window.clearTimeout(
        timer
      );
  }, [success]);

  /* ========================================================
     STATS
  ======================================================== */

  const pendingCount =
    applications.filter(
      (application) =>
        normalizeStatus(
          application.status
        ) === "pending"
    ).length;

  const approvedCount =
    applications.filter(
      (application) =>
        normalizeStatus(
          application.status
        ) === "approved"
    ).length;

  const rejectedCount =
    applications.filter(
      (application) =>
        normalizeStatus(
          application.status
        ) === "rejected"
    ).length;

  const activeReviewerCount =
    reviewers.filter(
      (reviewer) =>
        normalizeReviewerStatus(
          reviewer.status
        ) === "active"
    ).length;

  /* ========================================================
     FILTER APPLICATIONS
  ======================================================== */

  const filteredApplications =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return applications
        .filter(
          (application) => {
            if (!query) {
              return true;
            }

            const searchable = [
              application.name,
              application.email,
              application.phone,
              application.affiliation,
              application.designation,
              ...(application.expertise ||
                []),
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

            return searchable.includes(
              query
            );
          }
        )
        .sort((a, b) => {
          const aTime =
            a.submittedAt?.toMillis?.() ||
            0;

          const bTime =
            b.submittedAt?.toMillis?.() ||
            0;

          return (
            bTime - aTime
          );
        });
    }, [
      applications,
      search,
    ]);

  /* ========================================================
     FILTER REVIEWERS
  ======================================================== */

  const filteredReviewers =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return reviewers
        .filter((reviewer) => {
          if (!query) {
            return true;
          }

          const searchable = [
            reviewer.name,
            reviewer.email,
            reviewer.phone,
            reviewer.affiliation,
            reviewer.designation,
            ...(reviewer.expertise ||
              []),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchable.includes(
            query
          );
        })
        .sort((a, b) =>
          getName(a).localeCompare(
            getName(b)
          )
        );
    }, [
      reviewers,
      search,
    ]);

  /* ========================================================
     ADMIN TOKEN
  ======================================================== */

  const getAdminToken =
    async () => {
      const currentUser =
        auth.currentUser;

      if (!currentUser) {
        throw new Error(
          "Your admin session has expired. Please login again."
        );
      }

      return currentUser.getIdToken(
        true
      );
    };

  /* ========================================================
     APPROVE APPLICATION
  ======================================================== */

  const approveApplication =
    async (
      application: ReviewerApplication
    ) => {
      const name =
        getName(
          application
        );

      const email =
        getEmail(
          application
        );

      const confirmed =
        window.confirm(
          `Approve ${name} as a reviewer?\n\nA Firebase Authentication account will be created and the login credentials will be sent to:\n${email}`
        );

      if (!confirmed) {
        return;
      }

      try {
        setProcessingId(
          application.id
        );

        setError("");
        setSuccess("");

        const token =
          await getAdminToken();

        const response =
          await fetch(
            "/api/admin/reviewer-decision",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                applicationId:
                  application.id,

                action: "approve",
              }),
            }
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Unable to approve reviewer application."
          );
        }

        setSelectedApplication(
          null
        );

        setSuccess(
          result.message ||
            "Reviewer approved and credentials sent by email."
        );

        await loadData();
      } catch (err) {
        console.error(
          "REVIEWERS: Approval error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to approve this reviewer application."
        );
      } finally {
        setProcessingId("");
      }
    };

  /* ========================================================
     REJECT APPLICATION
  ======================================================== */

  const rejectApplication =
    async (
      application: ReviewerApplication
    ) => {
      const name =
        getName(
          application
        );

      const email =
        getEmail(
          application
        );

      const confirmed =
        window.confirm(
          `Reject the reviewer application from ${name}?\n\nA rejection email will be sent to:\n${email}`
        );

      if (!confirmed) {
        return;
      }

      try {
        setProcessingId(
          application.id
        );

        setError("");
        setSuccess("");

        const token =
          await getAdminToken();

        const response =
          await fetch(
            "/api/admin/reviewer-decision",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                applicationId:
                  application.id,

                action: "reject",
              }),
            }
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Unable to reject reviewer application."
          );
        }

        setSelectedApplication(
          null
        );

        setSuccess(
          result.message ||
            "Application rejected and email sent."
        );

        await loadData();
      } catch (err) {
        console.error(
          "REVIEWERS: Rejection error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to reject this reviewer application."
        );
      } finally {
        setProcessingId("");
      }
    };

  /* ========================================================
     CHANGE REVIEWER STATUS
  ======================================================== */

  const changeReviewerStatus =
    async (
      reviewer: Reviewer
    ) => {
      const current =
        normalizeReviewerStatus(
          reviewer.status
        );

      const next =
        current === "active"
          ? "inactive"
          : "active";

      const action =
        next === "active"
          ? "activate"
          : "deactivate";

      const confirmed =
        window.confirm(
          `Are you sure you want to ${action} ${getName(
            reviewer
          )}?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setProcessingId(
          reviewer.id
        );

        setError("");
        setSuccess("");

        await updateDoc(
          doc(
            firestore,
            "reviewer",
            reviewer.id
          ),
          {
            status: next,
            updatedAt:
              serverTimestamp(),
          }
        );

        setSuccess(
          `${getName(
            reviewer
          )} has been ${next}.`
        );

        await loadData();
      } catch (err) {
        console.error(
          "REVIEWERS: Status update error:",
          err
        );

        setError(
          "Unable to update reviewer status."
        );
      } finally {
        setProcessingId("");
      }
    };

  /* ========================================================
     LOGOUT
  ======================================================== */

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

  /* ========================================================
     NAVIGATION
  ======================================================== */

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

      // case "Pending Review":
      //   router.push(
      //     "/admin/submissions?status=pending"
      //   );
      //   break;

      // case "Revision Required":
      //   router.push(
      //     "/admin/submissions?status=revision_required"
      //   );
      //   break;

      // case "Accepted":
      //   router.push(
      //     "/admin/submissions?status=accepted"
      //   );
      //   break;

      case "Reviewers":
        router.push(
          "/admin/reviewers"
        );
        break;

      // case "Assignments":
      //   router.push(
      //     "/admin/assignments"
      //   );
      //   break;

      // case "Applications":
      //   router.push(
      //     "/admin/applications/reviewers"
      //   );
      //   break;

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

      // case "Volumes":
      //   router.push(
      //     "/admin/journal/volumes"
      //   );
      //   break;

      // case "Settings":
      //   router.push(
      //     "/admin/settings"
      //   );
      //   break;

      default:
        break;
    }
  };

  /* ========================================================
     AUTH ERROR
  ======================================================== */

  if (
    !authLoading &&
    error &&
    !applications.length &&
    !reviewers.length
  ) {
    return (
      <main className="min-h-[100dvh] bg-[#f7f7f7] flex items-center justify-center px-6">

        <div className="w-full max-w-lg bg-white border border-[#e5e5e5] rounded-2xl p-7 shadow-xl">

          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mb-5">
            <AlertCircle
              size={24}
            />
          </div>

          <p className="text-[10px] uppercase tracking-[0.2em] font-semibold !text-[#244e70]">
            Administrator Access
          </p>

          <h1 className="!text-[#111111] text-2xl font-semibold mt-2">
            Unable to load reviewers
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
              onClick={async () => {
                await signOut(
                  auth
                );

                router.replace(
                  "/login"
                );
              }}
              className="flex-1 h-11 rounded-xl border border-[#d8d8d8] text-[#5e5145] text-sm font-semibold hover:bg-[#f7f7f7] transition"
            >
              Back to login
            </button>

          </div>

        </div>

      </main>
    );
  }

  /* ========================================================
     LOADING
  ======================================================== */

  if (
    authLoading ||
    loading
  ) {
    return (
      <main className="min-h-[100dvh] bg-[#f7f7f7] flex items-center justify-center">

        <div className="text-center">

          <div className="w-12 h-12 rounded-xl bg-[#244e70] text-white flex items-center justify-center mx-auto animate-pulse">

            <Users size={21} />

          </div>

          <p className="!text-[#666666] text-sm mt-4">
            Loading reviewer management...
          </p>

        </div>

      </main>
    );
  }

  /* ========================================================
     MAIN UI
  ======================================================== */

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

        {/* SIDEBAR HEADER */}

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
                          size={
                            13
                          }
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
                  (prev) =>
                    !prev
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
                Reviewer Management
              </h2>

              <p className="!text-[#888888] text-[11px] mt-0.5">
                Reviewer Administration
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

          {/* MOBILE TITLE */}

          <div className="lg:hidden mb-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="!text-[#888888] text-xs">
                  Reviewer Administration
                </p>

                <h2 className="!text-[#111111] text-2xl font-semibold mt-1">
                  Reviewer Management
                </h2>

              </div>

              <button
                onClick={
                  loadData
                }
                disabled={
                  loading
                }
                className="w-10 h-10 rounded-xl border border-[#ddd5cc] bg-white flex items-center justify-center !text-[#66594d] hover:bg-[#faf7f3] transition disabled:opacity-50"
              >

                <RefreshCw
                  size={16}
                  className={
                    loading
                      ? "animate-spin"
                      : ""
                  }
                />

              </button>

            </div>

          </div>

          {/* ==================================================
              INTRO
          ================================================== */}

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">

            <div>

              <div className="flex items-center gap-3">

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
                  Reviewer Management
                </h2>

              </div>

              <p className="!text-[#666666] text-sm mt-1.5">
                Review applications and manage active reviewers.
              </p>

            </div>

            <button
              onClick={
                loadData
              }
              disabled={
                loading
              }
              className="hidden sm:flex h-9 px-3 rounded-lg border border-[#ddd5cc] bg-white items-center justify-center gap-2 !text-[#66594d] text-xs hover:bg-[#faf7f3] transition disabled:opacity-50"
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

          {/* ==================================================
              ALERTS
          ================================================== */}

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-2.5">

              <AlertCircle
                size={16}
                className="text-red-500 shrink-0 mt-0.5"
              />

              <div className="flex-1">

                <p className="!text-red-700 text-xs font-medium">
                  {error}
                </p>

              </div>

              <button
                onClick={() =>
                  setError("")
                }
                className="!text-red-500"
              >
                <X size={15} />
              </button>

            </div>
          )}

          {success && (
            <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 flex items-start gap-2.5">

              <Check
                size={16}
                className="text-green-600 shrink-0 mt-0.5"
              />

              <div className="flex-1">

                <p className="!text-green-700 text-xs font-medium">
                  {success}
                </p>

              </div>

              <button
                onClick={() =>
                  setSuccess("")
                }
                className="!text-green-600"
              >
                <X size={15} />
              </button>

            </div>
          )}

          {/* ==================================================
              STATISTICS
          ================================================== */}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">

            <ReviewerStat
              label="Pending"
              value={
                pendingCount
              }
              icon={Clock3}
              iconClass="bg-[#fff7e8] text-[#9a6b22]"
            />

            <ReviewerStat
              label="Approved"
              value={
                approvedCount
              }
              icon={
                ShieldCheck
              }
              iconClass="bg-green-50 text-green-600"
            />

            <ReviewerStat
              label="Rejected"
              value={
                rejectedCount
              }
              icon={UserX}
              iconClass="bg-red-50 text-red-600"
            />

            <ReviewerStat
              label="Active Reviewers"
              value={
                activeReviewerCount
              }
              icon={
                UserCheck
              }
              iconClass="bg-[#eef3f7] text-[#244e70]"
            />

          </div>

          {/* ==================================================
              TABS / SEARCH
          ================================================== */}

          <section className="bg-white border border-[#e5e5e5] rounded-2xl p-3 mb-5">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

              <div className="flex gap-1.5">

                <button
                  onClick={() => {
                    setTab(
                      "applications"
                    );
                    setSearch(
                      ""
                    );
                  }}
                  className={`
                    px-4
                    py-2.5
                    rounded-lg
                    text-xs
                    font-semibold
                    transition
                    ${
                      tab ===
                      "applications"
                        ? "bg-[#244e70] text-white"
                        : "text-[#766e65] hover:bg-[#f7f7f7]"
                    }
                  `}
                >

                  Applications

                  <span className="ml-1.5 opacity-60">
                    {applications.length}
                  </span>

                </button>

                <button
                  onClick={() => {
                    setTab(
                      "reviewers"
                    );
                    setSearch(
                      ""
                    );
                  }}
                  className={`
                    px-4
                    py-2.5
                    rounded-lg
                    text-xs
                    font-semibold
                    transition
                    ${
                      tab ===
                      "reviewers"
                        ? "bg-[#244e70] text-white"
                        : "text-[#766e65] hover:bg-[#f7f7f7]"
                    }
                  `}
                >

                  Active Reviewers

                  <span className="ml-1.5 opacity-60">
                    {reviewers.length}
                  </span>

                </button>

              </div>

              <div className="relative w-full md:w-[330px]">

                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 !text-[#aaa098]"
                />

                <input
                  value={
                    search
                  }
                  onChange={(
                    event
                  ) =>
                    setSearch(
                      event
                        .target
                        .value
                    )
                  }
                  placeholder={
                    tab ===
                    "applications"
                      ? "Search applications..."
                      : "Search reviewers..."
                  }
                  className="w-full h-9 rounded-lg border border-[#e1d9cf] bg-[#fcfaf8] pl-9 pr-3 text-xs !text-[#302a25] outline-none focus:border-[#244e70] focus:ring-2 focus:ring-[#244e70]/10"
                />

              </div>

            </div>

          </section>

          {/* ==================================================
              APPLICATION LIST
          ================================================== */}

          {tab ===
            "applications" && (
            <div className="space-y-3">

              {filteredApplications.length ===
              0 ? (
                <EmptyState
                  title="No applications found"
                  description="There are no reviewer applications matching your search."
                  icon={Users}
                />
              ) : (
                filteredApplications.map(
                  (
                    application
                  ) => {
                    const status =
                      normalizeStatus(
                        application.status
                      );

                    const isProcessing =
                      processingId ===
                      application.id;

                    return (
                      <div
                        key={
                          application.id
                        }
                        className="bg-white border border-[#e5e5e5] rounded-2xl p-4 md:p-5 hover:shadow-md hover:shadow-black/5 transition"
                      >

                        <div className="flex flex-col xl:flex-row xl:items-center gap-4">

                          {/* PERSON */}

                          <div className="flex items-start gap-3 flex-1 min-w-0">

                            <div className="w-10 h-10 rounded-xl bg-[#244e70] text-white flex items-center justify-center font-semibold text-sm shrink-0">
                              {getName(
                                application
                              )
                                .charAt(
                                  0
                                )
                                .toUpperCase()}
                            </div>

                            <div className="min-w-0">

                              <div className="flex flex-wrap items-center gap-2">

                                <h3 className="!text-[#302a25] text-sm font-semibold">
                                  {getName(
                                    application
                                  )}
                                </h3>

                                <StatusBadge
                                  status={
                                    status
                                  }
                                />

                              </div>

                              <p className="!text-[#8a8179] text-xs mt-0.5">
                                {application.designation ||
                                  "Designation not provided"}
                              </p>

                              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">

                                <span className="flex items-center gap-1.5 !text-[#766e65] text-[10px]">
                                  <Mail
                                    size={
                                      12
                                    }
                                  />

                                  {getEmail(
                                    application
                                  )}
                                </span>

                                <span className="!text-[#766e65] text-[10px]">
                                  {application.affiliation ||
                                    "Affiliation not provided"}
                                </span>

                              </div>

                            </div>

                          </div>

                          {/* DATE */}

                          <div className="xl:w-[115px]">

                            <p className="!text-[#aaa098] text-[9px] uppercase tracking-wider">
                              Applied
                            </p>

                            <p className="!text-[#5f5750] text-xs mt-1">
                              {formatDate(
                                application.submittedAt
                              )}
                            </p>

                          </div>

                          {/* ACTIONS */}

                          <div className="flex items-center gap-1.5">

                            <button
                              onClick={() =>
                                setSelectedApplication(
                                  application
                                )
                              }
                              className="h-8 px-3 rounded-lg border border-[#e1d9cf] !text-[#655c54] text-[10px] font-medium hover:bg-[#faf7f3] transition flex items-center gap-1.5"
                            >
                              View
                              <ChevronRight
                                size={
                                  13
                                }
                              />
                            </button>

                            {status ===
                              "pending" && (
                              <>
                                <button
                                  disabled={
                                    isProcessing
                                  }
                                  onClick={() =>
                                    approveApplication(
                                      application
                                    )
                                  }
                                  className="h-8 px-3 rounded-lg bg-[#244e70] text-white text-[10px] font-semibold hover:bg-[#1b3a54] transition disabled:opacity-50"
                                >
                                  {isProcessing
                                    ? "Processing..."
                                    : "Approve"}
                                </button>

                                <button
                                  disabled={
                                    isProcessing
                                  }
                                  onClick={() =>
                                    rejectApplication(
                                      application
                                    )
                                  }
                                  className="h-8 px-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-[10px] font-semibold hover:bg-red-100 transition disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              </>
                            )}

                          </div>

                        </div>

                      </div>
                    );
                  }
                )
              )}

            </div>
          )}

          {/* ==================================================
              REVIEWERS LIST
          ================================================== */}

          {tab ===
            "reviewers" && (
            <div className="space-y-3">

              {filteredReviewers.length ===
              0 ? (
                <EmptyState
                  title="No reviewers found"
                  description="No reviewers match your search."
                  icon={
                    UserCheck
                  }
                />
              ) : (
                filteredReviewers.map(
                  (reviewer) => {
                    const status =
                      normalizeReviewerStatus(
                        reviewer.status
                      );

                    const isProcessing =
                      processingId ===
                      reviewer.id;

                    return (
                      <div
                        key={
                          reviewer.id
                        }
                        className="bg-white border border-[#e5e5e5] rounded-2xl p-4 md:p-5"
                      >

                        <div className="flex flex-col xl:flex-row xl:items-center gap-4">

                          <div className="flex items-start gap-3 flex-1">

                            <div className="w-10 h-10 rounded-xl bg-[#2f6f54] text-white flex items-center justify-center font-semibold text-sm shrink-0">
                              {getName(
                                reviewer
                              )
                                .charAt(
                                  0
                                )
                                .toUpperCase()}
                            </div>

                            <div>

                              <div className="flex flex-wrap items-center gap-2">

                                <h3 className="!text-[#302a25] text-sm font-semibold">
                                  {getName(
                                    reviewer
                                  )}
                                </h3>

                                <StatusBadge
                                  status={
                                    status
                                  }
                                />

                              </div>

                              <p className="!text-[#8a8179] text-xs mt-0.5">
                                {reviewer.designation ||
                                  "Designation not provided"}
                              </p>

                              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">

                                <span className="flex items-center gap-1.5 !text-[#766e65] text-[10px]">
                                  <Mail
                                    size={
                                      12
                                    }
                                  />

                                  {getEmail(
                                    reviewer
                                  )}
                                </span>

                                <span className="!text-[#766e65] text-[10px]">
                                  {reviewer.affiliation ||
                                    "Affiliation not provided"}
                                </span>

                              </div>

                              {reviewer.uid && (
                                <p className="!text-[#aaa098] text-[9px] mt-1.5 font-mono">
                                  UID:{" "}
                                  {
                                    reviewer.uid
                                  }
                                </p>
                              )}

                            </div>

                          </div>

                          <button
                            disabled={
                              isProcessing
                            }
                            onClick={() =>
                              changeReviewerStatus(
                                reviewer
                              )
                            }
                            className={`
                              h-8
                              px-3
                              rounded-lg
                              text-[10px]
                              font-semibold
                              transition
                              disabled:opacity-50
                              ${
                                status ===
                                "active"
                                  ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                                  : "bg-[#244e70] text-white hover:bg-[#1b3a54]"
                              }
                            `}
                          >

                            {isProcessing
                              ? "Updating..."
                              : status ===
                                "active"
                              ? "Deactivate"
                              : "Activate"}

                          </button>

                        </div>

                      </div>
                    );
                  }
                )
              )}

            </div>
          )}

        </div>

      </div>

      {/* ======================================================
          APPLICATION MODAL
      ====================================================== */}

      {selectedApplication && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onMouseDown={(
            event
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedApplication(
                null
              );
            }
          }}
        >

          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">

            {/* HEADER */}

            <div className="sticky top-0 z-10 bg-white border-b border-[#e5ddd3] px-5 py-4 flex items-center justify-between">

              <div>

                <p className="!text-[#244e70] text-[9px] uppercase tracking-[0.2em] font-semibold">
                  Reviewer Application
                </p>

                <h2 className="!text-[#302a25] text-lg font-semibold mt-1">
                  {getName(
                    selectedApplication
                  )}
                </h2>

              </div>

              <button
                onClick={() =>
                  setSelectedApplication(
                    null
                  )
                }
                className="w-8 h-8 rounded-lg border border-[#e5ddd3] flex items-center justify-center !text-[#766e65] hover:bg-[#faf7f3]"
              >
                <X size={16} />
              </button>

            </div>

            {/* BODY */}

            <div className="p-5 space-y-5">

              <div className="grid sm:grid-cols-2 gap-3">

                <DetailBox
                  label="Name"
                  value={getName(
                    selectedApplication
                  )}
                />

                <DetailBox
                  label="Email"
                  value={getEmail(
                    selectedApplication
                  )}
                />

                <DetailBox
                  label="Phone"
                  value={
                    selectedApplication.phone ||
                    "Not provided"
                  }
                />

                <DetailBox
                  label="Designation"
                  value={
                    selectedApplication.designation ||
                    "Not provided"
                  }
                />

              </div>

              <div>

                <p className="!text-[#8f857b] text-[9px] uppercase tracking-[0.15em] font-semibold mb-2">
                  Affiliation
                </p>

                <div className="rounded-xl border border-[#e5ddd3] p-3.5">

                  <p className="!text-[#514941] text-xs">
                    {selectedApplication.affiliation ||
                      "Not provided"}
                  </p>

                </div>

              </div>

              <div>

                <p className="!text-[#8f857b] text-[9px] uppercase tracking-[0.15em] font-semibold mb-2">
                  Areas of Expertise
                </p>

                <div className="flex flex-wrap gap-1.5">

                  {selectedApplication
                    .expertise
                    ?.length ? (
                    selectedApplication.expertise.map(
                      (
                        item
                      ) => (
                        <span
                          key={
                            item
                          }
                          className="px-2.5 py-1 rounded-full bg-[#eef3f7] text-[#365a75] text-[10px] font-medium"
                        >
                          {
                            item
                          }
                        </span>
                      )
                    )
                  ) : (
                    <span className="!text-[#8a8179] text-xs">
                      No expertise provided
                    </span>
                  )}

                </div>

              </div>

              <div className="grid sm:grid-cols-2 gap-3">

                <DetailBox
                  label="Application Status"
                  value={normalizeStatus(
                    selectedApplication.status
                  )}
                />

                <DetailBox
                  label="Submitted"
                  value={formatDate(
                    selectedApplication.submittedAt
                  )}
                />

              </div>

            </div>

            {/* FOOTER */}

            {normalizeStatus(
              selectedApplication.status
            ) ===
              "pending" && (
              <div className="sticky bottom-0 bg-white border-t border-[#e5ddd3] px-5 py-4 flex flex-col sm:flex-row sm:justify-end gap-2">

                <button
                  disabled={
                    processingId ===
                    selectedApplication.id
                  }
                  onClick={() =>
                    rejectApplication(
                      selectedApplication
                    )
                  }
                  className="h-9 px-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs font-semibold hover:bg-red-100 disabled:opacity-50"
                >
                  Reject Application
                </button>

                <button
                  disabled={
                    processingId ===
                    selectedApplication.id
                  }
                  onClick={() =>
                    approveApplication(
                      selectedApplication
                    )
                  }
                  className="h-9 px-4 rounded-lg bg-[#244e70] text-white text-xs font-semibold hover:bg-[#1b3a54] disabled:opacity-50"
                >
                  {processingId ===
                  selectedApplication.id
                    ? "Processing..."
                    : "Approve & Create Account"}
                </button>

              </div>
            )}

          </div>

        </div>
      )}

    </main>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function ReviewerStat({
  label,
  value,
  icon: Icon,
  iconClass,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  iconClass: string;
}) {
  return (
    <div className="bg-white border border-[#e5e5e5] rounded-xl p-4">

      <div className="flex items-start justify-between gap-2">

        <div>

          <p className="!text-[#888078] text-[10px]">
            {label}
          </p>

          <p className="!text-[#111111] text-2xl leading-7 font-medium mt-1.5">
            {value}
          </p>

        </div>

        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconClass}`}
        >
          <Icon
            size={16}
            strokeWidth={1.8}
          />
        </div>

      </div>

    </div>
  );
}

/* ============================================================
   STATUS BADGE
============================================================ */

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const config: Record<
    string,
    string
  > = {
    pending:
      "bg-amber-50 text-amber-700",
    approved:
      "bg-green-50 text-green-700",
    rejected:
      "bg-red-50 text-red-700",
    active:
      "bg-green-50 text-green-700",
    inactive:
      "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`
        px-2
        py-0.5
        rounded-full
        text-[9px]
        font-semibold
        ${
          config[status] ||
          "bg-gray-100 text-gray-600"
        }
      `}
    >
      {status}
    </span>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyState({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <div className="bg-white border border-[#e5e5e5] rounded-2xl py-14 px-6 text-center">

      <div className="w-12 h-12 rounded-xl bg-[#eef3f7] text-[#244e70] flex items-center justify-center mx-auto">

        <Icon size={20} />

      </div>

      <h2 className="!text-[#302a25] text-sm font-semibold mt-4">
        {title}
      </h2>

      <p className="!text-[#8a8179] text-xs mt-2">
        {description}
      </p>

    </div>
  );
}

/* ============================================================
   DETAIL BOX
============================================================ */

function DetailBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-[#faf8f5] border border-[#eee6dd] p-3.5">

      <p className="!text-[#9a9188] text-[9px] uppercase tracking-wider">
        {label}
      </p>

      <p className="!text-[#302a25] text-xs font-semibold mt-1.5 break-words">
        {value}
      </p>

    </div>
  );
}