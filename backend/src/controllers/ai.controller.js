import { askGemini } from "../services/ai.service.js";

function stripHtml(html = "") {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Builds the input-format instruction for test-case generation.
// LeetCode problems have no stdin at all - the input has to be
// "paramName = value" pairs matching the function's real parameter
// names (from functionMeta), or the harness that runs these test
// cases can't reliably parse them. Everything else (Codeforces,
// CodeChef) genuinely does read from stdin.
function buildInputFormatInstruction(problem) {
  if (problem?.platform === "LeetCode" && problem?.functionMeta?.params?.length) {
    const paramList = problem.functionMeta.params
      .map((p) => `${p.name} (${p.type})`)
      .join(", ");

    const example = problem.functionMeta.params
      .map((p) => `${p.name} = <value>`)
      .join(", ");

    return `
- This is a LeetCode-style problem. There is NO stdin - "input" must be a
  string of comma-separated "paramName = value" pairs using EXACTLY these
  parameter names: ${paramList}.
- Format each value as valid JSON (arrays as [1,2,3], strings in double
  quotes, booleans as true/false).
- Example shape: "${example}"
- Do NOT return "input" as a JSON object - it must be this exact string format.
- Respect each parameter's declared type range: "integer" means a 32-bit
  signed int (roughly -2.1 billion to 2.1 billion) — do NOT generate a
  value outside that range for an "integer" param, even to test large
  numbers. Use "long" if the problem's constraints call for larger values.
`;
  }

  return `
- "input" must be the EXACT full stdin a real submission would receive —
  match the Input Format given in the problem context precisely.
- If the problem reads multiple test cases (e.g. "the first line contains
  t", or any wrapper/count line before the actual values), the generated
  "input" MUST include that wrapper line, not just the bare value(s) for
  one case. For example, if the problem format is "t" then "x" per line,
  a single test case with x=9 must be sent as "1\\n9", NOT just "9".
- Match the exact number of lines and value order the problem's Input
  section describes — do not omit or reorder any line.
`;
}

export const chat = async (req, res) => {
  try {
    const { code, prompt, problem } = req.body;

    const message = prompt.toLowerCase();

    let task = "";

    const inputFormatInstruction = buildInputFormatInstruction(problem);

    // Shared verification instruction for both test-case generation
    // branches - the previous version just asked for a "best-effort"
    // output, which invited guessing instead of actually working out
    // the correct answer.
    const verificationInstruction = `
Before writing the JSON, work through EACH test case step-by-step in plain
text: state the input, trace through what the correct algorithm/logic for
this problem would actually do with it, and derive the output from that
reasoning - don't estimate or pattern-match against other cases. If you're
not fully confident in a value after working it through, either verify it
again or pick a simpler input you CAN verify with certainty, rather than
including a value you're unsure about.

Only after that reasoning, output the final JSON block.
`;

    if (
      message.includes("edge case")
    ) {
      task = `
Come up with 4-6 tricky EDGE CASE inputs for this problem/code — things
like empty input, minimum/maximum constraint values, duplicates, negative
numbers, single-element input, or anything likely to break a naive solution.

Briefly (1-2 sentences) introduce why these edge cases matter.

${verificationInstruction}

Then output ONLY a fenced code block tagged \`testcases\` containing a
JSON array, and nothing else inside that block:

\`\`\`testcases
[
  { "input": "...", "output": "expected output", "explanation": "why this case matters" }
]
\`\`\`

Rules for the JSON:
${inputFormatInstruction}
- "output" is the verified expected result — not a guess.
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

${verificationInstruction}

Then output ONLY a fenced code block tagged \`testcases\` containing a
JSON array, and nothing else inside that block:

\`\`\`testcases
[
  { "input": "...", "output": "expected output", "explanation": "short note on what this case checks" }
]
\`\`\`

Rules for the JSON:
${inputFormatInstruction}
- "output" is the verified expected result — not a guess.
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

    const functionSignatureContext =
      problem?.platform === "LeetCode" && problem?.functionMeta
        ? `
Function Signature: ${problem.functionMeta.name}(${(problem.functionMeta.params || [])
            .map((p) => `${p.name}: ${p.type}`)
            .join(", ")}) -> ${problem.functionMeta.return?.type || "unknown"}
`
        : "";

    const problemContext = problem?.title
      ? `
Problem Context (for reference — the user is solving this):

Title: ${problem.title}
Platform: ${problem.platform || "unknown"}
${functionSignatureContext}
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