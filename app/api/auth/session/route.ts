import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  adminAuth,
  adminFirestore,
} from "@/lib/FirebaseAdmin";

const SESSION_COOKIE =
  "jfer_session";

const SESSION_DURATION =
  1000 * 60 * 60 * 24 * 5;

export async function POST(
  request: NextRequest
) {
  try {
    const {
      idToken,
    } = await request.json();

    if (
      !idToken ||
      typeof idToken !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "ID token is required.",
        },
        {
          status: 400,
        }
      );
    }

    /* ======================================================
       VERIFY FIREBASE TOKEN
    ====================================================== */

    const decodedToken =
      await adminAuth.verifyIdToken(
        idToken
      );

    const uid =
      decodedToken.uid;

    /* ======================================================
       CHECK ADMIN
       
       Your current structure:
       
       admin/{uid}
         role: "Admin"
         status: "active"
    ====================================================== */

    const adminDoc =
      await adminFirestore
        .collection("admin")
        .doc(uid)
        .get();

    if (adminDoc.exists) {
      const adminData =
        adminDoc.data();

      const adminRole =
        String(
          adminData?.role || ""
        )
          .trim()
          .toLowerCase();

      const adminStatus =
        String(
          adminData?.status || ""
        )
          .trim()
          .toLowerCase();

      /* ----------------------------------------------------
         VERIFY ADMIN ROLE
      ---------------------------------------------------- */

      if (
        adminRole === "admin" &&
        adminStatus === "active"
      ) {
        /*
         * Create session
         */

        const sessionCookie =
          await adminAuth.createSessionCookie(
            idToken,
            {
              expiresIn:
                SESSION_DURATION,
            }
          );

        const response =
          NextResponse.json({
            success: true,

            role: "admin",

            status: "active",

            mustChangePassword:
              false,
          });

        response.cookies.set({
          name:
            SESSION_COOKIE,

          value:
            sessionCookie,

          httpOnly: true,

          secure:
            process.env.NODE_ENV ===
            "production",

          sameSite: "lax",

          path: "/",

          maxAge:
            SESSION_DURATION /
            1000,
        });

        return response;
      }

      /*
       * Admin document exists but is not active/admin
       */

      return NextResponse.json(
        {
          success: false,
          message:
            "Your administrator account is inactive or does not have administrator permissions.",
        },
        {
          status: 403,
        }
      );
    }

    /* ======================================================
       CHECK REVIEWER
       
       New structure:
       
       reviewer/{uid}
         status: "active"
       
       users/{uid}
         role: "reviewer"
         status: "active"
         mustChangePassword: true/false
    ====================================================== */

    const reviewerDoc =
      await adminFirestore
        .collection("reviewer")
        .doc(uid)
        .get();

    if (
      !reviewerDoc.exists
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You are not authorized to access JFER.",
        },
        {
          status: 403,
        }
      );
    }

    const reviewerData =
      reviewerDoc.data();

    const reviewerStatus =
      String(
        reviewerData?.status || ""
      )
        .trim()
        .toLowerCase();

    if (
      reviewerStatus !==
      "active"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your reviewer account is currently inactive.",
        },
        {
          status: 403,
        }
      );
    }

    /* ======================================================
       GET USERS/{UID}
       
       This contains:
       
       role
       status
       mustChangePassword
    ====================================================== */

    const userDoc =
      await adminFirestore
        .collection("users")
        .doc(uid)
        .get();

    /*
     * ------------------------------------------------------
     * USERS DOCUMENT MUST EXIST
     * ------------------------------------------------------
     */

    if (
      !userDoc.exists
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your reviewer account information is incomplete. Please contact the administrator.",
        },
        {
          status: 403,
        }
      );
    }

    const userData =
      userDoc.data();

    const userRole =
      String(
        userData?.role || ""
      )
        .trim()
        .toLowerCase();

    const userStatus =
      String(
        userData?.status || ""
      )
        .trim()
        .toLowerCase();

    if (
      userRole !==
      "reviewer"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid reviewer account role.",
        },
        {
          status: 403,
        }
      );
    }

    if (
      userStatus !==
      "active"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your account is currently inactive.",
        },
        {
          status: 403,
        }
      );
    }

    /* ======================================================
       CREATE REVIEWER SESSION
    ====================================================== */

    const sessionCookie =
      await adminAuth.createSessionCookie(
        idToken,
        {
          expiresIn:
            SESSION_DURATION,
        }
      );

    const response =
      NextResponse.json({
        success: true,

        role: "reviewer",

        status: "active",

        /*
         * TRUE immediately after admin approval.
         *
         * FALSE after reviewer changes password.
         */

        mustChangePassword:
          userData?.mustChangePassword ===
          true,
      });

    /* ======================================================
       SET SESSION COOKIE
    ====================================================== */

    response.cookies.set({
      name:
        SESSION_COOKIE,

      value:
        sessionCookie,

      httpOnly: true,

      secure:
        process.env.NODE_ENV ===
        "production",

      sameSite: "lax",

      path: "/",

      maxAge:
        SESSION_DURATION /
        1000,
    });

    return response;
  } catch (error) {
    console.error(
      "SESSION CREATION ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to create secure session.",
      },
      {
        status: 401,
      }
    );
  }
}