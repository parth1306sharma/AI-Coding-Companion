import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const clean = (html = "") =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const analyzeProblem = async (problem) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  const prompt = `
You are a Codeforces Grandmaster, ICPC World Finalist and an expert Competitive Programming mentor.

Your job is NOT to solve the problem.

Your job is to help a beginner understand the problem.

Rules:
- DO NOT provide the algorithm.
- DO NOT provide code.
- DO NOT reveal the final approach.
- DO NOT spoil the solution.
- Use very simple English.
- Assume the student is new to Competitive Programming.
- Explain like a senior is teaching a junior.
- Whenever possible, use a tiny imaginary example.
- Return ONLY markdown.

Return your answer using EXACTLY the following sections.

# 📘 Easy Explanation
Explain the problem in the simplest possible English.
Do NOT rewrite the statement.
Explain what is actually happening.

# 🎯 Goal
In one or two sentences, explain what we are actually trying to find.

# 📦 Input
Explain every input variable like a beginner.

# 📤 Output
Explain exactly what needs to be printed.

# 🔍 Key Observations
Give 5-8 observations that are important.
Do NOT reveal the algorithm.

# 💡 Hints

Hint 1:
A tiny observation.

Hint 2:
A stronger observation.

Hint 3:
Guide the student toward the correct direction WITHOUT revealing the solution.

# 🧠 Topics
List the competitive programming topics involved.

# ⭐ Difficulty
Estimate the Codeforces difficulty.
Explain why.

# 🚨 Common Mistakes
Mention mistakes beginners usually make.

# 🚀 First Step
If you were solving this in a contest, what is the very first thing you would think about?

# 📝 Complexity Goal
Without revealing the algorithm, tell what time complexity we should aim for and why brute force is too slow.

# ❓ Questions You Should Ask Yourself
List 4-6 questions that help the student discover the solution by themselves.
DO NOT answer them.

Problem

Title:
${problem.title}

Statement:
${clean(problem.statement)}

Input:
${clean(problem.input)}

Output:
${clean(problem.output)}

Note:
${clean(problem.note)}
`;

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1800,
    },
  });

  return result.response.text();
};