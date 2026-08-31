import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(
    process.env.SMTP_PORT || 587
  ),
  secure:
    Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendReviewerApprovalEmail({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  const loginUrl =
    `${process.env.NEXT_PUBLIC_APP_URL}/login`;

  await transporter.sendMail({
    from:
      process.env.SMTP_FROM ||
      process.env.SMTP_USER,

    to: email,

    subject:
      "JFER Reviewer Account Approved",

    text: `
Dear ${name},

Your application to become a reviewer for JFER has been approved.

Your reviewer account has been created.

Login Email:
${email}

Temporary Password:
${password}

Login:
${loginUrl}

Important:
You must change this temporary password after your first login.

Please do not share your login credentials with anyone.

Regards,
JFER Editorial Team
`,

    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f7f7f7;font-family:Arial,sans-serif;">

  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e5e5e5;">

    <h2 style="margin:0;color:#244e70;">
      JFER Reviewer Account Approved
    </h2>

    <p style="color:#444;margin-top:24px;">
      Dear ${name},
    </p>

    <p style="color:#555;line-height:1.6;">
      Your application to become a reviewer for JFER has been approved.
      Your reviewer account has now been created.
    </p>

    <div style="margin-top:24px;padding:20px;background:#f7f9fb;border-radius:10px;">

      <p style="margin:0 0 10px;color:#777;font-size:13px;">
        Login Email
      </p>

      <p style="margin:0 0 20px;font-weight:bold;color:#222;">
        ${email}
      </p>

      <p style="margin:0 0 10px;color:#777;font-size:13px;">
        Temporary Password
      </p>

      <p style="margin:0;font-weight:bold;color:#222;font-family:monospace;">
        ${password}
      </p>

    </div>

    <div style="margin-top:24px;text-align:center;">

      <a
        href="${loginUrl}"
        style="
          display:inline-block;
          padding:12px 22px;
          background:#244e70;
          color:#ffffff;
          text-decoration:none;
          border-radius:8px;
          font-weight:bold;
        "
      >
        Login to JFER
      </a>

    </div>

    <div style="margin-top:25px;padding:14px;background:#fff7e8;border-radius:8px;">

      <p style="margin:0;color:#8a641c;font-size:13px;line-height:1.5;">
        <strong>Important:</strong>
        You must change this temporary password after your first login.
        Please do not share your credentials with anyone.
      </p>

    </div>

    <p style="margin-top:30px;color:#777;font-size:13px;">
      Regards,<br/>
      JFER Editorial Team
    </p>

  </div>

</body>
</html>
`,
  });
}

export async function sendReviewerRejectionEmail({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  await transporter.sendMail({
    from:
      process.env.SMTP_FROM ||
      process.env.SMTP_USER,

    to: email,

    subject:
      "JFER Reviewer Application Update",

    text: `
Dear ${name},

Thank you for your interest in becoming a reviewer for JFER.

After careful consideration, we regret to inform you that your reviewer application has not been approved at this time.

We appreciate your interest in contributing to JFER and thank you for taking the time to apply.

Regards,
JFER Editorial Team
`,

    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f7f7f7;font-family:Arial,sans-serif;">

  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e5e5e5;">

    <h2 style="margin:0;color:#244e70;">
      JFER Reviewer Application Update
    </h2>

    <p style="color:#444;margin-top:24px;">
      Dear ${name},
    </p>

    <p style="color:#555;line-height:1.6;">
      Thank you for your interest in becoming a reviewer for JFER.
    </p>

    <p style="color:#555;line-height:1.6;">
      After careful consideration, we regret to inform you that
      your reviewer application has not been approved at this time.
    </p>

    <div style="margin-top:24px;padding:20px;background:#f7f9fb;border-radius:10px;">

      <p style="margin:0;color:#555;line-height:1.6;">
        We appreciate your interest in contributing to JFER and
        thank you for taking the time to apply.
      </p>

    </div>

    <p style="margin-top:30px;color:#777;font-size:13px;">
      Regards,<br/>
      JFER Editorial Team
    </p>

  </div>

</body>
</html>
`,
  });
}