import type { VercelRequest, VercelResponse } from '@vercel/node';

// Proxy all /api/* requests to a remote device API specified by env DEVICE_API
// Example: DEVICE_API=https://your-ngrok-subdomain.ngrok.app
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const base = process.env.DEVICE_API;
  if (!base) {
    res.status(500).json({ error: 'DEVICE_API env var not set on Vercel' });
    return;
  }

  try {
    const path = Array.isArray(req.query.path)
      ? '/' + req.query.path.join('/')
      : '/' + (req.query.path || '');

    // Original URL is /api/<path>; forward to DEVICE_API/<path>
    const targetUrl = new URL(path, base).toString();

    const headers: Record<string, string> = {};
    for (const [k, v] of Object.entries(req.headers)) {
      if (['host', 'content-length', 'connection'].includes(k.toLowerCase())) continue;
      const sv = Array.isArray(v) ? v.join(',') : v ?? '';
      headers[k] = sv;
    }

    const init: RequestInit = {
      method: req.method,
      headers,
      redirect: 'follow',
    };

    if (req.method && !['GET', 'HEAD'].includes(req.method)) {
      init.body = req.body ? JSON.stringify(req.body) : (req as any).rawBody;
      // If body is urlencoded, pass through as-is; otherwise keep content-type
      if (!headers['content-type'] && req.headers['content-type']) {
        headers['content-type'] = String(req.headers['content-type']);
      }
    }

    const resp = await fetch(targetUrl, init as any);

    // Pipe status and headers through
    res.status(resp.status);
    resp.headers.forEach((val, key) => {
      if (key.toLowerCase() === 'content-encoding') return; // let Vercel handle
      res.setHeader(key, val);
    });

    const buf = Buffer.from(await resp.arrayBuffer());
    res.send(buf);
  } catch (e: any) {
    res.status(502).json({ error: 'Proxy error', detail: e?.message || String(e) });
  }
}
