import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type StaffUser = {
  userId: string;
  email: string;
  displayName: string;
};

const SIGN_IN_PATH = "/login";

/** Signed-in user, or null. Enforces the STAFF_EMAILS allowlist. */
export async function getStaffUser(): Promise<StaffUser | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return null;
  if (!isAllowedStaff(user.email)) return null;
  return {
    userId: user.id,
    email: user.email,
    displayName: (user.user_metadata?.full_name as string | undefined) ?? user.email,
  };
}

export async function requireStaffUser(returnTo: string): Promise<StaffUser> {
  const user = await getStaffUser();
  if (user) return user;
  redirect(signInPath(returnTo));
}

export function signInPath(returnTo: string): string {
  return `${SIGN_IN_PATH}?return_to=${encodeURIComponent(safeRelativeReturnPath(returnTo))}`;
}

export function isAllowedStaff(email: string): boolean {
  const list = (process.env.STAFF_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}

export function safeRelativeReturnPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  try {
    const url = new URL(value, "https://app.local");
    if (url.origin !== "https://app.local" || url.pathname === SIGN_IN_PATH) return "/";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/";
  }
}
