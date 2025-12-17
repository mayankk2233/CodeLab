"use client";

import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import { useRouter } from "next/navigation";

// ---------- CLEAN DEFAULT CODE TEMPLATES ----------
const DEFAULT_CODE: Record<string, string> = {
  python: `# Write your code here
# n = int(input())
# print(n)
`,

  cpp: `#include <bits/stdc++.h>
using namespace std;
int main() {
    // Write your code here
    return 0;
}
`,

  java: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Write your code here
    }
}
`,

  c: `#include <stdio.h>
int main() {
    // Write your code here
    return 0;
}
`
};

export default function SolveClient({ problem }: { problem: any }) {
  const router = useRouter();

  // ---------- Editor States ----------
  const [lang, setLang] = useState("python");
  const [code, setCode] = useState(DEFAULT_CODE["python"]);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [submitResult, setSubmitResult] = useState("");
  const [activeTab, setActiveTab] = useState("description");

  // ---------- Submissions State ----------
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [subLoading, setSubLoading] = useState(true);
  const [notLogged, setNotLogged] = useState(false);

  // ---------- Reset code when language changes ----------
  useEffect(() => {
    setCode(DEFAULT_CODE[lang]);
  }, [lang]);

  // ---------- Fetch submissions ----------
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/submissions/${problem.slug}`);
        if (res.status === 401) {
          setNotLogged(true);
        } else {
          const data = await res.json();
          setSubmissions(data.submissions || []);
        }
      } catch (err) {
        console.log("Error loading submissions", err);
      }
      setSubLoading(false);
    }
    load();
  }, [problem.slug]);

  // ---------- RUN CODE ----------
  async function runCode() {
    setOutput("Running...");
    try {
      const res = await axios.post("/api/execute", {
        language: lang,
        code,
        stdin: input,
        slug: problem.slug,
      });
      setOutput(res.data.output || "No output");
    } catch (err: any) {
      setOutput(err?.response?.data?.error || "Execution error");
    }
  }

  // ---------- SUBMIT CODE ----------
  async function submitCode() {
    setSubmitResult("Submitting...");
    try {
      const res = await axios.post("/api/submit", {
        language: lang,
        code,
        slug: problem.slug,
      });
      setSubmitResult(res.data.result || "Submitted");
    } catch (err: any) {
      setSubmitResult(err?.response?.data?.error || "Submit failed");
    }
  }

  return (
    <div className="grid gap-4">

      {/* ---------- HEADER ---------- */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          {problem.title}
        </h1>

        <button
          onClick={() => router.push("/problems")}
          className="px-3 py-1 border rounded 
          border-neutral-300 dark:border-neutral-700 
          text-neutral-700 dark:text-neutral-300
          hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          Back
        </button>
      </div>

      {/* ---------- TABS ---------- */}
      <div className="flex gap-3 border-b pb-2 text-sm 
        border-neutral-300 dark:border-neutral-700">
        {["description", "code", "submissions", "testcases"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 rounded transition 
              ${activeTab === tab
                ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
          >
            {tab[0].toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* ========== DESCRIPTION TAB ========== */}
      {activeTab === "description" && (
        <div className="card p-4 
        bg-white dark:bg-neutral-900 
        text-neutral-800 dark:text-neutral-300 
        border border-neutral-300 dark:border-neutral-700">

          <h2 className="font-semibold mb-2 text-lg">
            Description
          </h2>

          <p className="whitespace-pre-line mb-4">
            {problem.description}
          </p>

          {/* ---------- Examples ---------- */}
          <h3 className="font-semibold mt-3 mb-2">Examples</h3>
          <div className="grid gap-3">
            {problem.examples.map((ex: any, i: number) => (
              <div key={i}
                className="border rounded p-3 shadow-sm
                bg-neutral-50 dark:bg-neutral-800 
                border-neutral-300 dark:border-neutral-700"
              >
                <p className="font-medium">Input:</p>
                <pre className="p-2 rounded border whitespace-pre-wrap 
                  bg-white dark:bg-neutral-900 
                  border-neutral-300 dark:border-neutral-700">
                  {ex.input}
                </pre>

                <p className="font-medium mt-2">Output:</p>
                <pre className="p-2 rounded border whitespace-pre-wrap 
                  bg-white dark:bg-neutral-900 
                  border-neutral-300 dark:border-neutral-700">
                  {ex.output}
                </pre>
              </div>
            ))}
          </div>

          {/* ---------- Tags ---------- */}
          <h3 className="font-semibold mt-4">Tags</h3>
          <div className="flex gap-2 flex-wrap mt-1">
            {problem.tags.map((t: string) => (
              <span
                key={t}
                className="px-3 py-1 rounded-full text-xs
                bg-neutral-200 dark:bg-neutral-700 
                text-neutral-700 dark:text-neutral-200"
              >
                {t}
              </span>
            ))}
          </div>

          {/* ---------- Difficulty ---------- */}
          <h3 className="font-semibold mt-4">Difficulty</h3>
          <span className="px-3 py-1 rounded-full text-xs
            bg-neutral-900 text-white 
            dark:bg-neutral-100 dark:text-neutral-900">
            {problem.difficulty}
          </span>
        </div>
      )}

      {/* ========== CODE TAB ========== */}
      {activeTab === "code" && (
        <div className="grid lg:grid-cols-2 gap-4">

          {/* ---------- EDITOR ---------- */}
          <div className="border rounded p-2 shadow-sm 
            bg-white dark:bg-neutral-900 
            border-neutral-300 dark:border-neutral-700"
          >
            <div className="flex justify-between items-center mb-2">
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="border px-2 py-1 rounded 
                bg-white dark:bg-neutral-800
                text-neutral-800 dark:text-neutral-200
                border-neutral-300 dark:border-neutral-700"
              >
                <option value="python">Python</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
                <option value="c">C</option>
              </select>

              <div className="flex gap-2">
                <button
                  onClick={() => setCode(DEFAULT_CODE[lang])}
                  className="px-3 py-1 border rounded
                  border-neutral-300 dark:border-neutral-700
                  text-neutral-700 dark:text-neutral-300
                  hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Reset
                </button>
                <button
                  onClick={runCode}
                  className="px-3 py-1 border rounded 
                  border-neutral-300 dark:border-neutral-700
                  text-neutral-700 dark:text-neutral-300
                  hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Run
                </button>
                <button
                  onClick={submitCode}
                  className="px-3 py-1 border rounded 
                  bg-neutral-900 text-white
                  dark:bg-neutral-100 dark:text-neutral-900"
                >
                  Submit
                </button>
              </div>
            </div>

            <Editor
              height="430px"
              language={lang}
              value={code}
              theme="vs-dark"
              onChange={(v) => setCode(v || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
              }}
            />
          </div>

          {/* ---------- I/O PANEL ---------- */}
          <div className="grid gap-3">

            {/* Input */}
            <div className="card p-3 
              bg-white dark:bg-neutral-900 
              border border-neutral-300 dark:border-neutral-700"
            >
              <p className="font-semibold mb-1">Custom Input</p>
              <textarea
                rows={7}
                className="w-full border rounded p-2 
                bg-white dark:bg-neutral-800 
                text-neutral-800 dark:text-neutral-200
                border-neutral-300 dark:border-neutral-700"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>

            {/* Output */}
            <div className="card p-3 
              bg-white dark:bg-neutral-900 
              border border-neutral-300 dark:border-neutral-700"
            >
              <p className="font-semibold mb-1">Run Output</p>
              <pre className="whitespace-pre-wrap 
                bg-white dark:bg-neutral-900 
                text-neutral-800 dark:text-neutral-200">
                {output}
              </pre>
            </div>

            {/* Submit Result */}
            <div className="card p-3 
              bg-white dark:bg-neutral-900 
              border border-neutral-300 dark:border-neutral-700"
            >
              <p className="font-semibold mb-1">Submit Result</p>
              <p className="text-neutral-800 dark:text-neutral-200">
                {submitResult}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========== SUBMISSIONS TAB ========== */}
      {activeTab === "submissions" && (
        <div className="card p-4 
          bg-white dark:bg-neutral-900 
          border border-neutral-300 dark:border-neutral-700"
        >
          <h2 className="text-lg font-semibold mb-3">Your Submissions</h2>

          {subLoading && (
            <p className="text-neutral-500 dark:text-neutral-400">
              Loading...
            </p>
          )}

          {notLogged && !subLoading && (
            <p className="text-neutral-500 dark:text-neutral-400">
              Login to view submissions.
            </p>
          )}

          {!subLoading && !notLogged && submissions.length === 0 && (
            <p className="text-neutral-500 dark:text-neutral-400">
              No submissions yet.
            </p>
          )}

          {!subLoading && !notLogged && submissions.length > 0 && (
            <div className="grid gap-3">
              {submissions.map((s: any) => (
                <div
                  key={s.id}
                  className="border rounded p-3 shadow-sm
                  bg-neutral-50 dark:bg-neutral-800 
                  border-neutral-300 dark:border-neutral-700"
                >
                  <div className="flex justify-between">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium
                        ${
                          s.status === "PASSED"
                            ? "bg-green-200 text-green-700 dark:bg-green-800 dark:text-green-300"
                            : "bg-red-200 text-red-700 dark:bg-red-800 dark:text-red-300"
                        }`}
                    >
                      {s.status}
                    </span>

                    <span className="text-neutral-500 dark:text-neutral-400 text-xs">
                      {new Date(s.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="mt-2 text-neutral-700 dark:text-neutral-300 text-sm">
                    <b>Language:</b> {s.language}
                  </p>

                  <p className="mt-1 text-neutral-800 dark:text-neutral-200 text-sm">
                    <b>Result:</b> {s.stdout}
                  </p>

                  <details className="mt-2 cursor-pointer">
                    <summary className="text-sm text-blue-600 dark:text-blue-400">
                      View Code
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap p-2 border rounded bg-white dark:bg-neutral-900 dark:border-neutral-700 text-sm">
                      {s.code}
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========== TESTCASES TAB ========== */}
      {activeTab === "testcases" && (
        <div className="card p-4 
          bg-white dark:bg-neutral-900 
          border border-neutral-300 dark:border-neutral-700"
        >
          <p className="text-neutral-600 dark:text-neutral-400">
            Hidden testcases coming soon…
          </p>
        </div>
      )}
    </div>
  );
}