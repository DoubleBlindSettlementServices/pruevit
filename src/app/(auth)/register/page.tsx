"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Navbar } from "@/components/Navbar";
import { Disclaimer } from "@/components/Disclaimer";
import { Button } from "@/components/ui/Button";
import { Shield } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "ATTORNEY",
    organization: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error?.formErrors?.[0] || data.error || "Registration failed");
      setLoading(false);
      return;
    }
    // Auto sign-in
    await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Shield className="h-10 w-10 text-blue-700 mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
            <p className="text-sm text-slate-600 mt-1">For insurance professionals and attorneys</p>
          </div>
          <form onSubmit={onSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">{String(error)}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full h-10 rounded-md border border-slate-300 px-3 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Work email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full h-10 rounded-md border border-slate-300 px-3 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password (min 10 chars)</label>
              <input
                type="password"
                required
                minLength={10}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full h-10 rounded-md border border-slate-300 px-3 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full h-10 rounded-md border border-slate-300 px-3 text-sm"
              >
                <option value="ATTORNEY">Plaintiff / Defense Attorney</option>
                <option value="INSURANCE">Insurance Professional</option>
                <option value="CLAIMANT">Claimant / Self-represented</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Organization (optional)</label>
              <input
                value={form.organization}
                onChange={(e) => setForm({ ...form, organization: e.target.value })}
                className="w-full h-10 rounded-md border border-slate-300 px-3 text-sm"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating…" : "Create account"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-700 font-medium hover:underline">
              Sign in
            </Link>
          </p>
          <div className="mt-6">
            <Disclaimer compact />
          </div>
        </div>
      </main>
    </>
  );
}
