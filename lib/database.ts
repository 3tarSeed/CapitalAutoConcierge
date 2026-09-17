import { createClient } from "@/lib/supabase/server";

/** Request-scoped Supabase client. Row Level Security scopes leads to the signed-in owner. */
export async function database() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Database unavailable");
  }
  return createClient();
}
