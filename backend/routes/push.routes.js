import express from 'express';
import { prisma } from '../prisma/client.js';
import { checkAuth } from '../middlewares/checkAuth.js';

const pushRouter = express.Router();

pushRouter.use(checkAuth);

// Save subscription after user grants permission
pushRouter.post('/subscribe', async (req, res) => {
  const { endpoint, keys } = req.body;
  const { p256dh, auth } = keys;

  try {
    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: {
        p256dh,
        auth,
        subscriberType: req.user.role,
        subscriberId: req.user.id,
      },
      create: {
        endpoint,
        p256dh,
        auth,
        subscriberType: req.user.role,
        subscriberId: req.user.id,
      }
    });
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to save subscription' });
  }
});

// Remove subscription on logout
pushRouter.post('/unsubscribe', async (req, res) => {
  const { endpoint } = req.body;
  try {
    await prisma.pushSubscription.deleteMany({ where: { endpoint } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: 'Failed to remove subscription' });
  }
});

export default pushRouter;