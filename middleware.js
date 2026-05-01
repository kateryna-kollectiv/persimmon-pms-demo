export const config = {
  matcher: ['/((?!api/login|login.html|favicon.svg|apple-touch-icon.png).*)'],
};

export default function middleware(request) {
  const expected = process.env.SITE_PASSWORD;

  if (!expected) {
    return new Response(
      'SITE_PASSWORD environment variable is not set. Configure it in Vercel Project Settings.',
      { status: 500, headers: { 'content-type': 'text/plain' } }
    );
  }

  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/(?:^|;\s*)site_auth=([^;]+)/);
  const token = match ? decodeURIComponent(match[1]) : null;

  if (token === expected) {
    return;
  }

  const url = new URL(request.url);
  url.pathname = '/login.html';
  url.search = '';
  return Response.redirect(url, 307);
}
