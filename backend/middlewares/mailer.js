import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTPEmail = async (email, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: "OTP Verification",
    html: `
      <div style="font-family: Arial; padding: 20px;">
        <p>Your OTP is:</p>
        <h1 style="letter-spacing: 5px;">${otp}</h1>
        <p>This OTP will expire in 5 minutes.</p>
      </div>
    `,
  });
};

export const sendCloseEmail = async (email, username, ticketTitle) => {
  await transporter.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: "Ticket Closed - Issue Not Under Our Department",
    html: `
      <div style="font-family: Arial, sans-serif; background:#f5f7fb; padding:32px;">
        <div style="max-width:600px; margin:auto; background:white; border-radius:14px; padding:32px; box-shadow:0 8px 24px rgba(0,0,0,0.08);">
          
          <h2 style="margin-top:0; color:#111827;">
            Ticket Closed
          </h2>

          <p style="font-size:15px; color:#374151;">
            Hello ${username},
          </p>

          <p style="font-size:15px; color:#374151; line-height:1.7;">
            Your ticket
            <strong>"${ticketTitle}"</strong>
            has been reviewed by our team.
          </p>

          <p style="font-size:15px; color:#374151; line-height:1.7;">
            Unfortunately, the issue described does not fall under our department,
            so the ticket has been closed.
          </p>

          <div style="background:#f3f4f6; border-left:4px solid #6366f1; padding:14px 16px; border-radius:8px; margin:24px 0;">
            <p style="margin:0; font-size:14px; color:#4b5563;">
              Please contact the appropriate department or create a new ticket under the correct category if required.
            </p>
          </div>

          <p style="font-size:15px; color:#374151;">
            Thank you for your understanding.
          </p>

          <p style="margin-top:28px; font-size:14px; color:#6b7280;">
            Regards,<br />
            Infrastructure Help Desk IIT Indore Team
          </p>
        </div>
      </div>
    `,
  });
};