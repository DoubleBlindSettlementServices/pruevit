import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { Disclaimer } from "@/components/Disclaimer";
import { formatDate } from "@/lib/utils";

async function getAdminData() {
  const res = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/admin`, {
    cache: "no-store",
    headers: { cookie: "" }, // server component will need session via direct prisma ideally
  });
  // Fallback: use prisma directly for reliability in RSC
  return null;
}

import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [userCount, caseCount, fileCount, expiringSoon, recentCases] = await Promise.all([
    prisma.user.count(),
    prisma.case.count({ where: { deletedAt: null } }),
    prisma.caseFile.count({ where: { deletedAt: null } }),
    prisma.case.count({
      where: {
        deletedAt: null,
        expiresAt: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.case.findMany({
      take: 15,
      orderBy: { createdAt: "desc" },
      include: { owner: { select: { email: true, name: true } } },
    }),
  ]);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Admin panel</h1>

        <div className="grid sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Users", value: userCount },
            { label: "Active cases", value: caseCount },
            { label: "Files stored", value: fileCount },
            { label: "Expiring in 30d", value: expiringSoon },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-500">{s.label}</p>
              <p className="text-2xl font-semibold text-slate-900 mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        <h2 className="text-lg font-semibold text-slate-900 mb-3">Recent cases</h2>
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentCases.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-medium">{c.title}</td>
                  <td className="px-4 py-3 text-slate-600">{c.owner?.email}</td>
                  <td className="px-4 py-3">{c.status}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8">
          <Disclaimer />
        </div>
      </main>
    </>
  );
}
