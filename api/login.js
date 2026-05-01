export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const expected = process.env.SITE_PASSWORD;
  if (!expected) {
    res.status(500).json({ error: 'SITE_PASSWORD not configured' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const password = body && body.password;

  if (password !== expected) {
    res.status(401).json({ error: 'Incorrect password' });
    return;
  }

  const maxAge = 60 * 60 * 24 * 30;
  const value = encodeURIComponent(expected);
  res.setHeader(
    'Set-Cookie',
    `site_auth=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`
  );
  res.status(200).json({ ok: true });
}
