import webpush from 'web-push';
import { prisma } from '../prisma/client.js';

webpush.setVapidDetails(
  process.env.VAPID_MAILTO,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export async function sendPushToUser(userId, payload) {
  await sendPush("user", userId, payload);
}

export async function sendPushToTechnician(technicianId, payload) {
  await sendPush("technician", technicianId, payload);
}

async function sendPush(type, id, payload) {
  const subs = await prisma.pushSubscription.findMany({
    where: { subscriberType: type, subscriberId: id }
  });

  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth }
        },
        JSON.stringify(payload)
      );
    } catch (err) {
      console.error('webpush error:', err.statusCode, err.message); // ← add
      if (err.statusCode === 410) {
        await prisma.pushSubscription.delete({ where: { id: sub.id } });
      }
    }
  }
}