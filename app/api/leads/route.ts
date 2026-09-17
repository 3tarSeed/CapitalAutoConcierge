import { getStaffUser } from "@/app/auth";
import { database } from "@/lib/database";
import { leadSchema, updateSchema } from "@/lib/lead-schema";
import { estimate } from "@/lib/catalog";
import { notifyNewLead } from "@/lib/notifications";

export const dynamic = "force-dynamic";
const reply = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { "Cache-Control": "no-store" } });

export async function GET() {
  const user = await getStaffUser();
  if (!user) return reply({ error: "Sign in to view your private review leads." }, 401);
  try {
    const db = await database();
    const { data, error } = await db
      .from("leads")
      .select("id,owner,created,data,status,notes,assignee,followup")
      .eq("owner", user.userId)
      .order("created", { ascending: false })
      .limit(500);
    if (error) throw error;
    return reply({ leads: data });
  } catch (e) {
    console.error("Lead read failed", e);
    return reply({ error: "Leads are temporarily unavailable. Please retry." }, 503);
  }
}

async function mutate(request: Request, update: boolean) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return reply({ error: "Invalid request origin." }, 403);
  const user = await getStaffUser();
  if (!user) return reply({ error: "This private review requires sign-in. Your information has not been submitted." }, 401);
  try {
    const body = await request.text();
    if (body.length > 24000) return reply({ error: "Request too large." }, 413);
    let raw: unknown;
    try { raw = JSON.parse(body); } catch { return reply({ error: "Invalid request." }, 400); }
    const db = await database();

    if (update) {
      const p = updateSchema.safeParse(raw);
      if (!p.success) return reply({ error: "Check the lead details." }, 400);
      const v = p.data;
      const { data, error } = await db
        .from("leads")
        .update({ status: v.status, notes: v.notes, assignee: v.assignee, followup: v.followup })
        .eq("id", v.id)
        .eq("owner", user.userId)
        .select("id");
      if (error) throw error;
      if (!data?.length) return reply({ error: "Lead not found." }, 404);
      return reply({ ok: true });
    }

    const p = leadSchema.safeParse(raw);
    if (!p.success) return reply({ error: p.error.issues[0]?.message || "Check your information." }, 400);
    const v = p.data;
    const data = { ...v, estimate: estimate(v.selected), pricingVersion: "dc-research-2026-09-16-v1", inspectionRequired: true };
    // Idempotent on requestId: ignoreDuplicates keeps the first submission and returns no row on conflict.
    const { data: saved, error } = await db
      .from("leads")
      .upsert(
        { id: v.requestId, owner: user.userId, created: Date.now(), data, status: "New", notes: "", assignee: "", followup: "" },
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

export async function POST(r: Request) { return mutate(r, false); }
export async function PATCH(r: Request) { return mutate(r, true); }
