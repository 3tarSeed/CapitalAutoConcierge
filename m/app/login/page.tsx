import { Header } from "../estimator";
import LoginForm from "./login-form";
export const dynamic = "force-dynamic";
export default async function Login({ searchParams }: { searchParams: Promise<{ return_to?: string }> }) {
  const { return_to } = await searchParams;
  return (
    <>
      <Header />
      <main className="shell">
        <p className="eyebrow">PRIVATE REVIEW · STAFF SIGN-IN</p>
        <h1>Concierge desk.</h1>
        <p className="muted">Sign in with your staff account to review requests.</p>
        <LoginForm returnTo={return_to ?? "/leads"} />
      </main>
    </>
  );
}
