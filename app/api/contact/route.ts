import { NextResponse } from "next/server";
import { adminFirestore } from "@/lib/FirebaseAdmin";
// import { Resend } from "resend";

// const resend = new Resend(
//   process.env.RESEND_API_KEY
// );

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      name,
      email,
      subject,
      message,
    } = body;

    if (
      !name ||
      !email ||
      !subject ||
      !message
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 }
      );
    }

    // Save to Firestore

    const inquiryRef = await adminFirestore
      .collection("inquiries")
      .add({
        name,
        email,
        subject,
        message,
        status: "new",
        createdAt: new Date(),
      });

    // Send email notification

    // const emailResponse = await resend.emails.send({
    // from: "JFER <noreply@resend.dev>",
    // to: "vivekalajpur@gmail.com",
    // subject: `New Inquiry: ${subject}`,
    // html: `
    //     <h2>New Inquiry Received</h2>

    //     <p><strong>Name:</strong> ${name}</p>
    //     <p><strong>Email:</strong> ${email}</p>
    //     <p><strong>Subject:</strong> ${subject}</p>

    //     <hr/>

    //     <p>${message}</p>

    //     <hr/>

    //     <p>
    //     Inquiry ID:
    //     ${inquiryRef.id}
    //     </p>
    // `,
    // });

    // console.log("================================");
    // console.log("EMAIL SENT SUCCESSFULLY");
    // console.log("Recipient:", "shoolinat@gmail.com");
    // console.log("Message ID:", emailResponse?.data?.id);
    // console.log("Full Response:", emailResponse);
    // console.log("================================");

    return NextResponse.json({
      success: true,
      message:
        "Inquiry submitted successfully",
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Server Error",
      },
      { status: 500 }
    );
  }
}
