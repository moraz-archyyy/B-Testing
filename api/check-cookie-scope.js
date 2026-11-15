export default function handler(req, res) {
  const rawCookie = req.headers.cookie || '';
  const jwtEntry = rawCookie
    .split(';')
    .find(c => c.trim().startsWith('_vercel_jwt='));
  const token = jwtEntry ? jwtEntry.split('=').slice(1).join('=') : null;

  res.status(200).json({
    _vercel_jwt_received: Boolean(token),
    _vercel_jwt_length: token ? token.length : 0,
    all_cookies_received: rawCookie.length > 0,
    cookie_names: rawCookie
      .split(';')
      .map(c => c.trim().split('=')[0])
      .filter(Boolean)
  });
}
