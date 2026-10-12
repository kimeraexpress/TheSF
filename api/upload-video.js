export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-filename'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return res.status(503).json({ error: 'BLOB_READ_WRITE_TOKEN non ancora configurato nelle variabili di Vercel' });
  }

  if (req.method === 'GET') {
    return res.status(200).json({ status: 'ready', hasToken: true });
  }

  if (req.method !== 'POST' && req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rawFilename = req.headers['x-filename'] || `drop-${Date.now()}.mp4`;
  const cleanFilename = String(rawFilename).replace(/[^a-zA-Z0-9._-]/g, '_');
  const contentType = req.headers['content-type'] || 'video/mp4';

  try {
    const blobRes = await fetch(`https://blob.vercel-storage.com/${cleanFilename}`, {
      method: 'PUT',
      headers: {
        'authorization': `Bearer ${token}`,
        'x-api-version': '7',
        'x-content-type': contentType
      },
      body: req,
      duplex: 'half'
    });

    const data = await blobRes.json().catch(() => ({}));

    if (!blobRes.ok) {
      return res.status(blobRes.status).json({
        error: data.error?.message || 'Errore durante il caricamento su Vercel Blob'
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Errore streaming Vercel Blob:', err);
    return res.status(500).json({ error: err.message });
  }
}
