import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client for server-side writes that bypass Row Level Security.
 * Used only to insert public lead submissions. Never import from a Client Component.
 */
export function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Database unavailable");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
