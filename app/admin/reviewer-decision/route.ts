import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  adminAuth,
  adminFirestore,
} from "@/lib/firebaseAdmin";

import {
  sendReviewerApprovalEmail,
  sendReviewerRejectionEmail,
} from "@/lib/mailer";

function generateRandomPassword(
  length = 14
) {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";

  let password = "";

  for (let i = 0; i < length; i++) {
    password +=
      chars[
        Math.floor(
          Math.random() * chars.length
        )
      ];
  }

  return password;
}

export async function POST(
  request: NextRequest
) {
  try {
    /* ========================================================
       AUTHORIZATION
    ======================================================== */

    const authorization =
      request.headers.get(
        "authorization"
      );

    if (
      !authorization?.startsWith(
        "Bearer "
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const idToken =
      authorization.substring(7);

    const decodedToken =
      await adminAuth.verifyIdToken(
        idToken
      );

    /* ========================================================
       ADMIN CHECK
    ======================================================== */

    const adminSnapshot =
      await adminFirestore
        .collection("admin")
        .doc(decodedToken.uid)
        .get();

    if (!adminSnapshot.exists) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Admin access required.",
        },
        {
          status: 403,
        }
      );
    }

    /* ========================================================
       REQUEST
    ======================================================== */

    const body =
      await request.json();

    const applicationId =
      String(
        body.applicationId || ""
      ).trim();

    const action =
      String(
        body.action || ""
      ).trim();

    if (
      !applicationId ||
      !["approve", "reject"].includes(
        action
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid application ID or action.",
        },
        {
          status: 400,
        }
      );
    }

    /* ========================================================
       GET APPLICATION
    ======================================================== */

    const applicationRef =
      adminFirestore
        .collection(
          "reviewerApplications"
        )
        .doc(applicationId);

    const applicationSnapshot =
      await applicationRef.get();

    if (
      !applicationSnapshot.exists
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Reviewer application not found.",
        },
        {
          status: 404,
        }
      );
    }

    const application =
      applicationSnapshot.data();

    if (!application) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Application data is empty.",
        },
        {
          status: 400,
        }
      );
    }

    const name =
      String(
        application.name ||
          "Reviewer"
      ).trim();

    const email =
      String(
        application.email || ""
      )
        .trim()
        .toLowerCase();

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Reviewer application does not contain an email address.",
        },
        {
          status: 400,
        }
      );
    }

    /* ========================================================
       PREVENT DUPLICATE PROCESSING
    ======================================================== */

    const currentStatus =
      String(
        application.status ||
          "pending"
      ).toLowerCase();

    if (
      currentStatus ===
        "approved" &&
      action === "approve"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This application has already been approved.",
        },
        {
          status: 409,
        }
      );
    }

    if (
      currentStatus ===
        "rejected" &&
      action === "reject"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This application has already been rejected.",
        },
        {
          status: 409,
        }
      );
    }

    /* ========================================================
       REJECT
    ======================================================== */

    if (action === "reject") {
      await applicationRef.update({
        status: "rejected",
        reviewedAt:
          new Date(),
        reviewedBy:
          decodedToken.uid,
        updatedAt:
          new Date(),
      });

      try {
        await sendReviewerRejectionEmail(
          {
            name,
            email,
          }
        );
      } catch (emailError) {
        console.error(
          "REJECTION EMAIL ERROR:",
          emailError
        );

        return NextResponse.json(
          {
            success: false,
            databaseUpdated: true,
            message:
              "Application was rejected, but the rejection email could not be sent.",
          },
          {
            status: 500,
          }
        );
      }

      return NextResponse.json({
        success: true,
        message:
          "Application rejected and email sent successfully.",
      });
    }

    /* ========================================================
       APPROVE
    ======================================================== */

    let firebaseUser;

    try {
      /*
       * First check whether an Auth account
       * already exists.
       */

      firebaseUser =
        await adminAuth.getUserByEmail(
          email
        );
    } catch (error: any) {
      if (
        error?.code ===
        "auth/user-not-found"
      ) {
        firebaseUser =
          null;
      } else {
        throw error;
      }
    }

    /*
     * We intentionally stop if an account
     * already exists.
     *
     * This prevents accidentally resetting
     * an existing user's password.
     */

    if (firebaseUser) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A Firebase Authentication account already exists for this email. The reviewer was not approved automatically.",
        },
        {
          status: 409,
        }
      );
    }

    /* ========================================================
       CREATE ACCOUNT
    ======================================================== */

    const temporaryPassword =
      generateRandomPassword();

    firebaseUser =
      await adminAuth.createUser({
        email,
        password:
          temporaryPassword,
        displayName:
          name,
        emailVerified:
          false,
        disabled: false,
      });

    /* ========================================================
       CREATE REVIEWER DOCUMENT
    ======================================================== */

    const reviewerRef =
      adminFirestore
        .collection("reviewer")
        .doc(applicationId);

    await reviewerRef.set(
      {
        uid:
          firebaseUser.uid,

        name,

        email,

        phone:
          application.phone ||
          "",

        affiliation:
          application.affiliation ||
          "",

        designation:
          application.designation ||
          "",

        expertise:
          Array.isArray(
            application.expertise
          )
            ? application.expertise
            : [],

        status: "active",

        applicationId,

        approvedAt:
          new Date(),

        createdAt:
          new Date(),

        updatedAt:
          new Date(),
      },
      {
        merge: true,
      }
    );

    /* ========================================================
       UPDATE APPLICATION
    ======================================================== */

    await applicationRef.update({
      status: "approved",

      reviewerId:
        firebaseUser.uid,

      reviewedAt:
        new Date(),

      reviewedBy:
        decodedToken.uid,

      updatedAt:
        new Date(),
    });

    /* ========================================================
       SEND APPROVAL EMAIL
    ======================================================== */

    try {
      await sendReviewerApprovalEmail(
        {
          name,
          email,
          password:
            temporaryPassword,
        }
      );
    } catch (emailError) {
      console.error(
        "APPROVAL EMAIL ERROR:",
        emailError
      );

      return NextResponse.json(
        {
          success: false,

          accountCreated: true,

          reviewerCreated: true,

          message:
            "Reviewer account was created successfully, but the approval email could not be sent. Check your SMTP configuration.",
        },
        {
          status: 500,
        }
      );
    }

    /* ========================================================
       SUCCESS
    ======================================================== */

    return NextResponse.json({
      success: true,

      accountCreated: true,

      reviewerCreated: true,

      emailSent: true,

      message:
        "Reviewer approved, account created, and login credentials sent by email.",
    });
  } catch (error) {
    console.error(
      "REVIEWER DECISION API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Unable to process reviewer application.",
      },
      {
        status: 500,
      }
    );
  }
}