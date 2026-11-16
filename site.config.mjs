// Single origin source for generated canonical/social/structured URLs and discovery files.
const configured = new URL(process.env.SITE_URL || 'https://primalcore.gr');
if (configured.protocol !== 'https:' || configured.pathname !== '/' || configured.search || configured.hash || configured.username || configured.password) throw new Error('SITE_URL must be an HTTPS origin');
export const SITE_URL = configured.origin;
export const SITE_NAME = 'PRIMAL CORE';
export const SOCIAL_IMAGE = { path: '/assets/audit-product-gallery-1-1.webp', width: 1920, height: 819, alt: 'Κλειστό δοχείο PRIMAL CORE σε σκούρα επιφάνεια με πλευρικό φωτισμό' };
export function canonicalPath(relative) {
 const route = '/' + relative.replace(/index\.html$/, '').replace(/\.html$/, '').replace(/\/$/, '');
 return route || '/';
}
