import { createHmac, randomBytes } from 'node:crypto';
import { isIP } from 'node:net';

// Best-effort protection per warm instance; edge/distributed limits are still needed
// against large or distributed attacks. Keys are salted hashes, never raw IP/email.
export function createSubmissionLimiter({ now = Date.now, windowMs = 600000, emailLimit = 5, ipLimit = 20, capacity = 5000 } = {}) {
  const salt = randomBytes(32);
  const buckets = new Map();
  const hash = value => createHmac('sha256', salt).update(value).digest('hex');
  return (email, headers = {}) => {
    const time = now();
    for (const [key, bucket] of buckets) if (bucket.until <= time) buckets.delete(key);
    const rawIp = headers['x-vercel-forwarded-for'] || headers['x-nf-client-connection-ip'];
    const ip = typeof rawIp === 'string' ? rawIp.split(',')[0].trim() : '';
    const keys = [{ key: hash(`email:${email.toLowerCase()}`), limit: emailLimit }];
    if (isIP(ip)) keys.push({ key: hash(`ip:${ip}`), limit: ipLimit });
    let retryAfter = 0;
    for (const { key, limit } of keys) {
      const bucket = buckets.get(key);
      if (bucket && bucket.count >= limit) retryAfter = Math.max(retryAfter, Math.ceil((bucket.until - time) / 1000));
    }
    // Do not evict active entries under attacker-controlled key churn.
    if (buckets.size + keys.filter(({ key }) => !buckets.has(key)).length > capacity) retryAfter = Math.max(1, retryAfter);
    if (retryAfter) return { allowed: false, retryAfter };
    for (const { key } of keys) {
      const bucket = buckets.get(key) || { count: 0, until: time + windowMs };
      bucket.count++; buckets.set(key, bucket);
    }
    return { allowed: true };
  };
}

export function rejectsBrowserOrigin(headers = {}) {
  if (headers['sec-fetch-site'] === 'cross-site') return true;
  if (!headers.origin) return false; // Native/server clients still face validation and throttling.
  if (!headers.host) return true;
  try {
    const origin = new URL(headers.origin);
    return !['http:', 'https:'].includes(origin.protocol) || origin.host !== headers.host
      || Boolean(origin.username || origin.password) || origin.pathname !== '/' || Boolean(origin.search || origin.hash);
  } catch { return true; }
}
