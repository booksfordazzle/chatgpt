import { handler as sharedWaitlistHandler } from '../netlify/functions/waitlist.mjs';

// Vercel Node adapter: reuse the same validated Google Sheets handler as local/Netlify.
export function createVercelHandler(waitlistHandler = sharedWaitlistHandler) {
  return async function waitlist(req, res) {
    const headers = Object.fromEntries(Object.entries(req.headers || {}).map(([key, value]) => [key.toLowerCase(), Array.isArray(value) ? value.join(',') : value]));
    let body = '';
    try {
      const length = headers['content-length'];
      if (length && (!/^\d+$/.test(length) || Number(length) > 16384)) {
        res.statusCode = 413;
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.end('{"ok":false,"error":"invalid_request"}');
        return;
      }
      if (req.body !== undefined) {
        if (Buffer.isBuffer(req.body)) body = req.body.toString('utf8');
        else if (typeof req.body === 'string') body = req.body;
        else {
          // Vercel may pre-parse JSON and URL-encoded forms into objects.
          body = JSON.stringify(req.body);
          headers['content-type'] = 'application/json';
        }
      } else {
        const chunks = []; let bytes = 0;
        for await (const chunk of req) {
          const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
          bytes += buffer.length;
          if (bytes > 16384) { body = null; break; }
          chunks.push(buffer);
        }
        if (body !== null) body = Buffer.concat(chunks).toString('utf8');
      }
      if (body === null || Buffer.byteLength(body) > 16384) {
        res.statusCode = 413;
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end('{"ok":false,"error":"invalid_request"}');
        return;
      }
      const result = await waitlistHandler({ httpMethod: req.method, headers, body });
      res.statusCode = result.statusCode;
      for (const [name, value] of Object.entries(result.headers || {})) res.setHeader(name, value);
      res.end(result.body);
    } catch {
      res.statusCode = 500;
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end('{"ok":false,"error":"server_error"}');
    }
  };
}
export default createVercelHandler();
