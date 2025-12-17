/* eslint-disable */
import { PrismaClient, Difficulty, Role } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * Problem generators:
 * We keep IO simple & consistent so users can actually solve & your judge can grade.
 * – REVERSE_STRING: input string -> reversed string
 * – UPPERCASE: input string -> uppercased
 * – COUNT_VOWELS: input string -> integer count
 * – SUM_TWO_NUMS: "a b" -> a+b
 * – SUM_ARRAY: "n\nx1 x2 ... xn" -> sum
 * – MAX_ARRAY: same input -> max
 * – SORT_ARRAY: same input -> sorted ascending string "..."
 * – FACTORIAL: integer n (0<=n<=12) -> n!
 * – FIBONACCI_N: integer n (0<=n<=30) -> nth fib (0-indexed: F0=0,F1=1)
 * – PALINDROME: string -> "true"/"false" (strict)
 */

type Gen = "REVERSE_STRING"|"UPPERCASE"|"COUNT_VOWELS"|"SUM_TWO_NUMS"|
  "SUM_ARRAY"|"MAX_ARRAY"|"SORT_ARRAY"|"FACTORIAL"|"FIBONACCI_N"|"PALINDROME";

const gensByTopic: Record<string, Gen[]> = {
  "array": ["SUM_ARRAY","MAX_ARRAY","SORT_ARRAY"],
  "string": ["REVERSE_STRING","UPPERCASE","COUNT_VOWELS","PALINDROME"],
  "hashmap": ["COUNT_VOWELS","UPPERCASE"],
  "two-pointers": ["PALINDROME","REVERSE_STRING"],
  "stack": ["REVERSE_STRING","PALINDROME"],
  "queue": ["SUM_ARRAY"],
  "heap": ["MAX_ARRAY","SORT_ARRAY"],
  "linked-list": ["REVERSE_STRING"],
  "tree": ["SUM_ARRAY"],
  "graph": ["COUNT_VOWELS"],
  "dp": ["FIBONACCI_N","FACTORIAL"],
  "math": ["SUM_TWO_NUMS","FACTORIAL"],
  "greedy": ["SORT_ARRAY","MAX_ARRAY"],
  "sliding-window": ["COUNT_VOWELS"],
  "binary-search": ["SORT_ARRAY","MAX_ARRAY"],
  "sorting": ["SORT_ARRAY"]
};

// Difficulty distribution (A): 70 / 110 / 40
const TARGET = { EASY: 70, MEDIUM: 110, HARD: 40 };

// Topics pool (rotates to distribute tags)
const topics = Object.keys(gensByTopic);

// Utility helpers to compute expected
function countVowels(s: string) {
  const m = s.toLowerCase().match(/[aeiou]/g);
  return m ? m.length : 0;
}
function factorial(n: number) {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r.toString();
}
function fib(n: number) {
  let a = 0, b = 1;
  if (n === 0) return "0";
  for (let i = 2; i <= n; i++) {
    const t = a + b; a = b; b = t;
  }
  return b.toString();
}
function isPalindrome(s: string) {
  return (s === s.split("").reverse().join("")) ? "true" : "false";
}
function pick<T>(arr: T[], i: number) {
  return arr[i % arr.length];
}

function genIO(gen: Gen, seed: number) {
  // Make deterministic pseudo-data from seed
  const words = ["hello","world","mayank","code","practice","improve","become","better","level","xp","streak","array","string","graph","tree"];
  const a = (17 * seed + 11) % 50;
  const b = (13 * seed + 7) % 50;
  const n = 5 + (seed % 6); // 5..10 length for arrays

  switch (gen) {
    case "REVERSE_STRING": {
      const s = pick(words, seed % words.length);
      return { input: s, expected: s.split("").reverse().join("") };
    }
    case "UPPERCASE": {
      const s = pick(words, (seed+1) % words.length);
      return { input: s, expected: s.toUpperCase() };
    }
    case "COUNT_VOWELS": {
      const s = pick(words, (seed+2) % words.length) + (seed%2 ? "ae" : "bc");
      return { input: s, expected: String(countVowels(s)) };
    }
    case "SUM_TWO_NUMS": {
      const x = a, y = b;
      return { input: `${x} ${y}`, expected: String(x + y) };
    }
    case "SUM_ARRAY": {
      const arr = Array.from({ length: n }, (_, i) => ((i+1)*((seed%7)+1)) % 50);
      return { input: `${n}\n${arr.join(" ")}`, expected: String(arr.reduce((s,c)=>s+c,0)) };
    }
    case "MAX_ARRAY": {
      const arr = Array.from({ length: n }, (_, i) => ((i+3)*((seed%9)+1)) % 90);
      return { input: `${n}\n${arr.join(" ")}`, expected: String(Math.max(...arr)) };
    }
    case "SORT_ARRAY": {
      const arr = Array.from({ length: n }, (_, i) => ((n-i)*((seed%5)+2)) % 70);
      const sorted = [...arr].sort((x,y)=>x-y);
      return { input: `${n}\n${arr.join(" ")}`, expected: sorted.join(" ") };
    }
    case "FACTORIAL": {
      const k = (seed % 10) + 1; // 1..10
      return { input: String(k), expected: factorial(k) };
    }
    case "FIBONACCI_N": {
      const k = (seed % 15); // 0..14
      return { input: String(k), expected: fib(k) };
    }
    case "PALINDROME": {
      const base = pick(words, seed % words.length);
      const s = (seed % 2 === 0) ? base : (base + "a");
      const pal = (seed % 2 === 0) ? s : s.split("").reverse().join("");
      // ensure variety of true/false
      const input = seed % 3 === 0 ? pal : base + (seed%2 ? "x" : "");
      return { input, expected: isPalindrome(input) };
    }
  }
}

function makeDescription(title: string, topic: string, gen: Gen) {
  const map: Record<Gen,string> = {
    REVERSE_STRING: "Given a string s, return the reversed string.",
    UPPERCASE: "Given a string s, return the same string in uppercase.",
    COUNT_VOWELS: "Given a string s, return the count of vowels in s.",
    SUM_TWO_NUMS: "Given two integers a and b (space separated), return their sum.",
    SUM_ARRAY: "Given an integer n and an array of n integers, return the sum of the array.",
    MAX_ARRAY: "Given an integer n and an array of n integers, return the maximum value.",
    SORT_ARRAY: "Given an integer n and an array of n integers, return the array sorted ascending (space separated).",
    FACTORIAL: "Given an integer n (0 ≤ n ≤ 12), return n! (factorial).",
    FIBONACCI_N: "Given n (0-indexed), return the nth Fibonacci number (F0=0,F1=1).",
    PALINDROME: "Given a string s, return true if s is a palindrome, otherwise false."
  };
  return `${map[gen]}\n\nTopic: ${topic}.`;
}

function exampleLine(gen: Gen, io: {input:string, expected:string}) {
  // LeetCode style (X)
  return [
    { input: `Input: ${io.input}`, output: `Output: ${io.expected}` }
  ];
}

type PlanItem = { difficulty: Difficulty, topic: string, gen: Gen };

function planProblems(counts = TARGET): PlanItem[] {
  const diffs: Difficulty[] = [
    ...Array(counts.EASY).fill(Difficulty.EASY),
    ...Array(counts.MEDIUM).fill(Difficulty.MEDIUM),
    ...Array(counts.HARD).fill(Difficulty.HARD),
  ];
  const items: PlanItem[] = [];
  for (let i = 0; i < diffs.length; i++) {
    const topic = topics[i % topics.length];
    const gen = pick(gensByTopic[topic], i);
    items.push({ difficulty: diffs[i], topic, gen });
  }
  return items;
}

async function upsertBaseProblems() {
  // Keep your originals (safe if already present)
  await prisma.problem.upsert({
    where: { slug: "two-sum" },
    update: {},
    create: {
      title: "Two Sum",
      slug: "two-sum",
      difficulty: Difficulty.EASY,
      description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
      examples: [
        { input: "Input: nums=[2,7,11,15], target=9", output: "Output: [0,1]" },
        { input: "Input: nums=[3,2,4], target=6", output: "Output: [1,2]" }
      ],
      tags: ["array","hashmap","two-pointers"],
      testCases: {
        create: [
          { input: "4\n2 7 11 15\n9", expected: "0 1", isHidden: false },
          { input: "3\n3 2 4\n6", expected: "1 2", isHidden: false },
          { input: "5\n1 3 5 7 9\n10", expected: "0 4", isHidden: true },
          { input: "5\n2 5 5 11 15\n10", expected: "1 2", isHidden: true }
        ]
      }
    }
  });

  await prisma.problem.upsert({
    where: { slug: "valid-parentheses" },
    update: {},
    create: {
      title: "Valid Parentheses",
      slug: "valid-parentheses",
      difficulty: Difficulty.EASY,
      description: "Given a string s containing '()[]{}', determine if it's valid.",
      examples: [
        { input: "Input: s=\"()[]{}\"", output: "Output: true" },
        { input: "Input: s=\"(]\"", output: "Output: false" }
      ],
      tags: ["stack","string"],
      testCases: {
        create: [
          { input: "()[]{}", expected: "true", isHidden: false },
          { input: "(]", expected: "false", isHidden: false },
          { input: "([{}])", expected: "true", isHidden: true },
          { input: "([)]", expected: "false", isHidden: true }
        ]
      }
    }
  });
}

async function seedBulk() {
  const plan = planProblems(TARGET); // 220 total
  let created = 0;

  for (let i = 0; i < plan.length; i++) {
    const { difficulty, topic, gen } = plan[i];
    const idx = i + 1;
    const slug = `${topic}-${gen.toLowerCase().replace(/_/g,"-")}-${idx}`;
    const titleBase = ({
      REVERSE_STRING: "Reverse String",
      UPPERCASE: "Uppercase String",
      COUNT_VOWELS: "Count Vowels",
      SUM_TWO_NUMS: "Sum of Two Numbers",
      SUM_ARRAY: "Array Sum",
      MAX_ARRAY: "Array Maximum",
      SORT_ARRAY: "Sort Array",
      FACTORIAL: "Factorial",
      FIBONACCI_N: "Fibonacci Number",
      PALINDROME: "Palindrome Check"
    } as Record<Gen,string>)[gen];

    const title = `${titleBase} (${topic})`;
    const tags = [topic]; // lowercase tag style

    // Build 4 testcases (2 public + 2 hidden)
    const t1 = genIO(gen, idx * 1 + 3);
    const t2 = genIO(gen, idx * 2 + 5);
    const t3 = genIO(gen, idx * 3 + 7);
    const t4 = genIO(gen, idx * 4 + 11);

    try {
      await prisma.problem.upsert({
        where: { slug },
        update: {},
        create: {
          title,
          slug,
          difficulty,
          description: makeDescription(title, topic, gen),
          examples: exampleLine(gen, t1),
          tags,
          testCases: {
            create: [
              { input: t1.input, expected: t1.expected, isHidden: false },
              { input: t2.input, expected: t2.expected, isHidden: false },
              { input: t3.input, expected: t3.expected, isHidden: true },
              { input: t4.input, expected: t4.expected, isHidden: true },
            ]
          }
        }
      });
      created++;
    } catch (e) {
      console.error("skip", slug, e);
    }
  }

  console.log(`Bulk problems created/kept: ${created}/${plan.length}`);
}

async function upsertUsers() {
  await prisma.user.upsert({
    where: { email: "demo@demo.local" },
    create: { id: "demo-user", email: "demo@demo.local", name: "Demo User", role: Role.USER, xp: 30, level: 1 },
    update: {}
  });
  await prisma.user.upsert({
    where: { email: "admin@demo.local" },
    create: { email: "admin@demo.local", name: "Admin", role: Role.ADMIN },
    update: {}
  });
}

async function main() {
  await upsertUsers();
  await upsertBaseProblems();
  await seedBulk();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });