import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [userCount, caseCount, fileCount, expiringSoon] = await Promise.all([
    prisma.user.count(),
    prisma.case.count({ where: { deletedAt: null } }),
    prisma.caseFile.count({ where: { deletedAt: null } }),
    prisma.case.count({
      where: {
        deletedAt: null,
        expiresAt: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  const recentCases = await prisma.case.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: { owner: { select: { email: true, name: true } } },
  });

  return NextResponse.json({
    stats: { userCount, caseCount, fileCount, expiringSoon },
    recentCases,
  });
}
