import nodemailer from "nodemailer";

/* ==========================================================
   SMTP TRANSPORT
========================================================== */

const transporter =
  nodemailer.createTransport({
    host:
      process.env.SMTP_HOST,

    port:
      Number(
        process.env.SMTP_PORT ||
          587
      ),

    secure:
      Number(
        process.env.SMTP_PORT ||
          587
      ) === 465,

    auth: {
      user:
        process.env.SMTP_USER,

      pass:
        process.env.SMTP_PASSWORD,
    },
  });

/* ==========================================================
   SEND REVIEWER APPROVAL EMAIL
========================================================== */

export async function sendReviewerApprovalEmail({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  const loginUrl =
    `${appUrl}/login`;

  /* ========================================================
     EMAIL
  ======================================================== */

  await transporter.sendMail({
    from:
      process.env.SMTP_FROM ||
      process.env.SMTP_USER,

    to: email,

    subject:
      "JFER Reviewer Account Approved",

    /* ======================================================
       PLAIN TEXT
    ====================================================== */

    text: `
Dear ${name},

Your application to become a reviewer for the Journal of Future Engineering & Research (JFER) has been approved.

A reviewer account has been created for you.

LOGIN DETAILS
----------------------------

Email:
${email}

Temporary Password:
${password}

Login:
${loginUrl}

IMPORTANT
----------------------------

This is a temporary password.

You must change your password after your first login.

Please do not share your login credentials with anyone.

Regards,
JFER Editorial Team
`,

    /* ======================================================
       HTML
    ====================================================== */

    html: `
<!DOCTYPE html>

<html>

<head>

  <meta
    charset="UTF-8"
  />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>
    JFER Reviewer Account
  </title>

</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f7f7f7;
    font-family:Arial,Helvetica,sans-serif;
  "
>

  <div
    style="
      max-width:600px;
      margin:40px auto;
      background:#ffffff;
      border:1px solid #e5e5e5;
      border-radius:14px;
      overflow:hidden;
    "
  >

    <!-- HEADER -->

    <div
      style="
        background:#111111;
        padding:30px;
      "
    >

      <div
        style="
          color:#d8b78d;
          font-size:12px;
          font-weight:bold;
          letter-spacing:2px;
          text-transform:uppercase;
        "
      >
        JFER
      </div>

      <h1
        style="
          margin:12px 0 0;
          color:#ffffff;
          font-size:24px;
          font-weight:500;
        "
      >
        Reviewer Account Approved
      </h1>

    </div>

    <!-- CONTENT -->

    <div
      style="
        padding:32px;
      "
    >

      <p
        style="
          margin:0;
          color:#333333;
          font-size:15px;
        "
      >
        Dear ${name},
      </p>

      <p
        style="
          margin:18px 0 0;
          color:#555555;
          font-size:14px;
          line-height:1.7;
        "
      >
        Your application to become a reviewer
        for the Journal of Future Engineering
        & Research (JFER) has been approved.
        Your reviewer account has now been created.
      </p>

      <!-- LOGIN DETAILS -->

      <div
        style="
          margin-top:25px;
          padding:22px;
          background:#f7f9fb;
          border:1px solid #e5e9ed;
          border-radius:10px;
        "
      >

        <p
          style="
            margin:0 0 8px;
            color:#777777;
            font-size:11px;
            text-transform:uppercase;
            letter-spacing:1px;
          "
        >
          Login Email
        </p>

        <p
          style="
            margin:0 0 20px;
            color:#222222;
            font-size:15px;
            font-weight:bold;
          "
        >
          ${email}
        </p>

        <p
          style="
            margin:0 0 8px;
            color:#777777;
            font-size:11px;
            text-transform:uppercase;
            letter-spacing:1px;
          "
        >
          Temporary Password
        </p>

        <p
          style="
            margin:0;
            color:#222222;
            font-size:16px;
            font-weight:bold;
            font-family:monospace;
            letter-spacing:1px;
          "
        >
          ${password}
        </p>

      </div>

      <!-- LOGIN BUTTON -->

      <div
        style="
          margin-top:28px;
          text-align:center;
        "
      >

        <a
          href="${loginUrl}"
          style="
            display:inline-block;
            padding:13px 24px;
            background:#244e70;
            color:#ffffff;
            text-decoration:none;
            border-radius:8px;
            font-size:14px;
            font-weight:bold;
          "
        >
          Login to JFER
        </a>

      </div>

      <!-- WARNING -->

      <div
        style="
          margin-top:25px;
          padding:15px;
          background:#fff7e8;
          border:1px solid #f0dfb7;
          border-radius:8px;
        "
      >

        <p
          style="
            margin:0;
            color:#805f20;
            font-size:13px;
            line-height:1.6;
          "
        >

          <strong>
            Important:
          </strong>

          This is a temporary password.
          You must change it after your first login.

        </p>

      </div>

      <p
        style="
          margin-top:28px;
          color:#777777;
          font-size:13px;
          line-height:1.6;
        "
      >
        Please do not share your login
        credentials with anyone.
      </p>

      <p
        style="
          margin-top:28px;
          color:#555555;
          font-size:13px;
          line-height:1.6;
        "
      >

        Regards,<br />

        <strong>
          JFER Editorial Team
        </strong>

      </p>

    </div>

  </div>

</body>

</html>
`,
  });
}