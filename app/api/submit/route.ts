import { NextResponse } from "next/server";
import { adminDb } from "@/lib/FirebaseAdmin";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const title = formData.get("title")?.toString();
    const author = formData.get("author")?.toString();
    const email = formData.get("email")?.toString();
    const keywords = formData.get("keywords")?.toString();
    const abstract = formData.get("abstract")?.toString();

    if (!title || !author || !email || !abstract) {
      return NextResponse.json({
        success: false,
        message: "Required fields missing",
      });
    }

    const submissionRef = adminDb.collection("submissions").doc();

    const paperId = `JFER-${Date.now()}`;

    await submissionRef.set({
      paperId,
      title,
      author,
      email,
      keywords: keywords || "",
      abstract,
      pdfUrl: "",
      status: "pending",
      submittedAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      paperId,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({
      success: false,
      message: "Server error",
    });
  }
}
