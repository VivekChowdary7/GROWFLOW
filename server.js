import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const LEADS_FILE = process.env.LEADS_FILE || path.join(__dirname, 'leads.txt');

app.use(express.json());
app.use(express.static(__dirname));

function sanitize(value) {
  return String(value || '').trim();
}

async function appendLead(contactValue, category) {
  await fs.mkdir(path.dirname(LEADS_FILE), { recursive: true });
  const line = `${contactValue} - ${category}\n`;
  await fs.appendFile(LEADS_FILE, line, 'utf8');
}

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/leads', async (req, res) => {
  try {
    const email = sanitize(req.body?.email);
    const whatsapp = sanitize(req.body?.whatsapp);
    const category = sanitize(req.body?.category);

    if (!email && !whatsapp) {
      return res.status(400).json({ ok: false, message: 'At least one field is required.' });
    }

    if (!category) {
      return res.status(400).json({ ok: false, message: 'Business category is required.' });
    }

    const contactValue = email || whatsapp;
    await appendLead(contactValue, category);

    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ ok: false, message: 'Could not save lead.', error: error.message });
  }
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`GrowFlow server running on http://localhost:${PORT}`);
});
