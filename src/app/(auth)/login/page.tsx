"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Disclaimer } from "@/components/Disclaimer";
import { Button } from "@/components/ui/Button";
import { Shield } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Shield className="h-10 w-10 text-blue-700 mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-slate-900">Sign in to Pruevit</h1>
            <p className="text-sm text-slate-600 mt-1">Secure access for authorized professionals</p>
          </div>
          <form onSubmit={onSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 rounded-md border border-slate-300 px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 rounded-md border border-slate-300 px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-600">
            No account?{" "}
            <Link href="/register" className="text-blue-700 font-medium hover:underline">
              Register
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
