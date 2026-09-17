import { adminClient } from "@/lib/supabase/admin";
import { contactSchema } from "@/lib/contact-schema";

export const dynamic = "force-dynamic";
const reply = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
const clean = (v: string) => v.replace(/[<>]/g, "");

async function emailStaff(m: { name: string; phone: string; email: string; message: string; id: string }) {
  const { NOTIFY_EMAIL_TO: to, RESEND_API_KEY: key, RESEND_FROM: from } = process.env;
  if (!to || !key || !from) return;
  const html = `<h2>New contact message</h2><p><strong>${clean(m.name)}</strong><br>${clean(m.phone) || "No phone given"}<br>${clean(m.email)}</p><p style="white-space:pre-wrap">${clean(m.message)}</p><p>Reference ${m.id.slice(0, 8).toUpperCase()}</p>`;
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], reply_to: m.email, subject: `Contact: ${m.name}`, html }),
  });
  if (!r.ok) console.error("Contact email failed", r.status);
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return reply({ error: "Invalid request origin." }, 403);
  try {
    const body = await request.text();
    if (body.length > 8000) return reply({ error: "Message too long." }, 413);
    let raw: Record<string, unknown>;
    try { raw = JSON.parse(body); } catch { return reply({ error: "Invalid request." }, 400); }
    if (typeof raw.website === "string" && raw.website.trim()) return reply({ ok: true }, 201); // honeypot
    const p = contactSchema.safeParse(raw);
    if (!p.success) return reply({ error: p.error.issues[0]?.message || "Check your information." }, 400);
    const id = crypto.randomUUID();
    const { error } = await adminClient()
      .from("contact_messages")
      .insert({ id, created: Date.now(), ...p.data, status: "New" });
    if (error) throw error;
    await emailStaff({ id, ...p.data });
    return reply({ ok: true, id }, 201);
  } catch (e) {
    console.error("Contact save failed", e);
    return reply({ error: "Unable to send right now. Please try again." }, 503);
  }
}
