import { NextResponse } from "next/server";
import { adminFirestore } from "@/lib/FirebaseAdmin";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      name,
      email,
      subject,
      message,
    } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 }
      );
    }

    // Save inquiry to Firestore
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

    // Send email notification using SMTP
    const emailInfo = await transporter.sendMail({
      from:
        process.env.SMTP_FROM ||
        process.env.SMTP_USER,

      to: process.env.SMTP_USER,

      replyTo: email,

      subject: `New Inquiry: ${subject}`,

      text: `
New Inquiry Received

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

Inquiry ID:
${inquiryRef.id}
`,

      html: `
<!DOCTYPE html>
<html>
<body
  style="
    margin:0;
    padding:0;
    background:#f7f7f7;
    font-family:Arial,sans-serif;
  "
>
  <div
    style="
      max-width:600px;
      margin:40px auto;
      background:#ffffff;
      border-radius:12px;
      padding:32px;
      border:1px solid #e5e5e5;
    "
  >

    <h2 style="margin:0;color:#244e70;">
      New Inquiry Received
    </h2>

    <div
      style="
        margin-top:24px;
        padding:20px;
        background:#f7f9fb;
        border-radius:10px;
      "
    >

      <p style="margin:0 0 12px;">
        <strong>Name:</strong> ${name}
      </p>

      <p style="margin:0 0 12px;">
        <strong>Email:</strong> ${email}
      </p>

      <p style="margin:0 0 12px;">
        <strong>Subject:</strong> ${subject}
      </p>

    </div>

    <div
      style="
        margin-top:24px;
        padding:20px;
        border:1px solid #e5e5e5;
        border-radius:10px;
      "
    >

      <p style="margin:0 0 10px;color:#777;font-size:13px;">
        Message
      </p>

      <p style="margin:0;color:#333;line-height:1.6;">
        ${message}
      </p>

    </div>

    <div
      style="
        margin-top:24px;
        padding:14px;
        background:#f7f9fb;
        border-radius:8px;
      "
    >

      <p style="margin:0;color:#777;font-size:13px;">
        Inquiry ID
      </p>

      <p
        style="
          margin:6px 0 0;
          color:#222;
          font-family:monospace;
        "
      >
        ${inquiryRef.id}
      </p>

    </div>

    <p
      style="
        margin-top:30px;
        color:#777;
        font-size:13px;
      "
    >
      You can reply directly to this email to respond to the person
      who submitted the inquiry.
    </p>

  </div>
</body>
</html>
`,
    });

    console.log("================================");
    console.log("EMAIL SENT SUCCESSFULLY");
    console.log("Recipient:", process.env.SMTP_USER);
    console.log("Message ID:", emailInfo.messageId);
    console.log("Inquiry ID:", inquiryRef.id);
    console.log("================================");

    return NextResponse.json({
      success: true,
      message: "Inquiry submitted successfully",
    });
  } catch (error) {
    console.error("Contact API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Server Error",
      },
      { status: 500 }
    );
  }
}
