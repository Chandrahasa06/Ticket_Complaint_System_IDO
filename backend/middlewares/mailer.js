import nodemailer from "nodemailer";

const createTransporter = () => nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTPEmail = async (email, otp) => {
  await createTransporter().sendMail({
    from: process.env.EMAIL_USER,
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

export const sendCloseEmail = async (email, username, ticketTitle, remark) => {
  await createTransporter().sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Ticket Closed",
    html: `
      <div style="font-family: Arial, sans-serif; background:#f5f7fb; padding:32px;">
        <div style="max-width:600px; margin:auto; background:white; border-radius:14px; padding:32px; box-shadow:0 8px 24px rgba(0,0,0,0.08);">
          
          <h2 style="margin-top:0; color:#111827;">Ticket Closed</h2>

          <p style="font-size:15px; color:#374151;">Hello ${username},</p>

          <p style="font-size:15px; color:#374151; line-height:1.7;">
            Your ticket <strong>"${ticketTitle}"</strong> has been reviewed and closed by our team.
          </p>

          <div style="background:#f3f4f6; border-left:4px solid #6366f1; padding:14px 16px; border-radius:8px; margin:24px 0;">
            <p style="margin:0 0 6px 0; font-size:13px; font-weight:600; color:#6366f1; letter-spacing:0.04em;">REMARK FROM TECHNICIAN</p>
            <p style="margin:0; font-size:14px; color:#374151; line-height:1.6;">
              ${remark || "No additional remarks provided."}
            </p>
          </div>

          <p style="font-size:15px; color:#374151;">
            If you have further concerns, please raise a new ticket.
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
export const sendResolveEmail = async (email, username, ticketTitle, remark) => {
  await createTransporter().sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Ticket Resolved",
    html: `
      <div style="font-family: Arial, sans-serif; background:#f5f7fb; padding:32px;">
        <div style="max-width:600px; margin:auto; background:white; border-radius:14px; padding:32px; box-shadow:0 8px 24px rgba(0,0,0,0.08);">
          
          <h2 style="margin-top:0; color:#111827;">Ticket Resolved</h2>

          <p style="font-size:15px; color:#374151;">Hello ${username},</p>

          <p style="font-size:15px; color:#374151; line-height:1.7;">
            Your ticket <strong>"${ticketTitle}"</strong> has been reviewed and marked as resolved by our team.
          </p>

          <div style="background:#f0fdf4; border-left:4px solid #10b981; padding:14px 16px; border-radius:8px; margin:24px 0;">
            <p style="margin:0 0 6px 0; font-size:13px; font-weight:600; color:#059669; letter-spacing:0.04em;">REMARK FROM TECHNICIAN</p>
            <p style="margin:0; font-size:14px; color:#374151; line-height:1.6;">
              ${remark || "No additional remarks provided."}
            </p>
          </div>

          <p style="font-size:15px; color:#374151;">
            If the issue persists, please raise a follow-up ticket.
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

export const sendOverdueNotifyEmail = async (email, username, ticketId, ticketSubject, ticketArea) => {
  await createTransporter().sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: `⚠️ Overdue Ticket Alert — #${ticketId}`,
    html: `
      <div style="font-family: Arial, sans-serif; background:#f5f7fb; padding:32px;">
        <div style="max-width:600px; margin:auto; background:white; border-radius:14px; padding:32px; box-shadow:0 8px 24px rgba(0,0,0,0.08);">

          <div style="background:#fef2f2; border-left:4px solid #ef4444; padding:14px 16px; border-radius:8px; margin-bottom:24px;">
            <p style="margin:0; font-size:14px; font-weight:700; color:#dc2626;">⚠️ OVERDUE TICKET ALERT</p>
          </div>

          <h2 style="margin-top:0; color:#111827;">Action Required</h2>

          <p style="font-size:15px; color:#374151;">Hello ${username},</p>

          <p style="font-size:15px; color:#374151; line-height:1.7;">
            The following ticket assigned to your area has been marked as <strong style="color:#dc2626;">OVERDUE</strong> and requires your immediate attention.
          </p>

          <div style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:10px; padding:18px; margin:20px 0;">
            <p style="margin:0 0 8px 0; font-size:13px; color:#9ca3af; font-weight:600; letter-spacing:0.04em;">TICKET DETAILS</p>
            <p style="margin:0 0 6px 0; font-size:15px; font-weight:700; color:#111827;">
              #${ticketId} — ${ticketSubject}
            </p>
            <p style="margin:0; font-size:13px; color:#6b7280;">Area: ${ticketArea}</p>
          </div>

          <p style="font-size:15px; color:#374151;">
            Please log in to your dashboard and take action on this ticket as soon as possible.
          </p>

          <p style="margin-top:28px; font-size:14px; color:#6b7280;">
            Regards,<br/>
            Infrastructure Help Desk IIT Indore Team
          </p>
        </div>
      </div>
    `,
  });
};