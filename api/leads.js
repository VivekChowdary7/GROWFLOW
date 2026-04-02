import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

function sanitize(value) {
  return String(value || '').trim();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, message: 'Method not allowed' });
  }

  try {
    const email = sanitize(req.body?.email);
    const whatsapp = sanitize(req.body?.whatsapp);
    const category = sanitize(req.body?.category);

    if (!email && !whatsapp) {
      return res.status(400).json({ ok: false, message: 'At least one contact field is required.' });
    }

    if (!category) {
      return res.status(400).json({ ok: false, message: 'Business category is required.' });
    }

    const contact = email || whatsapp;
    const line = `${contact} - ${category}`;

    await redis.rpush('leads:list', line);

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ ok: false, message: 'Could not save lead.', error: error.message });
  }
}
