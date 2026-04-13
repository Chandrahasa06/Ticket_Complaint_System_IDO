import cron from "node-cron";
import { prisma } from "../prisma/client.js";
import { sendOverdueNotifyEmail } from "../middlewares/mailer.js";
import { sendPushToTechnician } from "../utils/notify.js";
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
    const fourDaysAgo = new Date();
    fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

    const ticketsToOverdue = await prisma.ticket.findMany({
      where: {
        status: { in: ["PENDING", "IN_PROGRESS"] },
        createdAt: { lt: fourDaysAgo }
      }
    });

    if (ticketsToOverdue.length === 0) {
      console.log("No tickets to mark as overdue.");
      return;
    }

    await prisma.ticket.updateMany({
      where: {
        status: { in: ["PENDING", "IN_PROGRESS"] },
        createdAt: { lt: fourDaysAgo }
      },
      data: { status: "OVERDUE" }
    });

    console.log(`Marked ${ticketsToOverdue.length} tickets as OVERDUE`);

    for (const ticket of ticketsToOverdue) {
      // ── Technicians (push already existed via sendPushToTechnician) ──
      const technicians = await prisma.technician.findMany({
        where: { department: ticket.type }
      });
      const matchingTechs = technicians.filter(tech =>
        tech.area.split(",").map(a => a.trim()).includes(ticket.area)
      );

      for (const tech of matchingTechs) {
        await sendPushToTechnician(tech.id, {
          title: "Ticket Overdue",
          body: `Ticket #${ticket.id} "${ticket.subject}" is overdue!`,
          url: `/technician/dashboard`
        }, ticket.id);

        await sendOverdueNotifyEmail(
          tech.email, tech.username, ticket.id, ticket.subject, ticket.area
        );
      }

      // ── Engineers (bell existed, push is new) ──
      const engineers = await prisma.engineer.findMany({
        where: { department: ticket.type }
      });

      for (const eng of engineers) {
        await sendOverdueNotifyEmail(
          eng.email, eng.username, ticket.id, ticket.subject, ticket.area
        );

        // Bell notification (already existed)
        await prisma.notification.create({
          data: {
            message: `Ticket #${ticket.id} "${ticket.subject}" in ${ticket.area} is overdue!`,
            recipientType: "engineer",
            recipientId: eng.id,
            ticketId: ticket.id,
            isRead: false,
          }
        });

        // ← ADD: Push notification for engineer
        await sendPushToRole("engineer", eng.id, {
          title: "Ticket Overdue",
          body: `Ticket #${ticket.id} "${ticket.subject}" in ${ticket.area} is overdue!`,
          url: `/engineer/dashboard`
        }, ticket.id);
      }
    }
  } catch (e) {
    console.log("Error in overdue cron job:", e);
  }
});