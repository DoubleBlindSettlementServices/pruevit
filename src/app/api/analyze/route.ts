import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeCaseWithGrok } from "@/lib/grok";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { caseId } = await req.json();
  if (!caseId) {
    return NextResponse.json({ error: "caseId required" }, { status: 400 });
  }

  const c = await prisma.case.findFirst({
    where: {
      id: caseId,
      deletedAt: null,
      OR: [
        { ownerId: (session.user as any).id },
        ...( (session.user as any).role === "ADMIN" ? [{}] : [] ),
      ],
    },
    include: { files: { where: { deletedAt: null } } },
  });

  if (!c) {
    return NextResponse.json({ error: "Case not found or access denied" }, { status: 404 });
  }

  // Mark analyzing
  await prisma.case.update({
    where: { id: caseId },
    data: { status: "ANALYZING" },
  });

  try {
    const result = await analyzeCaseWithGrok({
      claimType: c.claimType || undefined,
      jurisdiction: c.jurisdiction || undefined,
      injurySeverity: c.injurySeverity || undefined,
      description: c.description || undefined,
      fileCategories: c.files.map((f) => f.category),
    });

    const updated = await prisma.case.update({
      where: { id: caseId },
      data: {
        status: "COMPLETED",
        analysisResult: JSON.stringify(result),
        valueLow: result.valueLow,
        valueHigh: result.valueHigh,
        valueCurrency: result.currency,
        confidenceNote: result.confidence,
      },
    });

    return NextResponse.json({ case: updated, analysis: result });
  } catch (err: any) {
    await prisma.case.update({
      where: { id: caseId },
      data: { status: "UPLOADED" },
    });
    return NextResponse.json(
      { error: "Analysis failed", detail: err.message },
      { status: 500 }
    );
  }
}
