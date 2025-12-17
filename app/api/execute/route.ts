import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { prisma } from "@/lib/prisma";

// Judge0 CE (FREE) language IDs
const LANG_MAP: Record<string, number> = {
  python: 71, // Python 3.x
  cpp: 54,    // C++ GCC
  java: 62,   // Java
  c: 50       // C
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { language, code, stdin, slug } = body || {};

    if (!language || !code) {
      return NextResponse.json(
        { error: "language and code required" },
        { status: 400 }
      );
    }

    const langId = LANG_MAP[language];

    if (!langId) {
      return NextResponse.json(
        { error: "Unsupported language" },
        { status: 400 }
      );
    }

    // ----------- SAFE INPUT FIX (prevents Java Scanner crash) -----------
    let safeInput = stdin || "";
    if (!safeInput.trim()) safeInput = "0";

    // ------------ REAL Judge0 CE EXECUTION -------------
    const res = await axios.post(
      `${process.env.JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`,
      {
        language_id: langId,
        source_code: code,
        stdin: safeInput,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const { stdout, stderr, compile_output, status } = res.data || {};
    const output = (stdout || compile_output || stderr || "").toString();

    // ------------ SAVE RUN (Optional but good UX) -------------
    const problem = await prisma.problem.findUnique({ where: { slug } });

    await prisma.submission.create({
      data: {
        userId: null, // auth later
        problemId: problem?.id || "",
        language,
        code,
        status:
          status?.id === 3
            ? "PASSED"
            : status?.id === 6
            ? "COMPILE_ERROR"
            : "FAILED",
        stdout: stdout || compile_output || null,
        stderr: stderr || null,
      },
    });

    return NextResponse.json({ output });
  } catch (err: any) {
    console.log("EXECUTE ERROR:", err?.response?.data || err);
    return NextResponse.json(
      { error: "Execute failed" },
      { status: 500 }
    );
  }
}