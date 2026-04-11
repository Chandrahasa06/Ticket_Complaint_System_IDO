import cron from "node-cron";
import { prisma } from "../prisma/client.js";
import { sendOverdueNotifyEmail } from "../middlewares/mailer.js";
import { sendPushToTechnician } from "../utils/notify.js";

cron.schedule("0 9 * * *", async () => {
  try {
    const fourDaysAgo = new Date();
    fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

    // Find tickets to mark overdue (get full details before updating)
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

    // Mark them overdue
    await prisma.ticket.updateMany({
      where: {
        status: { in: ["PENDING", "IN_PROGRESS"] },
        createdAt: { lt: fourDaysAgo }
      },
      data: { status: "OVERDUE" }
    });

    console.log(`Marked ${ticketsToOverdue.length} tickets as OVERDUE`);

    // For each overdue ticket — notify matching technicians & engineers
    for (const ticket of ticketsToOverdue) {
      // Find matching technicians
      const technicians = await prisma.technician.findMany({
        where: { department: ticket.type }
      });
      const matchingTechs = technicians.filter(tech =>
        tech.area.split(",").map(a => a.trim()).includes(ticket.area)
      );

      // Notify each technician
      for (const tech of matchingTechs) {
        // Push notification
        await sendPushToTechnician(tech.id, {
          title: "⚠️ Ticket Overdue",
          body: `Ticket #${ticket.id} "${ticket.subject}" is overdue!`,
          url: `/technician/dashboard`
        }, ticket.id);

        // Email notification
        await sendOverdueNotifyEmail(
          tech.email,
          tech.username,
          ticket.id,
          ticket.subject,
          ticket.area
        );
      }

      // Find matching engineers
      const engineers = await prisma.engineer.findMany({
        where: { department: ticket.type }
      });

      // Notify each engineer (email only for now)
      for (const eng of engineers) {
        await sendOverdueNotifyEmail(
          eng.email,
          eng.username,
          ticket.id,
          ticket.subject,
          ticket.area
        );

        // Save in-app notification for engineer
        await prisma.notification.create({
          data: {
            message: `⚠️ Ticket #${ticket.id} "${ticket.subject}" in ${ticket.area} is overdue!`,
            recipientType: "engineer",
            recipientId: eng.id,
            ticketId: ticket.id,
            isRead: false,
          }
        });
      }
    }
  } catch (e) {
    console.log("Error in overdue cron job:", e);
  }
});