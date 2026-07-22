import { askGemini } from "../services/ai.service.js";

export const chat = async (req, res) => {
  try {
    const { code, prompt } = req.body;

    const message = prompt.toLowerCase();

    let task = "";

    if (
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
- Best React/JavaScript practices

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

    const finalPrompt = `
You are an expert software engineer and coding assistant.

You are helping a developer inside an online IDE.

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