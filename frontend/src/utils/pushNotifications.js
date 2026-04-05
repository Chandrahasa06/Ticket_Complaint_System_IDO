const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  if (!base64String) {
    console.error('VAPID key is undefined/null!');
    return null;
  }
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

export async function subscribeToPush() {
  const key = process.env.REACT_APP_VAPID_PUBLIC_KEY;

  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
  if (!key) {
    console.error('VAPID key missing, aborting');
    return;
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return;

  const reg = await navigator.serviceWorker.ready;

  try {
    const existing = await reg.pushManager.getSubscription();
    if (existing) {
      await saveSubscription(existing);
      return;
    }

    const applicationServerKey = urlBase64ToUint8Array(key);
    if (!applicationServerKey) return; // ← guard against null

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey
    });

    await saveSubscription(sub);
  } catch (err) {
    console.error('Push subscription error:', err);
  }
}
async function saveSubscription(sub) {
  const res = await fetch('http://localhost:3000/api/push/subscribe', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sub.toJSON())
  });
  return res;
}
export async function unsubscribeFromPush() {
  if (!('serviceWorker' in navigator)) return;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (sub) {
    await fetch('http://localhost:3000/api/push/unsubscribe', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: sub.endpoint })
    });
    await sub.unsubscribe();
  }
}