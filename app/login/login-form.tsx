"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm({ returnTo }: { returnTo: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true); setError("");
    const { error } = await createClient().auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) { setError(error.message.includes("Invalid login") ? "Sign-in failed. Check your email and password." : `Sign-in failed: ${error.message}`); return; }
    const safe = returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/leads";
    router.replace(safe);
    router.refresh();
  }

  return (
    <div className="fields" style={{ maxWidth: 420 }}>
      <label className="field"><span>Email</span>
        <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label className="field"><span>Password</span>
        <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }} />
      </label>
      {error && <div role="alert" className="error">{error}</div>}
      <button className="primary" onClick={submit} disabled={busy || !email || !password}>{busy ? "Signing in…" : "Sign in"}</button>
      <p className="fine">Access is limited to allowlisted staff. Customer intake is not available through this page.</p>
    </div>
  );
}
