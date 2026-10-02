export default async function handler(req, res) {
  // Abilita CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      body = {};
    }
  }

  const { password } = body || {};
  // Password predefinita: tsf2026 (o configurata su Vercel nelle Environment Variables)
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'tsf2026';

  if (!password || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Password errata' });
  }

  const token = process.env.GITHUB_TOKEN || '';
  const repo = process.env.GITHUB_REPO || 'kimeraexpress/TheSF';

  return res.status(200).json({
    success: true,
    token: token,
    hasToken: Boolean(token),
    repo: repo
  });
}
