import cron from "node-cron";
import { prisma } from "../prisma/client.js";
import { sendOverdueNotifyEmail } from "../middlewares/mailer.js";
import webpush from "web-push"; // ← ADD

webpush.setVapidDetails(    // ← ADD
  process.env.VAPID_MAILTO,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

async function sendPushToRole(recipientType, recipientId, payload, ticketId) {  // ← ADD
  const subs = await prisma.pushSubscription.findMany({
    where: { subscriberType: recipientType, subscriberId: recipientId },
  });
  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload)
      );
    } catch (err) {
      if (err.statusCode === 410)
        await prisma.pushSubscription.delete({ where: { id: sub.id } });
    }
  }
}

cron.schedule("0 9 * * *", async () => {
  try {
    const sixDaysAgo = new Date();
    sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);

    const overdueTickets = await prisma.ticket.findMany({
      where: { status: "OVERDUE", createdAt: { lt: sixDaysAgo } }
    });

    if (overdueTickets.length === 0) {
      console.log("No tickets older than 6 days to alert admin about.");
      return;
    }

    console.log(`Found ${overdueTickets.length} overdue ticket(s) older than 6 days.`);

    const admins = await prisma.admin.findMany();

    for (const ticket of overdueTickets) {
      for (const admin of admins) {
        await sendOverdueNotifyEmail(
          admin.email, admin.username, ticket.id, ticket.subject, ticket.area
        );

        // Bell notification
        await prisma.notification.create({
          data: {
            message: `Ticket #${ticket.id} "${ticket.subject}" has been overdue for 6+ days!`,
            recipientType: "admin",
            recipientId: admin.id,
            ticketId: ticket.id,
            isRead: false,
          }
        });

        // ← ADD: Push notification for admin
        await sendPushToRole("admin", admin.id, {
          title: "Ticket Overdue 6+ Days",
          body: `Ticket #${ticket.id} "${ticket.subject}" needs immediate attention!`,
          url: `/admin/dashboard`
        }, ticket.id);
      }
    }

  } catch (e) {
    console.log("Error in overdue_admin cron job:", e);
  }
});