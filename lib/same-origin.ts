/**
 * CSRF guard: accept a request only if its Origin header (when present) points at a host this
 * site is served on. Compares hostnames, not full origins, so http/https and Netlify's internal
 * request URLs don't cause false rejections.
 */
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // same-origin navigations and non-browser clients send no Origin
  let host: string;
  try { host = new URL(origin).hostname.toLowerCase(); } catch { return false; }

  const allowed = new Set<string>();
  const add = (v: string | null | undefined) => {
    if (!v) return;
    try { allowed.add(new URL(v.includes("://") ? v : `https://${v}`).hostname.toLowerCase()); } catch {}
  };
  add(request.url);
  add(request.headers.get("x-forwarded-host")?.split(",")[0]?.trim());
  add(request.headers.get("host"));
  add(process.env.URL);                 // Netlify: primary site URL
  add(process.env.DEPLOY_PRIME_URL);    // Netlify: deploy-context URL
  add(process.env.NEXT_PUBLIC_SITE_URL);
  allowed.add("capitalautoconcierge.com");
  allowed.add("www.capitalautoconcierge.com");
  allowed.add("capitalautoconcierge.netlify.app");
  return allowed.has(host);
}
