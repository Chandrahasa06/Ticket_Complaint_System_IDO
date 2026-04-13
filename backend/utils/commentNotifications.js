import webpush from "web-push";
import { prisma } from "../prisma/client.js";

webpush.setVapidDetails(
  process.env.VAPID_MAILTO,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Mirrors sendPush() in notify.js but works for all 3 roles
async function sendPushToRole(recipientType, recipientId, payload, ticketId) {
  // Bell notification in DB
  await prisma.notification.create({
    data: {
      message: `${payload.title}: ${payload.body}`,
      recipientType,
      recipientId,
      ticketId: ticketId ?? null,
      isRead: false,
    },
  });

  // Push subscriptions for this person
  const subs = await prisma.pushSubscription.findMany({
    where: { subscriberType: recipientType, subscriberId: recipientId },
  });

  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        JSON.stringify(payload)
      );
    } catch (err) {
      if (err.statusCode === 410) {
        await prisma.pushSubscription.delete({ where: { id: sub.id } });
      }
    }
  }
}

export async function createCommentNotifications(
  ticketId,
  commenterRole,
  commenterName,
  ticketSubject
) {
  // Same payload shape as "New Ticket Assigned" in user.routes.js
  const payload = {
    title: "New Comment on Ticket #" + ticketId,
    body: `${commenterName} (${commenterRole}): ${ticketSubject}`,
    url: `/dashboard`,
  };

  // Fetch ticket once for department + area
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: { type: true, area: true },
  });

  if (!ticket) return;

  const tasks = [];

  // ── Notify ADMINs ──────────────────────────────────────────────────────────
  if (commenterRole !== "admin") {
    const admins = await prisma.admin.findMany({ select: { id: true } });
    for (const admin of admins) {
      tasks.push(sendPushToRole("admin", admin.id, payload, ticketId));
    }
  }

  // ── Notify ENGINEERs in same department ───────────────────────────────────
  if (commenterRole !== "engineer") {
    const engineers = await prisma.engineer.findMany({
      where: { department: ticket.type },
      select: { id: true },
    });
    for (const eng of engineers) {
      tasks.push(sendPushToRole("engineer", eng.id, payload, ticketId));
    }
  }

  // ── Notify TECHNICIANs in same department + area ──────────────────────────
  if (commenterRole !== "technician") {
    const technicians = await prisma.technician.findMany({
      where: { department: ticket.type },
      select: { id: true, area: true },
    });
    const matching = technicians.filter((t) =>
      t.area
        ? t.area.split(",").map((a) => a.trim()).includes(ticket.area)
        : false
    );
    for (const tech of matching) {
      tasks.push(sendPushToRole("technician", tech.id, payload, ticketId));
    }
  }

  await Promise.all(tasks);
}