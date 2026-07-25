import { askGemini } from "../services/ai.service.js";

function stripHtml(html = "") {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export const chat = async (req, res) => {
  try {
    const { code, prompt, problem } = req.body;

    const message = prompt.toLowerCase();

    let task = "";

    if (
      message.includes("edge case")
    ) {
      task = `
Come up with 4-6 tricky EDGE CASE inputs for this problem/code — things
like empty input, minimum/maximum constraint values, duplicates, negative
numbers, single-element input, or anything likely to break a naive solution.

Briefly (1-2 sentences) introduce why these edge cases matter.

Then output ONLY a fenced code block tagged \`testcases\` containing a
JSON array, and nothing else inside that block:

\`\`\`testcases
[
  { "input": "...", "output": "expected output, or best guess", "explanation": "why this case matters" }
]
\`\`\`

Rules for the JSON:
- "input" must be exactly what should be piped to stdin.
- "output" is your best-effort expected result — note in "explanation" if you're not fully certain.
- Valid JSON only inside the block: double-quoted keys/strings, no trailing commas, no comments.
`;
    } else if (
      message.includes("test case") ||
      message.includes("testcase") ||
      message.includes("more test")
    ) {
      task = `
Generate 4-6 additional sample test cases for this problem, covering a
mix of typical and boundary inputs (not just edge cases).

Briefly (1-2 sentences) introduce the set.

Then output ONLY a fenced code block tagged \`testcases\` containing a
JSON array, and nothing else inside that block:

\`\`\`testcases
[
  { "input": "...", "output": "expected output", "explanation": "short note on what this case checks" }
]
\`\`\`

Rules for the JSON:
- "input" must be exactly what should be piped to stdin.
- "output" is your best-effort expected result for that input.
- Valid JSON only inside the block: double-quoted keys/strings, no trailing commas, no comments.
`;
    } else if (
      message.includes("explain") ||
      message.includes("what does") ||
      message.includes("how does")
    ) {
      task = `
Explain the code using the following format:

# Overview
# How it Works
# Key Components
# Best Practices
# Possible Improvements

Use Markdown.
`;
    } else if (
      message.includes("bug") ||
      message.includes("error") ||
      message.includes("issue") ||
      message.includes("problem")
    ) {
      task = `
Review the code.

Find:
- Bugs
- Runtime errors
- Logic mistakes
- Edge cases
- Security issues

If nothing is wrong, clearly say:
"No major issues were found."

Use Markdown.
`;
    } else if (
      message.includes("optimize") ||
      message.includes("performance") ||
      message.includes("improve")
    ) {
      task = `
Optimize the code.

Suggest:
- Better performance
- Cleaner architecture
- Better readability
- Best practices for the language it's written in

Show improved code where useful.

Use Markdown.
`;
    } else if (
      message.includes("comment") ||
      message.includes("documentation")
    ) {
      task = `
Add meaningful comments.

Do NOT change the functionality.

Return only the updated code.
`;
    } else if (
      message.includes("typescript") ||
      message.includes("convert")
    ) {
      task = `
Convert this JavaScript code into TypeScript.

Explain important changes.

Return Markdown.
`;
    } else {
      task = `
Answer the user's programming question.

If code changes are needed,
provide the updated code inside Markdown code blocks.

Be concise and professional.
`;
    }

    const problemContext = problem?.title
      ? `
Problem Context (for reference — the user is solving this):

Title: ${problem.title}
${problem.statement ? `Statement: ${stripHtml(problem.statement).slice(0, 2000)}` : ""}
${problem.constraints ? `Constraints: ${stripHtml(problem.constraints).slice(0, 500)}` : ""}
`
      : "";

    const finalPrompt = `
You are an expert competitive-programming mentor and coding assistant.

You are helping a developer inside an online IDE.
${problemContext}
Current File Code:

\`\`\`
${code}
\`\`\`

User Request:

${prompt}

Task:

${task}

Rules:

- Always consider the current code.
- If code needs modification, return the updated code.
- Wrap code inside proper Markdown code blocks.
- Keep explanations concise.
- Never invent missing code.
- Respond professionally.
`;

    const reply = await askGemini(finalPrompt);

    res.json({
      success: true,
      reply,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "AI request failed",
    });
  }
};