import { cookies } from "next/headers";
import { adminAuth, adminFirestore } from "@/lib/FirebaseAdmin";

export const SESSION_COOKIE = "jfer_session";

export async function getAuthenticatedUser() {
  const cookieStore = await cookies();

  const sessionCookie =
    cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    const decodedToken =
      await adminAuth.verifySessionCookie(
        sessionCookie,
        true
      );

    const uid = decodedToken.uid;

    // Check ADMIN
    const adminDoc =
      await adminFirestore
        .collection("admin")
        .doc(uid)
        .get();

    if (adminDoc.exists) {
      return {
        uid,
        email: decodedToken.email || "",
        role: "admin" as const,
      };
    }

    // Check REVIEWER
    const reviewerSnapshot =
      await adminFirestore
        .collection("reviewer")
        .where("uid", "==", uid)
        .where("status", "==", "active")
        .limit(1)
        .get();

    if (!reviewerSnapshot.empty) {
      return {
        uid,
        email: decodedToken.email || "",
        role: "reviewer" as const,
      };
    }

    return null;
  } catch (error) {
    console.error(
      "SESSION VERIFICATION ERROR:",
      error
    );

    return null;
  }
}