import cron from "node-cron";
import { prisma } from "../prisma/client.js";
import { sendOverdueNotifyEmail } from "../middlewares/mailer.js";

cron.schedule("0 9 * * *", async () => {
  try {
    const sixDaysAgo = new Date();
    sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);

    const overdueTickets = await prisma.ticket.findMany({
      where: {
        status: "OVERDUE",
        createdAt: { lt: sixDaysAgo }
      }
    });

    if (overdueTickets.length === 0) {
      console.log("No tickets older than 6 days to alert admin about.");
      return;
    }

    console.log(`Found ${overdueTickets.length} overdue ticket(s) older than 6 days.`);

    // Get all admins
    const admins = await prisma.admin.findMany();

    for (const ticket of overdueTickets) {
      for (const admin of admins) {
        // Email admin
        await sendOverdueNotifyEmail(
          admin.email,
          admin.username,
          ticket.id,
          ticket.subject,
          ticket.area
        );

        // Save in-app notification for admin
        await prisma.notification.create({
          data: {
            message: `🚨 Ticket #${ticket.id} "${ticket.subject}" has been overdue for 6+ days!`,
            recipientType: "admin",
            recipientId: admin.id,
            ticketId: ticket.id,
            isRead: false,
          }
        });
      }
    }

  } catch (e) {
    console.log("Error in overdue_admin cron job:", e);
  }
});