import { getStaffUser } from "@/app/auth";
import { database } from "@/lib/database";
import { adminClient } from "@/lib/supabase/admin";
import { verifyTurnstile } from "@/lib/turnstile";
import { sameOrigin } from "@/lib/same-origin";
import { leadSchema, updateSchema } from "@/lib/lead-schema";
import { estimate } from "@/lib/catalog";
import { notifyNewLead } from "@/lib/notifications";

export const dynamic = "force-dynamic";
const reply = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { "Cache-Control": "no-store" } });

/** Staff: list every lead on the desk. */
export async function GET() {
  try {
    const user = await getStaffUser();
    if (!user) return reply({ error: "Sign in to view the concierge desk." }, 401);
    const db = await database();
    const { data, error } = await db
      .from("leads")
      .select("id,owner,created,data,status,notes,assignee,followup")
      .order("created", { ascending: false })
      .limit(500);
    if (error) throw error;
    return reply({ leads: data });
  } catch (e) {
    console.error("Lead read failed", e);
    return reply({ error: "Leads are temporarily unavailable. Please retry." }, 503);
  }
}

/** Public: customer submits an estimate request. No sign-in required. */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return reply({ error: "Invalid request origin." }, 403);
  try {
    const body = await request.text();
    if (body.length > 24000) return reply({ error: "Request too large." }, 413);
    let raw: Record<string, unknown>;
    try { raw = JSON.parse(body); } catch { return reply({ error: "Invalid request." }, 400); }

    // Honeypot: real users never fill this hidden field. Pretend success so bots stop retrying.
    if (typeof raw.website === "string" && raw.website.trim()) return reply({ id: raw.requestId ?? "" }, 201);

    const ip = request.headers.get("x-nf-client-connection-ip") ?? request.headers.get("x-forwarded-for");
    if (!(await verifyTurnstile(raw.turnstileToken, ip))) {
      return reply({ error: "Verification failed. Please try again." }, 400);
    }

    const p = leadSchema.safeParse(raw);
    if (!p.success) return reply({ error: p.error.issues[0]?.message || "Check your information." }, 400);
    const v = p.data;
    const data = { ...v, estimate: estimate(v.selected), pricingVersion: "dc-research-2026-09-16-v1", inspectionRequired: true };

    const { data: saved, error } = await adminClient()
      .from("leads")
      .upsert(
        { id: v.requestId, owner: null, created: Date.now(), data, status: "New", notes: "", assignee: "", followup: "" },
        { onConflict: "id", ignoreDuplicates: true },
      )
      .select("id");
    if (error) throw error;
    if (saved?.length) await notifyNewLead(data);
    return reply({ id: v.requestId }, 201);
  } catch (e) {
    console.error("Lead save failed", e);
    return reply({ error: "Unable to save right now. Your form is still here; please try again." }, 503);
  }
}

/** Staff: update stage, notes, assignee, follow-up. */
export async function PATCH(request: Request) {
  if (!sameOrigin(request)) return reply({ error: "Invalid request origin." }, 403);
  try {
    const user = await getStaffUser();
    if (!user) return reply({ error: "Sign in to update leads." }, 401);
    const raw = await request.json();
    const p = updateSchema.safeParse(raw);
    if (!p.success) return reply({ error: "Check the lead details." }, 400);
    const v = p.data;
    const db = await database();
    const { data, error } = await db
      .from("leads")
      .update({ status: v.status, notes: v.notes, assignee: v.assignee, followup: v.followup })
      .eq("id", v.id)
      .select("id");
    if (error) throw error;
    if (!data?.length) return reply({ error: "Lead not found." }, 404);
    return reply({ ok: true });
  } catch (e) {
    console.error("Lead update failed", e);
    return reply({ error: "Unable to save right now. Please try again." }, 503);
  }
}
