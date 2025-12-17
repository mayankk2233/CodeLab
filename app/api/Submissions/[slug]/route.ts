import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Await params (Next.js 15+)
    const { slug } = await params;

    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "not_logged_in" }, { status: 401 });
    }

    const problem = await prisma.problem.findUnique({
      where: { slug },
    });

    if (!problem) {
      return NextResponse.json({ error: "problem_not_found" }, { status: 404 });
    }

    const submissions = await prisma.submission.findMany({
      where: {
        problemId: problem.id,
        userId,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ submissions });
  } catch (err: any) {
    console.error('[SUBMISSIONS_FETCH_ERROR]', {
      error: err.message,
      timestamp: new Date().toISOString()
    });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}