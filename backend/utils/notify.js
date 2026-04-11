import webpush from 'web-push';
import { prisma } from '../prisma/client.js';

webpush.setVapidDetails(
  process.env.VAPID_MAILTO,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export async function sendPushToUser(userId, payload, ticketId = null) {
  await sendPush("user", userId, payload, ticketId);
}

export async function sendPushToTechnician(technicianId, payload, ticketId = null) {
  await sendPush("technician", technicianId, payload, ticketId);
}

async function sendPush(type, id, payload, ticketId) {
  // Save to DB so bell icon shows it
  await prisma.notification.create({
    data: {
      message: `${payload.title}: ${payload.body}`,
      recipientType: type,
      recipientId: id,
      ticketId: ticketId ?? null,
      isRead: false,
    }
  });

  // Send push notification
  const subs = await prisma.pushSubscription.findMany({
    where: { subscriberType: type, subscriberId: id }
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