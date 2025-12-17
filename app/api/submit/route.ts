import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { prisma } from "@/lib/prisma";
import { addXp, rewardForDifficulty } from "@/lib/levels";
import { auth } from "@/lib/auth";

// Judge0 CE language IDs
const LANG_MAP: Record<string, number> = {
  python: 71,
  cpp: 54,
  java: 62,
  c: 50,
};

// Run code on Judge0 CE
async function runJudge(language: string, code: string, input: string) {
  const langId = LANG_MAP[language];

  const res = await axios.post(
    `${process.env.JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`,
    {
      language_id: langId,
      source_code: code,
      stdin: input,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const { stdout, stderr, compile_output, status } = res.data;

  return {
    output: (stdout || compile_output || stderr || "").toString().trim(),
    passed: status?.id === 3,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { language, code, slug } = await req.json();

    if (!language || !code || !slug) {
      return NextResponse.json(
        { error: "language, code, and slug required" },
        { status: 400 }
      );
    }

    const problem = await prisma.problem.findUnique({
      where: { slug },
    });

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    // Load testcases
    const tests = await prisma.testCase.findMany({
      where: { problemId: problem.id },
    });

    if (tests.length === 0) {
      return NextResponse.json(
        { error: "No testcases found for this problem" },
        { status: 500 }
      );
    }

    // Logged in user? Nullable allowed
    let userId: string | null = null;

    try {
      const session = await auth();
      userId = session?.user?.id || null;
    } catch (error) {
      // User not logged in - continue without user ID
      console.log('[SUBMIT] No authenticated user');
    }

    // ---- Run all testcases ----
    let passed = 0;

    for (const t of tests) {
      let input = t.input || "";

      // Prevent Java Scanner crash
      if (!input.trim()) input = "0";

      const result = await runJudge(language, code, input);

      // Normalize output comparison (handle whitespace differences)
      const normalizeOutput = (str: string) =>
        str.trim().replace(/\s+/g, ' ');

      if (normalizeOutput(result.output) === normalizeOutput(t.expected)) {
        passed++;
      }
    }

    const allPassed = passed === tests.length;

    // Award XP only if user logged in AND first AC
    if (allPassed && userId) {
      const prev = await prisma.submission.findFirst({
        where: { userId, problemId: problem.id, status: "PASSED" },
      });

      if (!prev) {
        const gain = rewardForDifficulty(problem.difficulty);
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (user) {
          const updated = addXp(user.xp, user.level, gain);
          await prisma.user.update({
            where: { id: userId },
            data: { xp: updated.xp, level: updated.level },
          });
        }
      }
    }

    // Save submission
    await prisma.submission.create({
      data: {
        userId,
        problemId: problem.id,
        language,
        code,
        status: allPassed ? "PASSED" : "FAILED",
        stdout: `${passed}/${tests.length} passed`,
        stderr: null,
      },
    });

    return NextResponse.json({
      result: `${passed}/${tests.length} testcases passed`,
      passed: allPassed,
    });
  } catch (err: any) {
    // Detailed error logging
    console.error('[SUBMIT_ERROR]', {
      error: err?.response?.data || err.message,
      timestamp: new Date().toISOString()
    });

    // User-friendly error message
    const errorMessage = err?.response?.data?.error ||
      err.message ||
      "Submission failed. Please try again.";

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}