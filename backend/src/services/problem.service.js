import dotenv from "dotenv";
dotenv.config();

import Groq from "groq-sdk";

import { importCodeforces } from "./adapters/codeforces.adapter.js";
import { importLeetCode } from "./adapters/leetcode.adapter.js";
import { importCodeChef } from "./adapters/codechef.adapter.js";
import { importHackerRank } from "./adapters/hackerrank.adapter.js";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

//----------------------------------------
// Platform detection
//----------------------------------------

const PLATFORMS = [
  { test: /codeforces\.com/i, name: "Codeforces", handler: importCodeforces },
  { test: /leetcode\.com/i, name: "LeetCode", handler: importLeetCode },
  { test: /codechef\.com/i, name: "CodeChef", handler: importCodeChef },
  { test: /hackerrank\.com/i, name: "HackerRank", handler: importHackerRank },
];

export const importProblem = async (url) => {
  console.log("=================================");
  console.log("IMPORTING PROBLEM");
  console.log("URL:", url);
  console.log("=================================");

  if (!url) {
    throw new Error("Problem URL is required.");
  }

  const platform = PLATFORMS.find((p) => p.test.test(url));

  if (!platform) {
    throw new Error(
      "Unsupported site. You can import problems from Codeforces, LeetCode, CodeChef, or HackerRank."
    );
  }

  console.log(`Detected platform: ${platform.name}`);

  try {
    const problem = await platform.handler(url);
    console.log("Successfully imported:", problem.title);
    return problem;
  } catch (err) {
    console.error(`${platform.name} import failed:`, err.message);
    throw err;
  }
};

//----------------------------------------
// Analyze Problem (via Groq)
//----------------------------------------

export const analyzeProblem = async (problem) => {
  const prompt = `
You are an expert competitive programming mentor.

Analyze the following problem and respond with ONLY valid JSON
(no markdown, no code fences, no extra text) matching exactly this shape:

{
  "explanation": "A very simple, beginner-friendly explanation of what the problem is asking, in 3-5 short sentences. Avoid jargon.",
  "topics": ["Topic 1", "Topic 2", "Topic 3"],
  "hints": [
    "Hint 1 - a gentle nudge, does not give away the solution",
    "Hint 2 - a bit more specific, points toward the approach",
    "Hint 3 - close to the solution, describes the key idea"
  ],
  "timeComplexity": "O(...) with a short reason",
  "spaceComplexity": "O(...) with a short reason"
}

Problem:
${JSON.stringify(problem, null, 2)}
`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.4,
      max_tokens: 1024,
      response_format: { type: "json_object" },
    });

    const text = completion.choices[0].message.content;

    return JSON.parse(text);
  } catch (error) {
    console.error("Groq analyze error:", error);
    throw new Error("Failed to analyze problem.");
  }
};