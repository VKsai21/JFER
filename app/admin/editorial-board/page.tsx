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
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  addDoc,
  where,
  limit,
} from "firebase/firestore";

import {
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  UserRound,
  ShieldCheck,
  Users,
  GraduationCap,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  LayoutDashboard,
  FileText,
  UserPlus,
  ClipboardCheck,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  ChevronRight,
  Clock3,
  AlertCircle,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import { auth, firestore } from "@/lib/firebase";

/*
 * ==============================================================
 * TYPES
 * ==============================================================
 */

type EditorialRole =
  | "editorInChief"
  | "associateEditor"
  | "advisoryBoard";

type BoardMember = {
  id: string;
  role: EditorialRole;
  name: string;
  designation: string;
  affiliation: string;
  country: string;
  expertise: string[];
  imageUrl: string;
  status: "active" | "inactive";
  displayOrder: number;
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
 * ==============================================================
 * ROLE LABELS
 * ==============================================================
 */

const roleLabels: Record<
  EditorialRole,
  string
> = {
  editorInChief: "Editor-in-Chief",
  associateEditor: "Associate Editor",
  advisoryBoard: "Advisory Board",
};

/*
 * ==============================================================
 * EMPTY FORM
 * ==============================================================
 */

const emptyForm = {
  role: "associateEditor" as EditorialRole,
  name: "",
  designation: "",
  affiliation: "",
  country: "",
  expertise: "",
  imageUrl: "",
  status: "active" as
    | "active"
    | "inactive",
  displayOrder: 1,
};

/*
 * ==============================================================
 * PAGE
 * ==============================================================
 */

export default function EditorialBoardPage() {
  const router = useRouter();

  /*
   * ------------------------------------------------------------
   * AUTH
   * ------------------------------------------------------------
   */

  const [user, setUser] =
    useState<User | null>(null);

  const [profile, setProfile] =
    useState<AdminProfile | null>(null);

  const [authLoading, setAuthLoading] =
    useState(true);

  /*
   * ------------------------------------------------------------
   * SIDEBAR
   * ------------------------------------------------------------
   */

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [activeMenu, setActiveMenu] =
    useState("Editorial Board");

  /*
   * ------------------------------------------------------------
   * DATA
   * ------------------------------------------------------------
   */

  const [members, setMembers] =
    useState<BoardMember[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  /*
   * ------------------------------------------------------------
   * FORM
   * ------------------------------------------------------------
   */

  const [showForm, setShowForm] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [form, setForm] =
    useState(emptyForm);

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
   * AUTHENTICATION + ADMIN AUTHORIZATION
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
             * Fallback to email
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

            /*
             * No admin record
             */

            if (!adminData) {
              setError(
                "Your Firebase account is authenticated, but no administrator record was found in Firestore."
              );

              setAuthLoading(false);
              setLoading(false);

              return;
            }

            /*
             * Inactive admin
             */

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
              "EDITORIAL BOARD AUTH ERROR:",
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
   * LOAD BOARD
   * ============================================================
   */

  const loadMembers = async () => {
    try {
      setLoading(true);
      setError("");

      const q = query(
        collection(
          firestore,
          "editorialBoard"
        ),
        orderBy(
          "displayOrder",
          "asc"
        )
      );

      const snapshot =
        await getDocs(q);

      const data: BoardMember[] =
        snapshot.docs.map(
          (item) => {
            const d = item.data();

            return {
              id: item.id,
              role:
                d.role ??
                "associateEditor",
              name: d.name ?? "",
              designation:
                d.designation ?? "",
              affiliation:
                d.affiliation ?? "",
              country:
                d.country ?? "",
              expertise:
                Array.isArray(
                  d.expertise
                )
                  ? d.expertise
                  : [],
              imageUrl:
                d.imageUrl ?? "",
              status:
                d.status ?? "active",
              displayOrder:
                Number(
                  d.displayOrder ?? 1
                ),
            };
          }
        );

      setMembers(data);
    } catch (err) {
      console.error(
        "EDITORIAL BOARD LOAD ERROR:",
        err
      );

      setError(
        "Unable to load the editorial board. Check your Firestore permissions."
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
      loadMembers();
    }
  }, [
    authLoading,
    error,
  ]);

  /*
   * ============================================================
   * FORM
   * ============================================================
   */

  const openAddForm = () => {
    setEditingId(null);

    setForm({
      ...emptyForm,
      displayOrder:
        members.length + 1,
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const openEditForm = (
    member: BoardMember
  ) => {
    setEditingId(member.id);

    setForm({
      role: member.role,
      name: member.name,
      designation:
        member.designation,
      affiliation:
        member.affiliation,
      country: member.country,
      expertise:
        member.expertise.join(
          ", "
        ),
      imageUrl:
        member.imageUrl,
      status: member.status,
      displayOrder:
        member.displayOrder,
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  /*
   * ============================================================
   * INPUT
   * ============================================================
   */

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
        HTMLSelectElement |
        HTMLTextAreaElement
    >
  ) => {
    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name ===
        "displayOrder"
          ? Number(value)
          : value,
    }));
  };

  /*
   * ============================================================
   * SAVE
   * ============================================================
   */

  const handleSave = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    /*
     * Basic validation
     */

    if (!form.name.trim()) {
      setError(
        "Name is required."
      );
      return;
    }

    if (
      !form.designation.trim()
    ) {
      setError(
        "Designation is required."
      );
      return;
    }

    if (
      !form.affiliation.trim()
    ) {
      setError(
        "Affiliation is required."
      );
      return;
    }

    if (!form.country.trim()) {
      setError(
        "Country is required."
      );
      return;
    }

    /*
     * Only one active Editor-in-Chief
     */

    if (
      form.role ===
        "editorInChief" &&
      form.status === "active"
    ) {
      const existingChief =
        members.find(
          (member) =>
            member.role ===
              "editorInChief" &&
            member.status ===
              "active" &&
            member.id !==
              editingId
        );

      if (existingChief) {
        setError(
          `An active Editor-in-Chief already exists: ${existingChief.name}. Deactivate or edit that member before assigning another Editor-in-Chief.`
        );

        return;
      }
    }

    try {
      setSaving(true);

      const expertiseArray =
        form.expertise
          .split(",")
          .map((item) =>
            item.trim()
          )
          .filter(Boolean);

      const memberData = {
        role: form.role,
        name: form.name.trim(),
        designation:
          form.designation.trim(),
        affiliation:
          form.affiliation.trim(),
        country:
          form.country.trim(),
        expertise:
          expertiseArray,
        imageUrl:
          form.imageUrl.trim(),
        status: form.status,
        displayOrder:
          Number(
            form.displayOrder
          ) || 1,
      };

      /*
       * UPDATE
       */

      if (editingId) {
        await updateDoc(
          doc(
            firestore,
            "editorialBoard",
            editingId
          ),
          {
            ...memberData,
            updatedAt:
              serverTimestamp(),
          }
        );

        setSuccess(
          "Editorial board member updated successfully."
        );
      }

      /*
       * CREATE
       */

      else {
        await addDoc(
          collection(
            firestore,
            "editorialBoard"
          ),
          {
            ...memberData,
            createdAt:
              serverTimestamp(),
            updatedAt:
              serverTimestamp(),
          }
        );

        setSuccess(
          "Editorial board member added successfully."
        );
      }

      await loadMembers();

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
    } catch (err) {
      console.error(
        "EDITORIAL BOARD SAVE ERROR:",
        err
      );

      setError(
        "Unable to save the board member. Check your Firestore permissions."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * ============================================================
   * DELETE
   * ============================================================
   */

  const handleDelete = async (
    member: BoardMember
  ) => {
    const confirmed =
      window.confirm(
        `Remove ${member.name} from the editorial board?`
      );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await deleteDoc(
        doc(
          firestore,
          "editorialBoard",
          member.id
        )
      );

      setSuccess(
        `${member.name} has been removed.`
      );

      await loadMembers();
    } catch (err) {
      console.error(
        "EDITORIAL BOARD DELETE ERROR:",
        err
      );

      setError(
        "Unable to remove the board member. Check your Firestore permissions."
      );
    }
  };

  /*
   * ============================================================
   * TOGGLE STATUS
   * ============================================================
   */

  const toggleStatus = async (
    member: BoardMember
  ) => {
    const newStatus =
      member.status === "active"
        ? "inactive"
        : "active";

    /*
     * Prevent multiple active Editors-in-Chief
     */

    if (
      member.role ===
        "editorInChief" &&
      newStatus === "active"
    ) {
      const existingChief =
        members.find(
          (item) =>
            item.role ===
              "editorInChief" &&
            item.status ===
              "active" &&
            item.id !==
              member.id
        );

      if (existingChief) {
        setError(
          `Cannot activate ${member.name}. ${existingChief.name} is already the active Editor-in-Chief.`
        );

        return;
      }
    }

    try {
      setError("");
      setSuccess("");

      await updateDoc(
        doc(
          firestore,
          "editorialBoard",
          member.id
        ),
        {
          status: newStatus,
          updatedAt:
            serverTimestamp(),
        }
      );

      setSuccess(
        `${member.name} is now ${newStatus}.`
      );

      await loadMembers();
    } catch (err) {
      console.error(
        "EDITORIAL BOARD STATUS ERROR:",
        err
      );

      setError(
        "Unable to change member status."
      );
    }
  };

  /*
   * ============================================================
   * LOGOUT
   * ============================================================
   */

  const handleLogout = async () => {
    try {
      await fetch(
        "/api/auth/logout",
        {
          method: "POST",
        }
      );

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

      case "Publish Papers":
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
   * GROUP MEMBERS
   * ============================================================
   */

  const editorInChief =
    members.filter(
      (member) =>
        member.role ===
        "editorInChief"
    );

  const associateEditors =
    members.filter(
      (member) =>
        member.role ===
        "associateEditor"
    );

  const advisoryBoard =
    members.filter(
      (member) =>
        member.role ===
        "advisoryBoard"
    );

  /*
   * ============================================================
   * MEMBER CARD
   * ============================================================
   */

  const MemberCard = ({
    member,
    featured = false,
  }: {
    member: BoardMember;
    featured?: boolean;
  }) => {
    return (
      <div
        className={`
          group
          relative
          overflow-hidden
          rounded-2xl
          border
          border-[#e5e5e5]
          bg-white
          transition-all
          duration-300
          hover:-translate-y-0.5
          hover:shadow-md
          ${
            featured
              ? "p-5"
              : "p-4"
          }
        `}
      >

        {/* TOP */}

        <div className="flex items-start justify-between gap-3">

          <div className="flex items-center gap-3 min-w-0">

            {member.imageUrl ? (
              <img
                src={member.imageUrl}
                alt={member.name}
                className={`
                  rounded-xl
                  object-cover
                  shrink-0
                  ${
                    featured
                      ? "h-16 w-16"
                      : "h-14 w-14"
                  }
                `}
              />
            ) : (
              <div
                className={`
                  flex
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#eef3f7]
                  text-[#244e70]
                  shrink-0
                  ${
                    featured
                      ? "h-16 w-16"
                      : "h-14 w-14"
                  }
                `}
              >
                <UserRound
                  size={
                    featured
                      ? 25
                      : 21
                  }
                />
              </div>
            )}

            <div className="min-w-0">

              <h3
                className={`
                  font-semibold
                  text-[#2f2924]
                  truncate
                  ${
                    featured
                      ? "text-lg"
                      : "text-sm"
                  }
                `}
              >
                {member.name}
              </h3>

              <p className="mt-0.5 text-xs text-[#8b6b47] truncate">
                {member.designation}
              </p>

            </div>

          </div>

          <span
            className={`
              rounded-full
              px-2
              py-1
              text-[9px]
              font-semibold
              shrink-0
              ${
                member.status ===
                "active"
                  ? "bg-green-50 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }
            `}
          >
            {member.status}
          </span>

        </div>

        {/* DETAILS */}

        <div className="mt-4 space-y-1.5 text-xs">

          <p className="text-[#625b54] line-clamp-2">

            <span className="font-semibold text-[#3d352e]">
              Affiliation:
            </span>{" "}

            {member.affiliation}

          </p>

          <p className="text-[#625b54]">

            <span className="font-semibold text-[#3d352e]">
              Country:
            </span>{" "}

            {member.country}

          </p>

        </div>

        {/* EXPERTISE */}

        {member.expertise.length >
          0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">

            {member.expertise
              .slice(0, 5)
              .map(
                (
                  item,
                  index
                ) => (
                  <span
                    key={`${item}-${index}`}
                    className="rounded-full bg-[#eef3f7] px-2 py-1 text-[9px] text-[#365a75]"
                  >
                    {item}
                  </span>
                )
              )}

            {member.expertise.length >
              5 && (
              <span className="rounded-full bg-[#f5f5f5] px-2 py-1 text-[9px] text-[#777777]">
                +
                {member
                  .expertise
                  .length -
                  5}
              </span>
            )}

          </div>
        )}

        {/* ACTIONS */}

        <div className="mt-4 flex flex-wrap gap-1.5 border-t border-[#eee7df] pt-4">

          <button
            onClick={() =>
              openEditForm(
                member
              )
            }
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#ddd5cc] px-3 py-1.5 text-[10px] font-medium text-[#5e4a38] transition hover:bg-[#f8f3ed]"
          >
            <Pencil size={12} />
            Edit
          </button>

          <button
            onClick={() =>
              toggleStatus(
                member
              )
            }
            className={`
              inline-flex
              items-center
              gap-1.5
              rounded-lg
              px-3
              py-1.5
              text-[10px]
              font-medium
              transition
              ${
                member.status ===
                "active"
                  ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  : "bg-green-50 text-green-700 hover:bg-green-100"
              }
            `}
          >

            {member.status ===
            "active" ? (
              <>
                <XCircle
                  size={12}
                />
                Deactivate
              </>
            ) : (
              <>
                <CheckCircle2
                  size={12}
                />
                Activate
              </>
            )}

          </button>

          <button
            onClick={() =>
              handleDelete(
                member
              )
            }
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-[10px] font-medium text-red-600 transition hover:bg-red-100"
          >
            <Trash2 size={12} />
            Remove
          </button>

        </div>

      </div>
    );
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

            <Users size={21} />

          </div>

          <p className="!text-[#666666] text-sm mt-4">
            Loading editorial board...
          </p>

        </div>

      </main>
    );
  }

  /*
   * ============================================================
   * AUTH ERROR
   * ============================================================
   */

  if (
    error &&
    !members.length
  ) {
    return (
      <main className="min-h-[100dvh] bg-[#f7f7f7] flex items-center justify-center px-6">

        <div className="w-full max-w-lg bg-white border border-[#e5e5e5] rounded-2xl p-7 shadow-xl">

          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mb-5">

            <XCircle size={24} />

          </div>

          <p className="text-[10px] uppercase tracking-[0.2em] font-semibold !text-[#244e70]">
            Administrator Access
          </p>

          <h1 className="!text-[#111111] text-2xl font-semibold mt-2">
            Unable to load editorial board
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

        {/* Footer */}

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
                Editorial Board
              </h2>

              <p className="!text-[#888888] text-[11px] mt-0.5">
                Editorial Management
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

        <div className="px-7 py-6 max-w-[1200px] mx-auto">

          {/* Mobile title */}

          <div className="lg:hidden mb-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="!text-[#888888] text-xs">
                  Editorial Management
                </p>

                <h2 className="!text-[#111111] text-2xl font-semibold mt-1">
                  Editorial Board
                </h2>

              </div>

              <button
                onClick={
                  loadMembers
                }
                disabled={loading}
                className="w-10 h-10 rounded-xl border border-[#ddd5cc] bg-white flex items-center justify-center !text-[#66594d] hover:bg-[#faf7f3] transition"
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

          {/* ====================================================
              PAGE INTRO
          ==================================================== */}

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
                  Editorial Board
                </h2>

              </div>

              <p className="!text-[#666666] text-sm mt-1.5">
                Manage the JFER editorial
                board and its members.
              </p>

            </div>

            <div className="flex gap-2">

              <button
                onClick={
                  loadMembers
                }
                disabled={loading}
                className="hidden sm:inline-flex h-9 px-3 rounded-lg border border-[#ddd5cc] bg-white items-center justify-center gap-2 !text-[#66594d] text-xs hover:bg-[#faf7f3] transition disabled:opacity-50"
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

              <button
                onClick={
                  openAddForm
                }
                className="inline-flex h-9 px-3.5 rounded-lg bg-[#244e70] items-center justify-center gap-2 text-white text-xs font-semibold hover:bg-[#1b3a54] transition"
              >

                <Plus size={14} />

                Add Member

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

            <BoardStat
              icon={ShieldCheck}
              label="Editor-in-Chief"
              value={
                editorInChief.filter(
                  (item) =>
                    item.status ===
                    "active"
                ).length
              }
            />

            <BoardStat
              icon={Users}
              label="Associate Editors"
              value={
                associateEditors.filter(
                  (item) =>
                    item.status ===
                    "active"
                ).length
              }
            />

            <BoardStat
              icon={GraduationCap}
              label="Advisory Board"
              value={
                advisoryBoard.filter(
                  (item) =>
                    item.status ===
                    "active"
                ).length
              }
            />

            <BoardStat
              icon={UserRound}
              label="Total Members"
              value={
                members.length
              }
            />

          </div>

          {/* ====================================================
              BOARD SECTIONS
          ==================================================== */}

          <div className="space-y-8">

            {/* EDITOR-IN-CHIEF */}

            <section>

              <SectionHeading
                title="Editor-in-Chief"
              />

              {editorInChief.length ===
              0 ? (
                <EmptySection
                  text="No Editor-in-Chief has been designated yet."
                  onAdd={
                    openAddForm
                  }
                />
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">

                  {editorInChief.map(
                    (member) => (
                      <MemberCard
                        key={
                          member.id
                        }
                        member={
                          member
                        }
                        featured
                      />
                    )
                  )}

                </div>
              )}

            </section>

            {/* ASSOCIATE EDITORS */}

            <section>

              <SectionHeading
                title="Associate Editors"
              />

              {associateEditors.length ===
              0 ? (
                <EmptySection
                  text="No Associate Editors have been designated yet."
                  onAdd={
                    openAddForm
                  }
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

                  {associateEditors.map(
                    (member) => (
                      <MemberCard
                        key={
                          member.id
                        }
                        member={
                          member
                        }
                      />
                    )
                  )}

                </div>
              )}

            </section>

            {/* ADVISORY BOARD */}

            <section>

              <SectionHeading
                title="Advisory Board"
              />

              {advisoryBoard.length ===
              0 ? (
                <EmptySection
                  text="No Advisory Board members have been designated yet."
                  onAdd={
                    openAddForm
                  }
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

                  {advisoryBoard.map(
                    (member) => (
                      <MemberCard
                        key={
                          member.id
                        }
                        member={
                          member
                        }
                      />
                    )
                  )}

                </div>
              )}

            </section>

          </div>

        </div>

      </div>

      {/* ========================================================
          ADD / EDIT MODAL
      ======================================================== */}

      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 py-5 backdrop-blur-sm">

          <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#eee7df] bg-white px-5 py-4">

              <div>

                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#244e70]">
                  Editorial Management
                </p>

                <h2 className="mt-1 text-xl font-semibold text-[#302923]">
                  {editingId
                    ? "Edit Board Member"
                    : "Add Board Member"}
                </h2>

              </div>

              <button
                onClick={
                  closeForm
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e4d9cc] text-[#6e6257] transition hover:bg-[#f7f1e9]"
              >
                <X size={17} />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={
                handleSave
              }
              className="space-y-4 p-5"
            >

              {/* ROLE */}

              <FormField
                label="Editorial Role"
              >

                <select
                  name="role"
                  value={
                    form.role
                  }
                  onChange={
                    handleChange
                  }
                  className="form-input"
                >

                  <option value="editorInChief">
                    Editor-in-Chief
                  </option>

                  <option value="associateEditor">
                    Associate Editor
                  </option>

                  <option value="advisoryBoard">
                    Advisory Board
                  </option>

                </select>

              </FormField>

              {/* NAME */}

              <FormField
                label="Full Name *"
              >

                <input
                  name="name"
                  value={
                    form.name
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Dr. John Smith"
                  className="form-input"
                />

              </FormField>

              {/* DESIGNATION */}

              <FormField
                label="Designation *"
              >

                <input
                  name="designation"
                  value={
                    form.designation
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Professor"
                  className="form-input"
                />

              </FormField>

              {/* AFFILIATION */}

              <FormField
                label="Affiliation *"
              >

                <input
                  name="affiliation"
                  value={
                    form.affiliation
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="University / Institution"
                  className="form-input"
                />

              </FormField>

              {/* COUNTRY */}

              <FormField
                label="Country *"
              >

                <input
                  name="country"
                  value={
                    form.country
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="India"
                  className="form-input"
                />

              </FormField>

              {/* EXPERTISE */}

              <FormField
                label="Expertise"
                hint="Separate multiple expertise areas with commas."
              >

                <input
                  name="expertise"
                  value={
                    form.expertise
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="PCB Design, AI, IoT, Embedded Systems"
                  className="form-input"
                />

              </FormField>

              {/* IMAGE URL */}

              <FormField
                label="Image URL"
                hint="You can connect Firebase Storage later for direct image uploads."
              >

                <input
                  name="imageUrl"
                  value={
                    form.imageUrl
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="https://..."
                  className="form-input"
                />

              </FormField>

              {/* ORDER + STATUS */}

              <div className="grid gap-4 sm:grid-cols-2">

                <FormField
                  label="Display Order"
                >

                  <input
                    type="number"
                    min="1"
                    name="displayOrder"
                    value={
                      form.displayOrder
                    }
                    onChange={
                      handleChange
                    }
                    className="form-input"
                  />

                </FormField>

                <FormField
                  label="Status"
                >

                  <select
                    name="status"
                    value={
                      form.status
                    }
                    onChange={
                      handleChange
                    }
                    className="form-input"
                  >

                    <option value="active">
                      Active
                    </option>

                    <option value="inactive">
                      Inactive
                    </option>

                  </select>

                </FormField>

              </div>

              {/* BUTTONS */}

              <div className="flex justify-end gap-2 border-t border-[#eee7df] pt-5">

                <button
                  type="button"
                  onClick={
                    closeForm
                  }
                  disabled={saving}
                  className="rounded-lg border border-[#ddd2c5] px-4 py-2.5 text-xs font-semibold text-[#66594d] transition hover:bg-[#f8f3ed] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#244e70] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#1b3a54] disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {saving ? (
                    <>
                      <RefreshCw
                        size={14}
                        className="animate-spin"
                      />

                      Saving...
                    </>
                  ) : (
                    <>
                      <Save
                        size={14}
                      />

                      {editingId
                        ? "Save Changes"
                        : "Add Member"}
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </main>
  );
}

/*
 * ==============================================================
 * BOARD STAT
 * ==============================================================
 */

function BoardStat({
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

      <p className="text-[10px] text-[#8a8075]">
        {label}
      </p>

      <p className="mt-1 text-2xl font-medium text-[#302923]">
        {value}
      </p>

    </div>
  );
}

/*
 * ==============================================================
 * SECTION HEADING
 * ==============================================================
 */

function SectionHeading({
  title,
}: {
  title: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-2.5">

      <div className="h-6 w-1 rounded-full bg-[#244e70]" />

      <h2 className="text-lg font-medium text-[#302923]">
        {title}
      </h2>

    </div>
  );
}

/*
 * ==============================================================
 * EMPTY SECTION
 * ==============================================================
 */

function EmptySection({
  text,
  onAdd,
}: {
  text: string;
  onAdd: () => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[#d9cbbb] bg-white px-5 py-10 text-center">

      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef3f7] text-[#244e70]">

        <UserRound size={19} />

      </div>

      <p className="mt-3 text-xs text-[#766d64]">
        {text}
      </p>

      <button
        onClick={onAdd}
        className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#244e70] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#1b3a54]"
      >

        <Plus size={14} />

        Add Member

      </button>

    </div>
  );
}

/*
 * ==============================================================
 * FORM FIELD
 * ==============================================================
 */

function FormField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>

      <label className="mb-1.5 block text-xs font-semibold text-[#433a32]">
        {label}
      </label>

      {children}

      {hint && (
        <p className="mt-1 text-[9px] text-[#8b8178]">
          {hint}
        </p>
      )}

    </div>
  );
}