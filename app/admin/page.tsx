"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  onAuthStateChanged,
  signOut,
  User,
} from "firebase/auth";

import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  query,
  where,
  limit,
  getDocs,
} from "firebase/firestore";

import {
  LayoutDashboard,
  FileText,
  Users,
  UserRoundCog,
  ClipboardCheck,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Clock3,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import { auth, firestore } from "@/lib/firebase";

type AdminProfile = {
  uid?: string;
  email?: string;
  name?: string;
  role?: string;
  status?: string;
};

type Stats = {
  submissions: number;
  underReview: number;
  applications: number;
  reviewers: number;
  editors: number;
  published: number;
};

type MenuItem = {
  label: string;
  icon: React.ElementType;
  section?: string;
};

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

export default function AdminPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);

  const [profile, setProfile] =
    useState<AdminProfile | null>(null);

  const [stats, setStats] = useState<Stats>({
    submissions: 0,
    underReview: 0,
    applications: 0,
    reviewers: 0,
    editors: 0,
    published: 0,
  });

  const [activeMenu, setActiveMenu] =
    useState("Dashboard");

  const [loading, setLoading] = useState(true);

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [error, setError] = useState("");

  /*
   * ============================================================
   * AUTHENTICATION + ADMIN AUTHORIZATION
   * ============================================================
   */

  useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        console.log(
          "ADMIN: Auth state changed:",
          currentUser?.email
        );

        if (!currentUser) {
          router.replace("/login");
          return;
        }

        if (!mounted) return;

        setUser(currentUser);

        try {
          /*
           * ----------------------------------------------------
           * STEP 1
           * Check admin document using Firebase UID
           * ----------------------------------------------------
           */

          const adminRef = doc(
            firestore,
            "admin",
            currentUser.uid
          );

          const adminSnapshot =
            await getDoc(adminRef);

          let adminData: AdminProfile | null =
            null;

          if (adminSnapshot.exists()) {
            adminData =
              adminSnapshot.data() as AdminProfile;
          }

          /*
           * ----------------------------------------------------
           * STEP 2
           * Fallback: search admin by email
           * ----------------------------------------------------
           */

          if (!adminData && currentUser.email) {
            const adminQuery = query(
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
              await getDocs(adminQuery);

            if (!adminQuerySnapshot.empty) {
              adminData =
                adminQuerySnapshot.docs[0]
                  .data() as AdminProfile;
            }
          }

          /*
           * ----------------------------------------------------
           * STEP 3
           * No admin record
           * ----------------------------------------------------
           */

          if (!adminData) {
            setError(
              "Your Firebase account is authenticated, but no administrator record was found in Firestore."
            );

            setLoading(false);
            return;
          }

          /*
           * ----------------------------------------------------
           * STEP 4
           * Check admin status
           * ----------------------------------------------------
           */

          if (
            adminData.status &&
            adminData.status !== "active"
          ) {
            setError(
              "Your administrator account is currently inactive."
            );

            setLoading(false);
            return;
          }

          /*
           * ----------------------------------------------------
           * SUCCESS
           * ----------------------------------------------------
           */

          setProfile(adminData);

          await loadDashboardStats();

          if (!mounted) return;

          setLoading(false);
        } catch (err) {
          console.error(
            "ADMIN: Authorization error:",
            err
          );

          if (!mounted) return;

          setError(
            "Unable to verify administrator access. Check your Firestore permissions and configuration."
          );

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
   * DASHBOARD STATISTICS
   * ============================================================
   */

  const loadDashboardStats = async () => {
    try {
      const submissionsSnapshot =
        await getCountFromServer(
          collection(
            firestore,
            "submissions"
          )
        );

      const assignmentsSnapshot =
        await getCountFromServer(
          collection(
            firestore,
            "reviewAssignments"
          )
        );

      const applicationsSnapshot =
        await getCountFromServer(
          collection(
            firestore,
            "applications"
          )
        );

      const reviewersSnapshot =
        await getCountFromServer(
          collection(
            firestore,
            "reviewers"
          )
        );

      const editorsSnapshot =
        await getCountFromServer(
          collection(
            firestore,
            "editors"
          )
        );

      const journalSnapshot =
        await getCountFromServer(
          collection(
            firestore,
            "journal"
          )
        );

      setStats({
        submissions:
          submissionsSnapshot.data().count,

        underReview:
          assignmentsSnapshot.data().count,

        applications:
          applicationsSnapshot.data().count,

        reviewers:
          reviewersSnapshot.data().count,

        editors:
          editorsSnapshot.data().count,

        published:
          journalSnapshot.data().count,
      });
    } catch (err) {
      console.error(
        "ADMIN: Statistics error:",
        err
      );

      setStats({
        submissions: 0,
        underReview: 0,
        applications: 0,
        reviewers: 0,
        editors: 0,
        published: 0,
      });
    }
  };

  /*
   * ============================================================
   * LOGOUT
   * ============================================================
   */

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      await signOut(auth);

      router.replace("/login");
    } catch (err) {
      console.error(
        "ADMIN: Logout error:",
        err
      );

      router.replace("/login");
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
   * ============================================================
   * LOADING SCREEN
   * ============================================================
   */

  if (loading) {
    return (
      <main className="min-h-[100dvh] bg-[#f7f7f7] flex items-center justify-center px-6">

        <div className="text-center">

          <div className="w-12 h-12 rounded-xl bg-[#244e70] text-white flex items-center justify-center mx-auto mb-4 shadow-md">

            <span className="text-xl font-bold">
              J
            </span>

          </div>

          <h2 className="!text-[#111111] text-lg font-semibold">
            Loading Admin Dashboard
          </h2>

          <p className="!text-[#666666] text-xs mt-2">
            Verifying administrator access...
          </p>

          <div className="mt-5 w-36 h-1 bg-[#e5e5e5] rounded-full overflow-hidden mx-auto">

            <div className="h-full w-1/2 bg-[#244e70] rounded-full animate-pulse" />

          </div>

        </div>

      </main>
    );
  }

  /*
   * ============================================================
   * AUTHORIZATION ERROR
   * ============================================================
   */

  if (error) {
    return (
      <main className="min-h-[100dvh] bg-[#f7f7f7] flex items-center justify-center px-6">

        <div className="w-full max-w-lg bg-white border border-[#e5e5e5] rounded-2xl p-7 shadow-xl shadow-[#111111]/5">

          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mb-5">

            <AlertCircle size={24} />

          </div>

          <p className="text-[10px] uppercase tracking-[0.2em] font-semibold !text-[#244e70]">
            Administrator Access
          </p>

          <h1 className="!text-[#111111] text-2xl font-semibold mt-2">
            Access verification failed
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

              <p className="!text-[#888888] text-[11px] mt-3">
                Firebase UID
              </p>

              <p className="!text-[#666666] text-xs mt-1 break-all font-mono">
                {user.uid}
              </p>

            </div>
          )}

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
   * ============================================================
   * MAIN ADMIN DASHBOARD
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

        {/* Sidebar header */}

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

        <nav className="px-2.5 py-4 overflow-y-auto h-[calc(100%-125px)] scrollbar-thin">

          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.label}>

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
          })}

        </nav>

        {/* Sidebar footer */}

        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 p-2.5">

          <button
            onClick={handleLogout}
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
            DESKTOP TOP BAR
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
                Dashboard
              </h2>

              <p className="!text-[#888888] text-[11px] mt-0.5">
                Admin Management
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

              {(profile?.name ||
                "A")
                .charAt(0)
                .toUpperCase()}

            </div>

          </div>

        </header>

        {/* ======================================================
            CONTENT
        ====================================================== */}

        <div className="px-7 py-7 max-w-[1200px] mx-auto">

          {/* Mobile heading */}

          <div className="lg:hidden mb-6">

            <p className="!text-[#888888] text-xs">
              Editorial Management
            </p>

            <h1 className="!text-[#111111] text-2xl font-semibold mt-1">
              Dashboard
            </h1>

          </div>

          {/* ====================================================
              GREETING
          ==================================================== */}

          <div className="mb-7">

            <h2 className="!text-[#111111] text-[26px] leading-8 font-medium">
              Welcome back
              {profile?.name
                ? `, ${profile.name}`
                : ""}
            </h2>

            <p className="!text-[#666666] text-sm mt-1.5">
              Here's what's happening
              across the JFER editorial
              system.
            </p>

          </div>

          {/* ====================================================
              STATISTICS
          ==================================================== */}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">

            <StatCard
              title="Total Submissions"
              value={stats.submissions}
              icon={FileText}
              description="All submitted papers"
            />

            <StatCard
              title="Under Review"
              value={stats.underReview}
              icon={ClipboardCheck}
              description="Active review assignments"
            />

            <StatCard
              title="Applications"
              value={stats.applications}
              icon={UserPlus}
              description="Reviewer & editor applications"
            />

            <StatCard
              title="Reviewers"
              value={stats.reviewers}
              icon={Users}
              description="Registered reviewers"
            />

            <StatCard
              title="Editors"
              value={stats.editors}
              icon={UserRoundCog}
              description="Registered editors"
            />

            <StatCard
              title="Published Papers"
              value={stats.published}
              icon={BookOpen}
              description="Published journal papers"
            />

          </div>

          {/* ====================================================
              QUICK ACTIONS
          ==================================================== */}

          <section className="mt-7">

            <div className="mb-3">

              <h3 className="!text-[#111111] text-[17px] font-medium">
                Quick actions
              </h3>

              <p className="!text-[#666666] text-xs mt-1">
                Common editorial tasks
              </p>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">

              <QuickAction
                title="Review submissions"
                description="View incoming papers"
                icon={FileText}
                onClick={() =>
                  handleNavigation(
                    "All Submissions"
                  )
                }
              />

              <QuickAction
                title="Assign reviewers"
                description="Manage paper assignments"
                icon={ClipboardCheck}
                onClick={() =>
                  handleNavigation(
                    "Assignments"
                  )
                }
              />

              <QuickAction
                title="Applications"
                description="Review new applications"
                icon={UserPlus}
                onClick={() =>
                  handleNavigation(
                    "Applications"
                  )
                }
              />

              <QuickAction
                title="Editorial board"
                description="Manage board members"
                icon={Users}
                onClick={() =>
                  handleNavigation(
                    "Editorial Board"
                  )
                }
              />

            </div>

          </section>

          {/* ====================================================
              WORKFLOW
          ==================================================== */}

          <section className="mt-7 bg-white rounded-2xl border border-[#e5e5e5] p-5">

            <div className="mb-5">

              <h3 className="!text-[#111111] text-[17px] font-medium">
                Editorial workflow
              </h3>

              <p className="!text-[#666666] text-xs mt-1">
                How a submitted paper moves
                through JFER
              </p>

            </div>

            <div className="grid md:grid-cols-5 gap-2.5">

              <WorkflowStep
                number="01"
                title="Submission"
                description="Paper received"
              />

              <WorkflowStep
                number="02"
                title="Assignment"
                description="Reviewer selected"
              />

              <WorkflowStep
                number="03"
                title="Review"
                description="Reviewer comments"
              />

              <WorkflowStep
                number="04"
                title="Decision"
                description="Editorial decision"
              />

              <WorkflowStep
                number="05"
                title="Publication"
                description="Added to journal"
              />

            </div>

          </section>

        </div>

      </div>

    </main>
  );
}

/*
 * ==============================================================
 * STAT CARD
 * ==============================================================
 */

function StatCard({
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
 * ==============================================================
 * QUICK ACTION
 * ==============================================================
 */

function QuickAction({
  title,
  description,
  icon: Icon,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group text-left bg-white border border-[#e5e5e5] rounded-2xl p-4 hover:border-[#9fb4c4] hover:shadow-md hover:shadow-[#111111]/5 transition-all duration-300"
    >

      <div className="flex items-center justify-between">

        <div className="w-9 h-9 rounded-xl bg-[#eef3f7] text-[#244e70] flex items-center justify-center">

          <Icon
            size={17}
            strokeWidth={1.7}
          />

        </div>

        <ChevronRight
          size={15}
          className="!text-[#999999] group-hover:translate-x-1 group-hover:!text-[#244e70] transition-all"
        />

      </div>

      <h4 className="!text-[#111111] text-sm font-semibold mt-4">
        {title}
      </h4>

      <p className="!text-[#777777] text-xs mt-1">
        {description}
      </p>

    </button>
  );
}

/*
 * ==============================================================
 * WORKFLOW STEP
 * ==============================================================
 */

function WorkflowStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="relative bg-[#f7f7f7] border border-[#e7e7e7] rounded-xl p-4">

      <span className="text-[10px] font-bold !text-[#a68c6b]">
        {number}
      </span>

      <h4 className="!text-[#111111] text-sm font-semibold mt-2">
        {title}
      </h4>

      <p className="!text-[#777777] text-[10px] mt-1">
        {description}
      </p>

    </div>
  );
}