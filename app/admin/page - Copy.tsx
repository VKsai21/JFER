// "use client";

// import { useEffect, useState } from "react";
// import {
//   Pencil,
//   Save,
//   CheckCircle,
//   XCircle,
//   Trash2,
//   X,
// } from "lucide-react";

// import {
//   signInWithEmailAndPassword,
//   onAuthStateChanged,
//   signOut,
// } from "firebase/auth";

// import {
//   collection,
//   getDocs,
//   doc,
//   updateDoc,
//   deleteDoc,
//   setDoc,
// } from "firebase/firestore";

// import { firestore } from "@/lib/firebase";
// import { auth } from "@/lib/firebaseAuth";

// export default function AdminPage() {

//   const domains = [
//     "Artificial Intelligence",
//     "Machine Learning",
//     "Embedded Systems",
//     "Internet of Things",
//     "Robotics",
//     "VLSI Design",
//     "RF & Antenna Engineering",
//     "Power Electronics",
//     "Electrical Engineering",
//     "Electronics Engineering",
//     "Mechanical Engineering",
//     "Civil Engineering",
//     "Computer Science",
//     "Cyber Security",
//     "Data Science",
//     "Cloud Computing",
//     "Blockchain",
//     "Communication Systems",
//     "Renewable Energy",
//     "Biomedical Engineering",
//   ];

//   const [showDeleteDialog, setShowDeleteDialog] =useState(false);

//   // AUTH STATES
//   const [deleting, setDeleting] = useState(false);
//   const [deleteSuccess, setDeleteSuccess] = useState(false);
//   const [deleteError, setDeleteError] = useState("");

//   const [rejecting, setRejecting] = useState(false);
//   const [rejectSuccess, setRejectSuccess] = useState(false);
//   const [rejectError, setRejectError] = useState("");

//   const [publishing, setPublishing] = useState(false);
//   const [publishSuccess, setPublishSuccess] = useState(false);
//   const [publishError, setPublishError] = useState("");

//   const [inquiries, setInquiries] = useState<any[]>([]);
//   const [selectedEnquiry, setSelectedEnquiry] = useState<any>(null);

//   const [user, setUser] = useState<any>(null);

//   const [email, setEmail] = useState("");

//   const [password, setPassword] = useState("");

//   const [authLoading, setAuthLoading] = useState(true);

//   const [loginLoading, setLoginLoading] = useState(false);

//   const [loginError, setLoginError] = useState("");

//   // DASHBOARD STATES
//   const [activeMenu, setActiveMenu] = useState("Dashboard");

//   const [submissions, setSubmissions] = useState<any[]>([]);

//   const [selectedPaper, setSelectedPaper] = useState<any>(null);

//   const [showApproveDialog, setShowApproveDialog] = useState(false);

//   const [editMode, setEditMode] = useState(false);

//   const [editedPaper, setEditedPaper] = useState<any>(null);

//   // PUBLISH STATES
//   const [publishVolume, setPublishVolume] = useState("");

//   const [publishYear, setPublishYear] = useState("");

//   const [publishDomain, setPublishDomain] = useState("");

//   const [isMobile, setIsMobile] = useState(false);

//    useEffect(() => {
//       const checkScreen = () => {
//         setIsMobile(window.innerWidth < 1280); // mobile + tablet
//       };

//       checkScreen();
//       window.addEventListener("resize", checkScreen);

//       return () => window.removeEventListener("resize", checkScreen);
//     }, []);
//   // CHECK AUTH
//   useEffect(() => {

//     const unsubscribe = onAuthStateChanged(
//       auth,
//       (currentUser) => {

//         setUser(currentUser || null);

//         setAuthLoading(false);

//       }
//     );

//     return () => unsubscribe();

//   }, []);

//   // FETCH PAPERS
//   useEffect(() => {
//     if (!user) return;

//     const loadPapers = async () => {
//       try {
//         const snapshot = await getDocs(
//           collection(firestore, "submissions")
//         );

//         const papers = snapshot.docs.map((docSnap) => ({
//           id: docSnap.id,
//           ...docSnap.data(),
//         }));

//         papers.sort((a: any, b: any) => {
//           const aTime =
//             a.submittedAt?.seconds || 0;
//           const bTime =
//             b.submittedAt?.seconds || 0;

//           return bTime - aTime;
//         });

//         setSubmissions(papers);
//       } catch (error) {
//         console.error(error);
//       }
//     };

//     loadPapers();
//   }, [user]);

//   useEffect(() => {
//     if (!user) return;

//     const loadInquiries = async () => {
//       try {
//         const snapshot = await getDocs(
//           collection(firestore, "inquiries")
//         );

//         const data = snapshot.docs.map((docSnap) => ({
//           id: docSnap.id,
//           ...docSnap.data(),
//         }));

//         data.sort((a: any, b: any) => {
//           const aTime = a.createdAt?.seconds || 0;
//           const bTime = b.createdAt?.seconds || 0;

//           return bTime - aTime;
//         });

//         setInquiries(data);
//       } catch (error) {
//         console.error(error);
//       }
//     };

//     loadInquiries();
//   }, [user]);

//   // LOGIN
//   const loginAdmin = async () => {

//     try {

//       setLoginLoading(true);

//       setLoginError("");

//       await signInWithEmailAndPassword(
//         auth,
//         email,
//         password
//       );

//     } catch (error) {

//       setLoginError("Invalid credentials");

//     } finally {

//       setLoginLoading(false);

//     }

//   };

//   // LOGOUT
//   const logoutAdmin = async () => {

//     await signOut(auth);

//   };

//   // FILTERS
//   const filteredSubmissions = submissions.filter((paper) => {

//     if (activeMenu === "Pending") {
//       return paper.status === "submitted";
//     }

//     if (activeMenu === "Approved") {
//       return paper.status === "approved";
//     }

//     if (activeMenu === "Rejected") {
//       return paper.status === "rejected";
//     }

//     if (activeMenu === "All Submissions") {
//       return true;
//     }

//     return false;

//   });

//   // STATS
//   const totalPapers = submissions.length;

//   const approvedPapers = submissions.filter(
//     (paper) =>
//       paper.status?.toLowerCase() === "approved"
//   ).length;

//   const rejectedPapers = submissions.filter(
//     (paper) =>
//       paper.status?.toLowerCase() === "rejected"
//   ).length;

//   const submittedPapers = submissions.filter(
//     (paper) =>
//       paper.status?.toLowerCase() === "submitted"
//   ).length;

//   // APPROVE
//   const approvePaper = async () => {
//     if (!selectedPaper) return;

//     setPublishing(true);
//     setPublishError("");

//     try {

//       const paperNumber = `P-${publishYear}-${Date.now()}`;

//       // Create year document
//       await setDoc(
//         doc(
//           firestore,
//           "published",
//           publishYear
//         ),
//         {
//           year: publishYear,
//         },
//         { merge: true }
//       );

//       // Create volume document
//       await setDoc(
//         doc(
//           firestore,
//           "published",
//           publishYear,
//           "volumes",
//           publishVolume
//         ),
//         {
//           volumeId: publishVolume,
//         },
//         { merge: true }
//       );

//       // Create paper document
//       await setDoc(
//         doc(
//           firestore,
//           "published",
//           publishYear,
//           "volumes",
//           publishVolume,
//           "papers",
//           paperNumber
//         ),
//         {
//           ...selectedPaper,
//           status: "approved",
//           volume: publishVolume,
//           year: publishYear,
//           domain: publishDomain,
//           paperNumber,
//           publishedAt: Date.now(),
//         }
//       );

//       // Update submission master copy
//       await updateDoc(
//         doc(
//           firestore,
//           "submissions",
//           selectedPaper.id
//         ),
//         {
//           status: "approved",
//           volume: publishVolume,
//           year: publishYear,
//           domain: publishDomain,
//           paperNumber,
//           publishedAt: Date.now(),
//         }
//       );

//       // Update UI
//       setSubmissions((prev) =>
//         prev.map((paper) =>
//           paper.id === selectedPaper.id
//             ? {
//                 ...paper,
//                 status: "approved",
//                 volume: publishVolume,
//                 year: publishYear,
//                 paperNumber,
//               }
//             : paper
//         )
//       );

//       setSelectedPaper(null);
//       setShowApproveDialog(false);

//       setPublishYear("");
//       setPublishVolume("");
//       setPublishDomain("");

//       setPublishing(false);
//       setPublishSuccess(true);

//       setTimeout(() => {
//         setPublishSuccess(false);
//       }, 2500);

//       // alert("Paper published successfully");

//     } catch (error) {

//         console.error(error);

//         setPublishing(false);
//         setPublishError(
//           "Failed to publish paper. Please try again."
//         );

//       }
//   };

//   // REJECT
//   const rejectPaper = async () => {
//   if (!selectedPaper) return;

//   // Close paper details immediately
//   setSelectedPaper(null);

//   // Show loading modal
//   setRejecting(true);
//   setRejectError("");

//   try {

//     const rejectNumber = `R-${Date.now()}`;

//     await setDoc(
//       doc(
//         firestore,
//         "rejected",
//         new Date().getFullYear().toString(),
//         "papers",
//         rejectNumber
//       ),
//       {
//         ...selectedPaper,
//         rejectNumber,
//         rejectedAt: Date.now(),
//       }
//     );

//     // Remove from published collection if already approved
//     if (
//       selectedPaper.paperNumber &&
//       selectedPaper.year &&
//       selectedPaper.volume
//     ) {
//       await deleteDoc(
//         doc(
//           firestore,
//           "published",
//           selectedPaper.year,
//           "volumes",
//           selectedPaper.volume,
//           "papers",
//           selectedPaper.paperNumber
//         )
//       );
//     }

//     // Update master record
//     await updateDoc(
//       doc(
//         firestore,
//         "submissions",
//         selectedPaper.id
//       ),
//       {
//         status: "rejected",
//         rejectNumber,
//         rejectedAt: Date.now(),

//         // Optional: clear publication metadata
//         paperNumber: null,
//         year: null,
//         volume: null,
//         domain: null,
//         publishedAt: null,
//       }
//     );

//     // Update local state
//     setSubmissions((prev) =>
//       prev.map((paper) =>
//         paper.id === selectedPaper.id
//           ? {
//               ...paper,
//               status: "rejected",
//               rejectNumber,

//               paperNumber: null,
//               year: null,
//               volume: null,
//               domain: null,
//             }
//           : paper
//       )
//     );

//     setRejecting(false);
//     setRejectSuccess(true);

//     setTimeout(() => {
//       setRejectSuccess(false);
//     }, 2500);

//   } catch (error) {

//     console.error(error);

//     setRejecting(false);

//     setRejectError(
//       "Failed to reject manuscript. Please try again."
//     );
//   }
// };

//   // DELETE
//   const deletePaper = async () => {
//     if (!selectedPaper) return;

//     // const confirmDelete = confirm(
//     //   "Delete this paper permanently?"
//     // );

//     // if (!confirmDelete) return;

//     // Close paper details immediately
//     setSelectedPaper(null);

//     // Start delete animation
//     setDeleting(true);
//     setDeleteError("");

//     try {
//       const deleteId = `D-${Date.now()}`;

//       // Archive deleted paper
//       await setDoc(
//         doc(
//           firestore,
//           "deleted",
//           deleteId
//         ),
//         {
//           ...selectedPaper,
//           deletedAt: Date.now(),
//           deletedId: deleteId,
//           originalSubmissionId: selectedPaper.id,
//         }
//       );

//       // Remove from published collection
//       if (
//         selectedPaper.paperNumber &&
//         selectedPaper.year &&
//         selectedPaper.volume
//       ) {
//         await deleteDoc(
//           doc(
//             firestore,
//             "published",
//             selectedPaper.year,
//             "volumes",
//             selectedPaper.volume,
//             "papers",
//             selectedPaper.paperNumber
//           )
//         );
//       }

//       // Remove from rejected collection
//       if (
//         selectedPaper.rejectNumber &&
//         selectedPaper.rejectYear
//       ) {
//         await deleteDoc(
//           doc(
//             firestore,
//             "rejected",
//             selectedPaper.rejectYear,
//             "papers",
//             selectedPaper.rejectNumber
//           )
//         );
//       }

//       // Update master submission record
//       await updateDoc(
//         doc(
//           firestore,
//           "submissions",
//           selectedPaper.id
//         ),
//         {
//           status: "deleted",
//           deletedId: deleteId,
//           deletedAt: Date.now(),

//           // Clear publication metadata
//           paperNumber: null,
//           year: null,
//           volume: null,
//           domain: null,
//           publishedAt: null,

//           // Clear rejection metadata
//           rejectNumber: null,
//           rejectYear: null,
//           rejectedAt: null,
//         }
//       );

//       // Update local state
//       setSubmissions((prev) =>
//         prev.map((paper) =>
//           paper.id === selectedPaper.id
//             ? {
//                 ...paper,
//                 status: "deleted",
//                 deletedId: deleteId,
//                 deletedAt: Date.now(),

//                 paperNumber: null,
//                 year: null,
//                 volume: null,
//                 domain: null,

//                 rejectNumber: null,
//                 rejectYear: null,
//               }
//             : paper
//         )
//       );

//       // Success animation
//       setDeleting(false);
//       setDeleteSuccess(true);

//       setTimeout(() => {
//         setDeleteSuccess(false);
//       }, 2500);

//     } catch (error) {
//       console.error(error);

//       setDeleting(false);

//       setDeleteError(
//         "Failed to delete manuscript."
//       );
//     }
//   };

//   // EDIT
//   const startEditing = () => {

//     setEditedPaper(selectedPaper);

//     setEditMode(true);

//   };

//   // SAVE EDITS
//   const saveChanges = async () => {
//     if (!editedPaper) return;

//     await updateDoc(
//       doc(
//         firestore,
//         "submissions",
//         editedPaper.id
//       ),
//       {
//         title: editedPaper.title,
//         author: editedPaper.author,
//         abstract: editedPaper.abstract,
//       }
//     );

//     setSelectedPaper(editedPaper);
//     setEditMode(false);

//     // alert("Changes saved");
//   };
  
//   if (isMobile) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-black text-white p-6 text-center">
//         <div>
//           <h1 className="text-3xl font-bold mb-4">
//             Desktop Required
//           </h1>
//           <p className="text-gray-300">
//             The admin dashboard is available only on desktop devices.
//             Please open this page on a laptop or desktop computer.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // AUTH LOADING
//   if (authLoading) {

//     return (
//       <div className="min-h-screen flex items-center justify-center bg-[#f5f3ee] text-black">
//         Checking authentication...
//       </div>
//     );

//   }

//   // LOGIN PAGE
//   if (!user) {
//     return (
//       <main className="h-screen overflow-hidden bg-[#f5f3ee] flex items-center justify-center p-4">
//         <div className="w-full max-w-6xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
//           <div className="grid lg:grid-cols-2 min-h-[650px]">

//             {/* Left Branding Panel */}
//             <div className="hidden lg:flex flex-col justify-center items-center bg-white text-black p-4">

//               <img
//                 src="/Journel_logo.png"
//                 alt="JFER"
//                 className="w-70 h-auto -mb-10 "
//               />

//               <h1 className="text-3xl font-bold text-center">
//                 JFER
//               </h1>

//               <p className="text-slate-600 text-center mt-0 max-w-xs leading-relaxed">
//                 Journal of Future Engineering Research
//               </p>

//               <div className="w-16 h-px bg-slate-300 my-4" />

//               <p className="mt-8 text-xs uppercase tracking-[0.3em] text-slate-400">
//                 Admin Dashboard
//               </p>

//             </div>

//             {/* Right Login Panel */}
//             <div className="flex flex-col justify-center bg-white text-black lg:bg-black lg:text-white p-8 lg:p-10">

//               {/* Mobile Logo */}
//               <div className="lg:hidden flex justify-center mb-6">
//                 <img
//                   src="/Journel_logo.png"
//                   alt="JFER"
//                   className="w-24 h-auto"
//                 />
//               </div>

//               <p className="text-xs uppercase tracking-[0.3em] text-slate-500 lg:text-slate-400 mt-2">
//                 Admin Access
//               </p>

//               <h1 className="text-3xl font-bold text-black lg:text-white mb-2">
//                 Welcome Back
//               </h1>

//               <p className="text-slate-600 lg:text-slate-400 mb-8">
//                 Sign in to access the editorial dashboard.
//               </p>

//               <div className="space-y-4">

//                 <input
//                   type="email"
//                   placeholder="Admin Email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="
//                     w-full
//                     bg-slate-100
//                     lg:bg-white/5
//                     border
//                     border-slate-200
//                     lg:border-white/10
//                     text-black
//                     lg:text-white
//                     placeholder:text-slate-500
//                     rounded-xl
//                     px-4 py-3
//                     outline-none
//                     transition-all duration-300
//                     focus:border-slate-400
//                     lg:focus:border-white/30
//                     focus:ring-2
//                     focus:ring-slate-200
//                     lg:focus:ring-white/10
//                   "
//                 />

//                 <input
//                   type="password"
//                   placeholder="Password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="
//                     w-full
//                     bg-slate-100
//                     lg:bg-white/5
//                     border
//                     border-slate-200
//                     lg:border-white/10
//                     text-black
//                     lg:text-white
//                     placeholder:text-slate-500
//                     rounded-xl
//                     px-4 py-3
//                     outline-none
//                     transition-all duration-300
//                     focus:border-slate-400
//                     lg:focus:border-white/30
//                     focus:ring-2
//                     focus:ring-slate-200
//                     lg:focus:ring-white/10
//                   "
//                 />

//                 {loginError && (
//                   <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
//                     <p className="text-sm text-red-400">
//                       {loginError}
//                     </p>
//                   </div>
//                 )}

//                 <button
//                   onClick={loginAdmin}
//                   disabled={loginLoading}
//                   className="
//                     w-full
//                     bg-black
//                     text-white
//                     lg:bg-white
//                     lg:text-black
//                     rounded-xl
//                     py-3
//                     font-semibold
//                     transition-all
//                     duration-300
//                     hover:bg-[#006700]
//                     hover:text-white
//                     hover:border-[#8b6b47]
//                     hover:shadow-lg
//                     disabled:opacity-70
//                   "
//                 >
//                   {loginLoading
//                     ? "Logging in..."
//                     : "Login to Dashboard"}
//                 </button>

//               </div>

//               <div className="mt-6 pt-4 border-t border-slate-200 lg:border-white/10">
//                 <p className="text-xs text-center text-slate-500 lg:text-slate-500">
//                   Journal of Future Engineering Research
//                 </p>
//               </div>

//             </div>

//           </div>
//         </div>
//       </main>
//     );
//   }

//   // DASHBOARD
//   return (

//     <main className="min-h-screen bg-[#f5f3ee] text-black flex">

//       {/* SIDEBAR */}
//       <aside className="w-72 bg-black text-white p-4 flex flex-col justify-between">

//         <div>

//           <div className="mb-4">

//             <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-1">
//               Editorial System
//             </p>

//             <h1 className="text-sm font-semibold">
//               JFER
//             </h1>

//           </div>

//           <nav className="space-y-1">

//             {[
//               "Dashboard",
//               "All Submissions",
//               "Pending",
//               "Approved",
//               "Rejected",
//               "Enquiries",
//             ].map((item) => (

//               <button
//                 key={item}
//                 onClick={() => {
//                   setActiveMenu(item);
//                   setSelectedPaper(null);
//                   setEditMode(false);
//                 }}
//                 className={`w-full text-left px-4 py-3 rounded-xl text-xs transition ${
//                   activeMenu === item
//                     ? "bg-white text-black font-medium"
//                     : "text-gray-400 hover:bg-white/10"
//                 }`}
//               >
//                 {item}
//               </button>

//             ))}

//           </nav>

//         </div>

//         <div className="space-y-4">

//           <button
//             onClick={logoutAdmin}
//             className="w-full border border-white/10 rounded-xl py-3 text-sm hover:bg-red-500/20 hover:border-red-500 hover:text-red-400 transition-all duration-300"
//           >
//             Logout
//           </button>

//           {/* <div className="text-sm text-gray-500">
//             © 2026 JournalX
//           </div> */}

//         </div>

//       </aside>

//       {/* MAIN */}
//       <section
//         className={`flex-1 grid transition-all duration-300 ${
//           selectedPaper
//             ? "grid-cols-[1.2fr_0.8fr]"
//             : "grid-cols-1"
//         }`}
//       >

//         {/* LEFT */}
//         <div className="p-10 overflow-y-auto">

//           {activeMenu !== "Enquiries" && (
//             <div className="mb-5">
//               <p className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-2">
//                 Editorial Dashboard
//               </p>

//               <h2 className="text-4xl font-semibold">
//                 {activeMenu}
//               </h2>
//             </div>
//           )}

//           {/* DASHBOARD */}
//           {activeMenu === "Dashboard" && (

//             <div className="grid grid-cols-2 gap-2">

//               <div className="bg-white rounded-2xl p-8 border border-black/10">
//                 <p className="text-sm text-gray-500 mb-2">
//                   Total Submitted Papers
//                 </p>

//                 <h3 className="text-4xl font-semibold">
//                   {totalPapers}
//                 </h3>
//               </div>

//               <div className="bg-white rounded-2xl p-8 border border-black/10">
//                 <p className="text-sm text-gray-500 mb-2">
//                   Approved
//                 </p>

//                 <h3 className="text-4xl font-semibold text-green-700">
//                   {approvedPapers}
//                 </h3>
//               </div>

//               <div className="bg-white rounded-2xl p-8 border border-black/10">
//                 <p className="text-sm text-gray-500 mb-2">
//                   Pending at Review
//                 </p>

//                 <h3 className="text-4xl font-semibold text-yellow-700">
//                   {submittedPapers}
//                 </h3>
//               </div>

//               <div className="bg-white rounded-2xl p-8 border border-black/10">
//                 <p className="text-sm text-gray-500 mb-2">
//                   Rejected
//                 </p>

//                 <h3 className="text-4xl font-semibold text-red-700">
//                   {rejectedPapers}
//                 </h3>
//               </div>

//             </div>

//           )}

//           {activeMenu !== "Dashboard" && activeMenu !== "Enquiries" && (

//             <div className="bg-white border border-black/10 rounded-2xl overflow-hidden">

//               <div className="grid grid-cols-5 px-6 py-4 border-b border-black/10 text-xs uppercase tracking-[0.15em] text-gray-500">

//                 <p>Title</p>

//                 <p>Author</p>

//                 <p>Date</p>

//                 <p>Status</p>

//                 <p>Action</p>

//               </div>

//               {filteredSubmissions.length === 0 && (

//                 <div className="p-10 text-center text-gray-500">
//                   No papers found
//                 </div>

//               )}

//               {filteredSubmissions.map((paper) => (

//                 <div
//                   key={paper.id}
//                   className="grid grid-cols-5 px-6 py-6 border-b border-black/5 items-center text-sm hover:bg-black/[0.02] transition"
//                 >

//                   <div>

//                     <p className="font-medium line-clamp-1">
//                       {paper.title}
//                     </p>

//                     <p className="text-gray-500 text-xs mt-1">
//                       Research Paper
//                     </p>

//                   </div>

//                   <p className="truncate">
//                     {paper.author}
//                   </p>

//                   <p>
//                     {paper.submittedAt?.seconds
//                     ? new Date(
//                         paper.submittedAt.seconds * 1000
//                       ).toLocaleDateString()
//                     : "--"}
//                   </p>

//                   <div>

//                     <span
//                       className={`text-xs px-3 py-1 rounded-full capitalize ${
//                         paper.status === "approved"
//                           ? "bg-green-100 text-green-700"
//                           : paper.status === "rejected"
//                           ? "bg-red-100 text-red-700"
//                           : "bg-yellow-100 text-yellow-700"
//                       }`}
//                     >
//                       {paper.status || "pending"}
//                     </span>

//                   </div>

//                   <button
//                     onClick={() => {
//                       setSelectedPaper(paper);
//                       setEditMode(false);
//                     }}
//                     className="underline text-left cursor-pointer hover:text-cyan-600 transition-colors"
//                   >
//                     Preview
//                   </button>

//                 </div>

//               ))}

//             </div>

//           )}

//         </div>

        

//         {/* RIGHT PANEL */}
//         {selectedPaper && (
//           <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">

//             <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl">

//               {/* HEADER */}
//               <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-5 flex justify-between items-center z-10">

//                 <div>
//                   <p className="text-xs uppercase tracking-[0.25em] text-gray-500">
//                     Paper Details
//                   </p>

//                   <h2 className="text-2xl font-bold mt-1">
//                     Research Submission
//                   </h2>
//                 </div>

//                 <div className="flex items-center gap-3">

//                   {/* EDIT / SAVE */}
//                   <div className="group relative">

//                     {!editMode ? (
//                       <button
//                         onClick={startEditing}
//                         className="w-11 h-11 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all duration-300 cursor-pointer"
//                       >
//                         <Pencil size={18} />
//                       </button>
//                     ) : (
//                       <button
//                         onClick={saveChanges}
//                         className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:scale-110 transition-all duration-300 cursor-pointer"
//                       >
//                         <Save size={18} />
//                       </button>
//                     )}

//                     <span className="absolute top-14 right-0 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-1 transition-all duration-300 bg-black text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap">
//                       {editMode ? "Save Changes" : "Edit"}
//                     </span>

//                   </div>

//                   {/* APPROVE */}
//                   <div className="group relative">

//                     <button
//                       onClick={() => setShowApproveDialog(true)}
//                       disabled={selectedPaper?.status === "approved"}
//                       className={`
//                         w-11 h-11 rounded-xl flex items-center justify-center
//                         transition-all duration-300
//                         ${
//                           selectedPaper?.status === "approved"
//                             ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//                             : "bg-green-600 text-white hover:scale-110 cursor-pointer"
//                         }
//                       `}
//                     >
//                       <CheckCircle size={18} />
//                     </button>

//                     <span
//                       className={`
//                         absolute top-14 right-0
//                         text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap
//                         transition-all duration-300
//                         ${
//                           selectedPaper?.status === "approved"
//                             ? "bg-gray-500"
//                             : "bg-green-600 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-1"
//                         }
//                       `}
//                     >
//                       {selectedPaper?.status === "approved"
//                         ? "Already Published"
//                         : "Approve"}
//                     </span>

//                   </div>

//                   {/* REJECT */}
//                   <div className="group relative">

//                     <button
//                       onClick={rejectPaper}
//                       className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center hover:scale-110 transition-all duration-300 cursor-pointer"
//                     >
//                       <XCircle size={18} />
//                     </button>

//                     <span className="absolute top-14 right-0 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-1 transition-all duration-300 bg-amber-500 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap">
//                       Reject
//                     </span>

//                   </div>

//                   {/* DELETE */}
//                   <div className="group relative">

//                     <button
//                       onClick={() => setShowDeleteDialog(true)}
//                       className="w-11 h-11 rounded-xl bg-red-600 text-white flex items-center justify-center hover:scale-110 transition-all duration-300 cursor-pointer"
//                     >
//                       <Trash2 size={18} />
//                     </button>

//                     <span className="absolute top-14 right-0 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-1 transition-all duration-300 bg-red-600 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap">
//                       Delete
//                     </span>

//                   </div>

//                   {/* CLOSE */}
//                   <div className="group relative">

//                     <button
//                       onClick={() => {
//                         setSelectedPaper(null);
//                         setEditMode(false);
//                       }}
//                       className="w-11 h-11 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-black hover:text-white transition-all duration-300 cursor-pointer"
//                     >
//                       <X size={18} />
//                     </button>

//                     <span className="absolute top-14 right-0 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-1 transition-all duration-300 bg-black text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap">
//                       Close
//                     </span>

//                   </div>

//                 </div>

//               </div>

//               {/* CONTENT */}
//               <div className="p-8">

//                 {/* TITLE */}
//                 <div className="mb-8">

//                   <p className="text-sm text-gray-500 mb-2">
//                     Title
//                   </p>

//                   {editMode ? (
//                     <input
//                       value={editedPaper?.title || ""}
//                       onChange={(e) =>
//                         setEditedPaper({
//                           ...editedPaper,
//                           title: e.target.value,
//                         })
//                       }
//                       className="w-full border border-gray-200 rounded-2xl px-4 py-3"
//                     />
//                   ) : (
//                     <h3 className="text-3xl font-bold leading-snug">
//                       {selectedPaper.title}
//                     </h3>
//                   )}

//                 </div>

//                 <div className="grid md:grid-cols-2 gap-6 mb-8">

//                   <div className="bg-gray-50 rounded-2xl p-5">

//                     <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">
//                       Author
//                     </p>

//                     <p className="font-medium">
//                       {selectedPaper.author}
//                     </p>

//                   </div>

//                   <div className="bg-gray-50 rounded-2xl p-5">

//                     <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">
//                       Email
//                     </p>

//                     <p>
//                       {selectedPaper.email}
//                     </p>

//                   </div>

//                 </div>

//                 {/* ABSTRACT */}
//                 <div>

//                   <p className="text-sm text-gray-500 mb-3">
//                     Abstract
//                   </p>

//                   {editMode ? (
//                     <textarea
//                       rows={8}
//                       value={editedPaper?.abstract || ""}
//                       onChange={(e) =>
//                         setEditedPaper({
//                           ...editedPaper,
//                           abstract: e.target.value,
//                         })
//                       }
//                       className="w-full border border-gray-200 rounded-2xl px-4 py-3"
//                     />
//                   ) : (
//                     <div className="bg-gray-50 rounded-2xl p-6">
//                       <p className="leading-relaxed whitespace-pre-line text-gray-700">
//                         {selectedPaper.abstract}
//                       </p>
//                     </div>
//                   )}

//                 </div>

//               </div>

//             </div>

//           </div>
//         )}
//       </section>

//       {/* APPROVE DIALOG */}
//       {showApproveDialog && (
//         <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">

//           <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden scale-95">

//             {/* Header */}
//             <div className="border-b border-black/5 px-8 py-2">

//               {/* <p className="text-xs uppercase tracking-[0.25em] text-gray-400 mb-2">
//                 Publication Workflow
//               </p> */}

//               <h3 className="text-2xl font-semibold">
//                 Publish Paper
//               </h3>

//               <p className="text-sm text-gray-500 mt-2">
//                 Assign publication metadata before approving the manuscript.
//               </p>

//             </div>

//             {/* Form */}
//             <div className="p-4 space-y-2">

//               {/* Year */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Publication Year
//                 </label>

//                 <select
//                   value={publishYear}
//                   onChange={(e) => setPublishYear(e.target.value)}
//                   className="
//                     w-full
//                     border
//                     border-black/10
//                     rounded-xl
//                     px-4
//                     py-3
//                     bg-white
//                     outline-none
//                     transition-all
//                     focus:border-black
//                   "
//                 >
//                   <option value="">
//                     Select Year
//                   </option>

//                   {Array.from({ length: 6 }, (_, i) => {
//                     const year = new Date().getFullYear() + i;

//                     return (
//                       <option
//                         key={year}
//                         value={year}
//                       >
//                         {year}
//                       </option>
//                     );
//                   })}
//                 </select>
//               </div>

//               {/* Volume */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Volume
//                 </label>

//                 <select
//                   value={publishVolume}
//                   onChange={(e) => setPublishVolume(e.target.value)}
//                   className="
//                     w-full
//                     border
//                     border-black/10
//                     rounded-xl
//                     px-4
//                     py-3
//                     bg-white
//                     outline-none
//                     transition-all
//                     focus:border-black
//                   "
//                 >
//                   <option value="">
//                     Select Volume
//                   </option>

//                   <option value="1">Volume 1</option>
//                   <option value="2">Volume 2</option>
//                   <option value="3">Volume 3</option>
//                   <option value="4">Volume 4</option>
//                 </select>
//               </div>

//               {/* Domain */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Research Domain
//                 </label>

//                 <select
//                   value={publishDomain}
//                   onChange={(e) => setPublishDomain(e.target.value)}
//                   className="
//                     w-full
//                     border
//                     border-black/10
//                     rounded-xl
//                     px-4
//                     py-3
//                     bg-white
//                     outline-none
//                     transition-all
//                     focus:border-black
//                   "
//                 >
//                   <option value="">
//                     Select Domain
//                   </option>

//                   {domains.map((domain) => (
//                     <option
//                       key={domain}
//                       value={domain}
//                     >
//                       {domain}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//             </div>

//             {/* Footer */}
//             <div className="border-t border-black/5 px-8 py-5 flex justify-end gap-3">

//               <button
//                 onClick={() => {
//                   setShowApproveDialog(false);
//                   setPublishVolume("");
//                   setPublishYear("");
//                   setPublishDomain("");
//                 }}
//                 className="
//                   px-5
//                   py-2.5
//                   border
//                   border-black/10
//                   rounded-xl
//                   text-sm
//                   font-medium
//                   hover:bg-gray-50
//                   transition
//                 "
//               >
//                 Cancel
//               </button>

//               <button
//                 onClick={() => {
//                   setShowApproveDialog(false);
//                   approvePaper();
//                 }}
//                 disabled={
//                   !publishYear ||
//                   !publishVolume ||
//                   !publishDomain
//                 }
//                 className="
//                   px-5
//                   py-2.5
//                   bg-black
//                   text-white
//                   rounded-xl
//                   text-sm
//                   font-medium
//                   hover:opacity-90
//                   transition
//                   disabled:opacity-40
//                   disabled:cursor-not-allowed
//                 "
//               >
//                 Publish Paper
//               </button>

//             </div>

//           </div>

//         </div>
//       )}

//       {(publishing || publishSuccess || publishError) && (
//         <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center">

//           <div className="bg-white rounded-3xl shadow-2xl w-[90%] max-w-md p-8 text-center">

//             {/* Loading */}

//             {publishing && (
//               <>
//                 <div className="flex justify-center mb-6">
//                   <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
//                 </div>

//                 <h3 className="text-2xl font-semibold mb-2">
//                   Publishing Paper
//                 </h3>

//                 <p className="text-gray-500">
//                   Assigning publication details and updating archives...
//                 </p>
//               </>
//             )}

//             {/* Success */}

//             {publishSuccess && (
//               <>
//                 <div className="flex justify-center mb-6">

//                   <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center animate-bounce">

//                     <svg
//                       className="w-10 h-10 text-green-600"
//                       fill="none"
//                       stroke="currentColor"
//                       strokeWidth="3"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="M5 13l4 4L19 7"
//                       />
//                     </svg>

//                   </div>

//                 </div>

//                 <h3 className="text-2xl font-semibold text-green-700 mb-2">
//                   Paper Published
//                 </h3>

//                 <p className="text-gray-500">
//                   The manuscript has been approved and added to the journal archives.
//                 </p>
//               </>
//             )}

//             {/* Error */}

//             {publishError && (
//               <>
//                 <div className="flex justify-center mb-6">

//                   <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center animate-pulse">

//                     <svg
//                       className="w-10 h-10 text-red-600"
//                       fill="none"
//                       stroke="currentColor"
//                       strokeWidth="3"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="M6 6L18 18M18 6L6 18"
//                       />
//                     </svg>

//                   </div>

//                 </div>

//                 <h3 className="text-2xl font-semibold text-red-700 mb-2">
//                   Publishing Failed
//                 </h3>

//                 <p className="text-gray-500 mb-6">
//                   {publishError}
//                 </p>

//                 <button
//                   onClick={() => setPublishError("")}
//                   className="px-6 py-3 bg-red-600 text-white rounded-xl"
//                 >
//                   Close
//                 </button>
//               </>
//             )}

//           </div>

//         </div>
//       )}

//       {(rejecting || rejectSuccess || rejectError) && (
//         <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center">

//           <div className="bg-white rounded-3xl shadow-2xl w-[90%] max-w-md p-8 text-center">

//             {/* Loading */}

//             {rejecting && (
//               <>
//                 <div className="flex justify-center mb-6">
//                   <div className="w-16 h-16 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin" />
//                 </div>

//                 <h3 className="text-2xl font-semibold mb-2">
//                   Rejecting Manuscript
//                 </h3>

//                 <p className="text-gray-500">
//                   Updating manuscript status and moving it to rejected records...
//                 </p>
//               </>
//             )}

//             {/* Success */}

//             {rejectSuccess && (
//               <>
//                 <div className="flex justify-center mb-6">

//                   <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center animate-pulse">

//                     <svg
//                       className="w-10 h-10 text-red-600"
//                       fill="none"
//                       stroke="currentColor"
//                       strokeWidth="3"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="M6 6L18 18M18 6L6 18"
//                       />
//                     </svg>

//                   </div>

//                 </div>

//                 <h3 className="text-2xl font-semibold text-red-700 mb-2">
//                   Manuscript Rejected
//                 </h3>

//                 <p className="text-gray-500">
//                   The manuscript has been moved to the rejected records.
//                 </p>
//               </>
//             )}

//             {/* Error */}

//             {rejectError && (
//               <>
//                 <div className="flex justify-center mb-6">

//                   <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center animate-pulse">

//                     <svg
//                       className="w-10 h-10 text-orange-600"
//                       fill="none"
//                       stroke="currentColor"
//                       strokeWidth="3"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="M12 9v4"
//                       />
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="M12 17h.01"
//                       />
//                     </svg>

//                   </div>

//                 </div>

//                 <h3 className="text-2xl font-semibold text-orange-700 mb-2">
//                   Rejection Failed
//                 </h3>

//                 <p className="text-gray-500 mb-6">
//                   {rejectError}
//                 </p>

//                 <button
//                   onClick={() => setRejectError("")}
//                   className="px-6 py-3 bg-orange-600 text-white rounded-xl"
//                 >
//                   Close
//                 </button>
//               </>
//             )}

//           </div>

//         </div>
//       )}

//       {(deleting || deleteSuccess || deleteError) && (
//         <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center">

//           <div className="bg-white rounded-3xl shadow-2xl w-[90%] max-w-md p-8 text-center">

//             {/* Loading */}

//             {deleting && (
//               <>
//                 <div className="flex justify-center mb-6">
//                   <div className="w-16 h-16 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin" />
//                 </div>

//                 <h3 className="text-2xl font-semibold mb-2">
//                   Deleting Paper
//                 </h3>

//                 <p className="text-gray-500">
//                   Removing manuscript from active records...
//                 </p>
//               </>
//             )}

//             {/* Success */}

//             {deleteSuccess && (
//               <>
//                 <div className="flex justify-center mb-6">

//                   <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center animate-bounce">

//                     <svg
//                       className="w-10 h-10 text-red-600"
//                       fill="none"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="M19 7L18.133 19.142A2 2 0 0116.138 21H7.862A2 2 0 015.867 19.142L5 7"
//                       />
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="M3 7H21"
//                       />
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="M10 11V17"
//                       />
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="M14 11V17"
//                       />
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="M9 7V4H15V7"
//                       />
//                     </svg>

//                   </div>

//                 </div>

//                 <h3 className="text-2xl font-semibold text-red-700 mb-2">
//                   Paper Deleted
//                 </h3>

//                 <p className="text-gray-500">
//                   The manuscript has been archived and marked as deleted.
//                 </p>
//               </>
//             )}

//             {/* Error */}

//             {deleteError && (
//               <>
//                 <div className="flex justify-center mb-6">

//                   <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center animate-pulse">

//                     <svg
//                       className="w-10 h-10 text-orange-600"
//                       fill="none"
//                       stroke="currentColor"
//                       strokeWidth="3"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="M12 9v4"
//                       />
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="M12 17h.01"
//                       />
//                     </svg>

//                   </div>

//                 </div>

//                 <h3 className="text-2xl font-semibold text-orange-700 mb-2">
//                   Delete Failed
//                 </h3>

//                 <p className="text-gray-500 mb-6">
//                   {deleteError}
//                 </p>

//                 <button
//                   onClick={() => setDeleteError("")}
//                   className="px-6 py-3 bg-orange-600 text-white rounded-xl"
//                 >
//                   Close
//                 </button>
//               </>
//             )}

//           </div>

//         </div>
//       )}

//       {showDeleteDialog && selectedPaper && (
//         <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">

//           <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">

//             {/* Header */}

//             <div className="px-8 py-6 border-b border-black/5">

//               <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mb-4">

//                 <svg
//                   className="w-7 h-7 text-red-600"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     d="M19 7L18.133 19.142A2 2 0 0116.138 21H7.862A2 2 0 015.867 19.142L5 7"
//                   />
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     d="M3 7H21"
//                   />
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     d="M9 7V4H15V7"
//                   />
//                 </svg>

//               </div>

//               <h3 className="text-2xl font-semibold">
//                 Delete Manuscript
//               </h3>

//               <p className="text-gray-500 mt-2">
//                 This action will remove the manuscript from active
//                 records and archives. The submission history will be
//                 preserved for auditing purposes.
//               </p>

//             </div>

//             {/* Details */}

//             <div className="px-8 py-5 bg-gray-50 border-y border-black/5">

//               <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-2">
//                 Selected Paper
//               </p>

//               <p className="font-medium text-black">
//                 {selectedPaper.title}
//               </p>

//             </div>

//             {/* Actions */}

//             <div className="flex justify-end gap-3 p-6">

//               <button
//                 onClick={() =>
//                   setShowDeleteDialog(false)
//                 }
//                 className="
//                   px-5
//                   py-2.5
//                   border
//                   border-black/10
//                   rounded-xl
//                   hover:bg-gray-50
//                   transition
//                 "
//               >
//                 Cancel
//               </button>

//               <button
//                 onClick={() => {
//                   setShowDeleteDialog(false);
//                   deletePaper();
//                 }}
//                 className="
//                   px-5
//                   py-2.5
//                   bg-red-600
//                   text-white
//                   rounded-xl
//                   hover:bg-red-700
//                   transition
//                 "
//               >
//                 Delete Paper
//               </button>

//             </div>

//           </div>

//         </div>
//       )}

//       {activeMenu === "Enquiries" && (
//         <div className="bg-white rounded-[30px] border border-black/10 overflow-hidden">
//           <div className="grid grid-cols-4 px-8 py-6 border-b border-black/10 text-xs tracking-[0.2em] text-[#51627b] uppercase">
//             <div>Name</div>
//             <div>Email</div>
//             <div>Subject</div>
//             <div>Recieved time</div>
//           </div>

//           {inquiries.length === 0 ? (
//             <div className="p-16 text-center text-[#51627b]">
//               No enquiries found
//             </div>
//           ) : (
//             inquiries.map((enquiry) => (
//               <div
//                 key={enquiry.id}
//                 className="grid grid-cols-4 px-8 py-6 border-b border-black/5 items-center hover:bg-black/[0.02] cursor-pointer gap-2"
//                 onClick={() => setSelectedEnquiry(enquiry)}
//               >
//                 <div className="font-medium">{enquiry.name}</div>

//                 <div
//                   className="truncate "
//                   title={enquiry.email}
//                 >
//                   {enquiry.email}
//                 </div>

//                 <div
//                   className="truncate "
//                   title={enquiry.subject}
//                 >
//                   {enquiry.subject}
//                 </div>

//                 <div className="whitespace-normal ">
//                   {enquiry.createdAt?.toDate().toLocaleString("en-IN", {
//                     day: "numeric",
//                     month: "long",
//                     year: "numeric",
//                     hour: "numeric",
//                     minute: "2-digit",
//                     second: "2-digit",
//                     hour12: true,
//                   })}
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       )}

//     </main>

//   );

// }