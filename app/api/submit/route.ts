import { NextResponse } from "next/server";
import { adminFirestore } from "@/lib/FirebaseAdmin";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const title =
      formData.get("title")?.toString().trim();

    const author =
      formData.get("author")?.toString().trim();

    const email =
      formData.get("email")?.toString().trim();

    const affiliation =
      formData.get("affiliation")?.toString().trim();

    const country =
      formData.get("country")?.toString().trim();

    const category =
      formData.get("category")?.toString().trim();

    const keywords =
      formData.get("keywords")?.toString().trim();

    const abstract =
      formData.get("abstract")?.toString().trim();

    /* -------------------------------------------------------
       REQUIRED FIELD VALIDATION
    ------------------------------------------------------- */

    if (
      !title ||
      !author ||
      !email ||
      !affiliation ||
      !country ||
      !category ||
      !keywords ||
      !abstract
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please complete all required fields.",
        },
        {
          status: 400,
        }
      );
    }

    /* -------------------------------------------------------
       CREATE SUBMISSION
    ------------------------------------------------------- */

    const submissionRef =
      adminFirestore
        .collection("submissions")
        .doc();

    const paperId =
      `JFER-${Date.now()}`;

    const submittedAt =
      new Date();

    await submissionRef.set({
      paperId,

      title,

      author,

      email,

      affiliation,

      country,

      category,

      keywords,

      abstract,

      // PDF upload intentionally on hold.
      pdfUrl: "",

      status: "pending",

      submittedAt,

      updatedAt: submittedAt,
    });

    return NextResponse.json({
      success: true,

      paperId,
    });

  } catch (error) {

    console.error(
      "SUBMISSION ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Server error while submitting manuscript.",
      },
      {
        status: 500,
      }
    );
  }
}