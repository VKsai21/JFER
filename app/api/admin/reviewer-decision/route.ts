import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  adminAuth,
  adminFirestore,
} from "@/lib/FirebaseAdmin";

import {
  sendReviewerApprovalEmail,
} from "@/lib/email";

import {
  FieldValue,
} from "firebase-admin/firestore";

import {
  randomBytes,
} from "crypto";

/* ==========================================================
   HELPERS
========================================================== */

/**
 * Safely convert an unknown value to a trimmed string.
 */
function getString(
  value: unknown
): string {
  return String(
    value ?? ""
  ).trim();
}

/**
 * Generate a secure temporary password.
 *
 * Password contains:
 * - uppercase
 * - lowercase
 * - number
 * - symbol
 *
 * Ambiguous characters are excluded.
 */
function generateTemporaryPassword(
  length = 14
): string {
  const uppercase =
    "ABCDEFGHJKLMNPQRSTUVWXYZ";

  const lowercase =
    "abcdefghijkmnopqrstuvwxyz";

  const numbers =
    "23456789";

  const symbols =
    "!@#$%";

  const all =
    uppercase +
    lowercase +
    numbers +
    symbols;

  const randomCharacter =
    (
      characters: string
    ): string => {
      const randomByte =
        randomBytes(1)[0];

      return characters[
        randomByte %
          characters.length
      ];
    };

  const password: string[] = [
    randomCharacter(
      uppercase
    ),

    randomCharacter(
      lowercase
    ),

    randomCharacter(
      numbers
    ),

    randomCharacter(
      symbols
    ),
  ];

  while (
    password.length <
    length
  ) {
    password.push(
      randomCharacter(all)
    );
  }

  /*
   * Secure shuffle.
   */
  for (
    let i =
      password.length - 1;
    i > 0;
    i--
  ) {
    const randomByte =
      randomBytes(1)[0];

    const j =
      randomByte % (i + 1);

    const temp =
      password[i];

    password[i] =
      password[j];

    password[j] =
      temp;
  }

  return password.join("");
}

/* ==========================================================
   POST
========================================================== */

export async function POST(
  request: NextRequest
) {
  let createdUid = "";

  let reviewerCreated =
    false;

  let userCreated =
    false;

  let applicationUpdated =
    false;

  try {
    /* ======================================================
       STEP 1
       READ REQUEST
    ====================================================== */

    const body =
      await request.json();

    const applicationId =
      getString(
        body?.applicationId
      );

    const action =
      getString(
        body?.action
      ).toLowerCase();

    /* ======================================================
       VALIDATE APPLICATION ID
    ====================================================== */

    if (!applicationId) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Application ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    /* ======================================================
       VALIDATE ACTION
    ====================================================== */

    if (
      action !== "approve" &&
      action !== "reject"
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Invalid reviewer decision.",
        },
        {
          status: 400,
        }
      );
    }

    /* ======================================================
       STEP 2
       GET AUTHORIZATION HEADER
    ====================================================== */

    const authorization =
      request.headers.get(
        "authorization"
      );

    if (
      !authorization ||
      !authorization.startsWith(
        "Bearer "
      )
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Authentication required.",
        },
        {
          status: 401,
        }
      );
    }

    const idToken =
      authorization
        .substring(7)
        .trim();

    if (!idToken) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Authentication token is missing.",
        },
        {
          status: 401,
        }
      );
    }

    /* ======================================================
       STEP 3
       VERIFY FIREBASE ID TOKEN
    ====================================================== */

    const decodedToken =
      await adminAuth.verifyIdToken(
        idToken
      );

    const adminUid =
      decodedToken.uid;

    console.log(
      "REVIEWER DECISION - AUTH UID:",
      adminUid
    );

    /* ======================================================
       STEP 4
       GET ADMIN DOCUMENT
       
       Current structure:
       
       admin/{uid}
       
       role: "Admin"
       status: "active"
    ====================================================== */

    const adminRef =
      adminFirestore
        .collection("admin")
        .doc(adminUid);

    const adminSnapshot =
      await adminRef.get();

    if (
      !adminSnapshot.exists
    ) {
      console.error(
        "REVIEWER DECISION - ADMIN DOCUMENT NOT FOUND:",
        adminUid
      );

      return NextResponse.json(
        {
          success: false,

          message:
            "Administrator account not found.",
        },
        {
          status: 403,
        }
      );
    }

    const adminData =
      adminSnapshot.data();

    /* ======================================================
       STEP 5
       NORMALIZE ADMIN ROLE
       
       Your database:
       
       role: "Admin"
       
       becomes:
       
       "admin"
    ====================================================== */

    const adminRole =
      getString(
        adminData?.role
      ).toLowerCase();

    const adminStatus =
      getString(
        adminData?.status
      ).toLowerCase();

    console.log(
      "REVIEWER DECISION - ADMIN DATA:",
      {
        uid: adminUid,

        role:
          adminData?.role,

        normalizedRole:
          adminRole,

        status:
          adminData?.status,
      }
    );

    /* ======================================================
       STEP 6
       VERIFY ADMIN STATUS
    ====================================================== */

    if (
      adminStatus !==
      "active"
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Your administrator account is inactive.",
        },
        {
          status: 403,
        }
      );
    }

    /* ======================================================
       STEP 7
       VERIFY ADMIN ROLE
       
       ONLY "ADMIN" IS ALLOWED.
    ====================================================== */

    if (
      adminRole !==
      "admin"
    ) {
      console.error(
        "REVIEWER DECISION - INVALID ADMIN ROLE:",
        {
          uid: adminUid,

          role:
            adminData?.role,

          normalizedRole:
            adminRole,
        }
      );

      return NextResponse.json(
        {
          success: false,

          message:
            "You do not have permission to manage reviewers.",
        },
        {
          status: 403,
        }
      );
    }

    /* ======================================================
       STEP 8
       GET REVIEWER APPLICATION
    ====================================================== */

    const applicationRef =
      adminFirestore
        .collection(
          "reviewerApplications"
        )
        .doc(
          applicationId
        );

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

    /* ======================================================
       STEP 9
       APPLICATION INFORMATION
    ====================================================== */

    const name =
      getString(
        application?.name
      ) ||
      "Reviewer";

    const email =
      getString(
        application?.email
      ).toLowerCase();

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

    /* ======================================================
       STEP 10
       REJECT
    ====================================================== */

    if (
      action ===
      "reject"
    ) {
      const currentStatus =
        getString(
          application?.status
        ).toLowerCase();

      /*
       * Don't allow an already approved
       * application to be rejected.
       */

      if (
        currentStatus ===
        "approved"
      ) {
        return NextResponse.json(
          {
            success: false,

            message:
              "An approved reviewer application cannot be rejected.",
          },
          {
            status: 409,
          }
        );
      }

      await applicationRef.update({
        status:
          "rejected",

        reviewedAt:
          FieldValue.serverTimestamp(),

        reviewedBy:
          adminUid,

        updatedAt:
          FieldValue.serverTimestamp(),
      });

      return NextResponse.json({
        success: true,

        message:
          "Reviewer application rejected.",
      });
    }

    /* ======================================================
       STEP 11
       PREVENT DUPLICATE APPROVAL
    ====================================================== */

    const currentStatus =
      getString(
        application?.status
      ).toLowerCase();

    if (
      currentStatus ===
        "approved" &&
      application?.uid
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "This reviewer application has already been approved.",
        },
        {
          status: 409,
        }
      );
    }

    /* ======================================================
       STEP 12
       CHECK EXISTING FIREBASE AUTH USER
    ====================================================== */

    let existingUser:
      | any
      | null = null;

    try {
      existingUser =
        await adminAuth.getUserByEmail(
          email
        );
    } catch (
      error: any
    ) {
      /*
       * This error is expected when
       * the user doesn't exist.
       */

      if (
        error?.code !==
        "auth/user-not-found"
      ) {
        throw error;
      }
    }

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,

          message:
            "A Firebase Authentication account already exists for this email address.",
        },
        {
          status: 409,
        }
      );
    }

    /* ======================================================
       STEP 13
       GENERATE TEMPORARY PASSWORD
    ====================================================== */

    const temporaryPassword =
      generateTemporaryPassword(
        14
      );

    /* ======================================================
       STEP 14
       CREATE FIREBASE AUTH ACCOUNT
    ====================================================== */

    const createdUser =
      await adminAuth.createUser({
        email,

        password:
          temporaryPassword,

        displayName:
          name,

        emailVerified:
          false,

        disabled:
          false,
      });

    createdUid =
      createdUser.uid;

    console.log(
      "REVIEWER DECISION - AUTH USER CREATED:",
      createdUid
    );

    /* ======================================================
       STEP 15
       CREATE FIRESTORE REFERENCES
       
       reviewer/{uid}
       users/{uid}
    ====================================================== */

    const reviewerRef =
      adminFirestore
        .collection("reviewer")
        .doc(createdUid);

    const userRef =
      adminFirestore
        .collection("users")
        .doc(createdUid);

    /* ======================================================
       STEP 16
       CREATE REVIEWER PROFILE
    ====================================================== */

    await reviewerRef.set({
      uid:
        createdUid,

      applicationId:
        applicationId,

      name:
        name,

      email:
        email,

      phone:
        getString(
          application?.phone
        ),

      affiliation:
        getString(
          application?.affiliation
        ),

      designation:
        getString(
          application?.designation
        ),

      expertise:
        Array.isArray(
          application?.expertise
        )
          ? application.expertise
          : [],

      role:
        "reviewer",

      status:
        "active",

      approvedAt:
        FieldValue.serverTimestamp(),

      createdAt:
        FieldValue.serverTimestamp(),

      updatedAt:
        FieldValue.serverTimestamp(),
    });

    reviewerCreated =
      true;

    /* ======================================================
       STEP 17
       CREATE CENTRAL USER RECORD
       
       THIS IS USED BY LOGIN.
       
       mustChangePassword = true
       
       means the reviewer must change
       the temporary password.
    ====================================================== */

    await userRef.set({
      uid:
        createdUid,

      name:
        name,

      email:
        email,

      role:
        "reviewer",

      status:
        "active",

      mustChangePassword:
        true,

      createdAt:
        FieldValue.serverTimestamp(),

      updatedAt:
        FieldValue.serverTimestamp(),
    });

    userCreated =
      true;

    /* ======================================================
       STEP 18
       UPDATE APPLICATION
    ====================================================== */

    await applicationRef.update({
      status:
        "approved",

      uid:
        createdUid,

      reviewedAt:
        FieldValue.serverTimestamp(),

      reviewedBy:
        adminUid,

      approvedAt:
        FieldValue.serverTimestamp(),

      updatedAt:
        FieldValue.serverTimestamp(),
    });

    applicationUpdated =
      true;

    /* ======================================================
       STEP 19
       SEND CREDENTIAL EMAIL
    ====================================================== */

    try {
      await sendReviewerApprovalEmail({
        name,

        email,

        password:
          temporaryPassword,
      });
    } catch (
      emailError
    ) {
      console.error(
        "REVIEWER DECISION - EMAIL FAILED:",
        emailError
      );

      /* ====================================================
         ROLLBACK REVIEWER DOCUMENT
      ==================================================== */

      if (
        reviewerCreated
      ) {
        try {
          await reviewerRef.delete();
        } catch (
          cleanupError
        ) {
          console.error(
            "REVIEWER DOCUMENT ROLLBACK FAILED:",
            cleanupError
          );
        }
      }

      /* ====================================================
         ROLLBACK USERS DOCUMENT
      ==================================================== */

      if (
        userCreated
      ) {
        try {
          await userRef.delete();
        } catch (
          cleanupError
        ) {
          console.error(
            "USERS DOCUMENT ROLLBACK FAILED:",
            cleanupError
          );
        }
      }

      /* ====================================================
         ROLLBACK APPLICATION
      ==================================================== */

      if (
        applicationUpdated
      ) {
        try {
          await applicationRef.update({
            status:
              "pending",

            uid:
              FieldValue.delete(),

            reviewedAt:
              FieldValue.delete(),

            reviewedBy:
              FieldValue.delete(),

            approvedAt:
              FieldValue.delete(),

            updatedAt:
              FieldValue.serverTimestamp(),
          });
        } catch (
          cleanupError
        ) {
          console.error(
            "APPLICATION ROLLBACK FAILED:",
            cleanupError
          );
        }
      }

      /* ====================================================
         ROLLBACK FIREBASE AUTH USER
      ==================================================== */

      if (
        createdUid
      ) {
        try {
          await adminAuth.deleteUser(
            createdUid
          );
        } catch (
          cleanupError
        ) {
          console.error(
            "AUTH USER ROLLBACK FAILED:",
            cleanupError
          );
        }
      }

      createdUid = "";

      return NextResponse.json(
        {
          success: false,

          message:
            "Reviewer account could not be completed because the credential email could not be sent. The application has been returned to pending.",
        },
        {
          status: 500,
        }
      );
    }

    /* ======================================================
       STEP 20
       SUCCESS
    ====================================================== */

    return NextResponse.json({
      success: true,

      message:
        "Reviewer approved, account created, and login credentials sent by email.",
    });
  } catch (
    error: any
  ) {
    console.error(
      "REVIEWER DECISION ERROR:",
      error
    );

    /* ======================================================
       GENERAL CLEANUP
    ====================================================== */

    if (
      createdUid
    ) {
      try {
        await adminAuth.deleteUser(
          createdUid
        );
      } catch (
        cleanupError
      ) {
        console.error(
          "GENERAL AUTH CLEANUP ERROR:",
          cleanupError
        );
      }
    }

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Unable to process reviewer application.",
      },
      {
        status: 500,
      }
    );
  }
}