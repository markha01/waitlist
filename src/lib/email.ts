import nodemailer from "nodemailer";

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: parseInt(process.env.SMTP_PORT || "587") === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendConfirmationEmail(
  name: string,
  email: string
): Promise<void> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP credentials not configured — skipping confirmation email.");
    return;
  }

  const transporter = createTransporter();
  const from = process.env.SMTP_FROM || "Liivo Hair Salon";
  const firstName = name.split(" ")[0];

  await transporter.sendMail({
    from,
    to: email,
    subject: `You're on the Liivo waitlist ✦`,
    html: buildEmailHtml(firstName),
    text: buildEmailText(firstName),
  });
}

function buildEmailHtml(firstName: string): string {
  const year = new Date().getFullYear();
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You're on the Liivo Waitlist</title>
</head>
<body style="margin:0;padding:0;background-color:#0d0d0d;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0d0d0d;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0"
          style="max-width:520px;background-color:#141414;border:1px solid #222;border-radius:16px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:48px 40px 36px;text-align:center;border-bottom:1px solid #1e1e1e;">
              <p style="margin:0 0 14px;font-size:22px;color:#d4af70;line-height:1;">✦</p>
              <h1 style="margin:0;font-size:34px;font-weight:700;color:#ffffff;letter-spacing:-1px;line-height:1.1;">
                Liivo
              </h1>
              <p style="margin:10px 0 0;font-size:10px;color:#d4af70;text-transform:uppercase;letter-spacing:4px;font-weight:600;">
                Hair Salon
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h2 style="margin:0 0 18px;font-size:22px;font-weight:600;color:#ffffff;line-height:1.3;">
                You&apos;re on the list, ${firstName}!
              </h2>
              <p style="margin:0 0 16px;font-size:15px;color:#888;line-height:1.75;">
                Thank you for your interest in Liivo. We&apos;re putting the finishing touches on our salon and can&apos;t wait to welcome you.
              </p>
              <p style="margin:0 0 28px;font-size:15px;color:#888;line-height:1.75;">
                As a waitlist member, you&apos;ll be the first to know when we open for bookings — with priority access before anyone else.
              </p>

              <!-- Callout box -->
              <div style="background-color:#1a1a1a;border:1px solid #2a2a2a;border-left:3px solid #d4af70;border-radius:10px;padding:20px 24px;">
                <p style="margin:0 0 6px;font-size:11px;color:#d4af70;text-transform:uppercase;letter-spacing:2px;font-weight:700;">
                  Your spot is reserved
                </p>
                <p style="margin:0;font-size:14px;color:#aaa;line-height:1.65;">
                  No action needed. We&apos;ll reach out as soon as appointments are available.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;text-align:center;border-top:1px solid #1e1e1e;">
              <p style="margin:0;font-size:12px;color:#444;line-height:1.6;">
                &copy; ${year} Liivo Hair Salon &nbsp;&middot;&nbsp; You received this because you joined our waitlist.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

function buildEmailText(firstName: string): string {
  const year = new Date().getFullYear();
  return `
You're on the list, ${firstName}!

Thank you for your interest in Liivo Hair Salon. We're putting the finishing touches on our salon and can't wait to welcome you.

As a waitlist member, you'll be the first to know when we open for bookings — with priority access before anyone else.

Your spot is reserved — no action needed. We'll reach out as soon as appointments are available.

© ${year} Liivo Hair Salon
You received this because you joined our waitlist.
`.trim();
}
