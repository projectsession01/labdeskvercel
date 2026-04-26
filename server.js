const express = require('express');
const path    = require('path');
const app     = express();
const PORT    = process.env.PORT || 5050;

// Serve all static files in this folder
app.use(express.static(__dirname));

// ── Proxy endpoint ──────────────────────────────────────────────────────────
// Usage: GET /proxy?url=https://stackoverflow.com
app.get('/proxy', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send('Missing ?url= parameter');

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
        'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
    });

    // Headers that block iframe embedding — drop them
    const STRIP = new Set([
      'x-frame-options',
      'content-security-policy',
      'x-xss-protection',
      'content-encoding',   // we decode with fetch, don't re-encode
      'transfer-encoding',
      'connection',
    ]);

    response.headers.forEach((value, key) => {
      if (!STRIP.has(key.toLowerCase())) res.setHeader(key, value);
    });
    res.status(response.status);

    const ct = response.headers.get('content-type') || '';

    if (ct.includes('text/html')) {
      let html = await response.text();
      const origin = new URL(targetUrl).origin;

      // 1. Inject <base> so relative paths resolve correctly
      const base = `<base href="${targetUrl}">`;
      if (/<head/i.test(html)) {
        html = html.replace(/(<head[^>]*>)/i, `$1${base}`);
      } else {
        html = base + html;
      }

      // 2. Rewrite absolute same-site hrefs to stay proxied
      html = html.replace(
        /href="(https?:\/\/[^"]+)"/g,
        (_, u) => `href="/proxy?url=${encodeURIComponent(u)}"`
      );
      html = html.replace(
        /action="(https?:\/\/[^"]+)"/g,
        (_, u) => `action="/proxy?url=${encodeURIComponent(u)}"`
      );

      res.send(html);
    } else {
      const buf = await response.arrayBuffer();
      res.send(Buffer.from(buf));
    }
  } catch (err) {
    res.status(500).send(
      `<h2 style="font-family:sans-serif;color:#f55">Proxy Error</h2><pre>${err.message}</pre>`
    );
  }
});

// Export for Electron, also support direct `node server.js`
function startServer(port = PORT) {
  return new Promise((resolve, reject) => {
    const srv = app.listen(port, () => {
      console.log(`\n  ⚡ LabDesk  →  http://localhost:${port}\n`);
      resolve(port);
    });
    srv.on('error', reject);
  });
}

module.exports = { startServer };

if (require.main === module) startServer(PORT);
