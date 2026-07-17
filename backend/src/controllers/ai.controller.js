import { askGemini } from "../services/ai.service.js";

export const chat = async (req, res) => {
  try {
    const { code, prompt } = req.body;

    const message = prompt.toLowerCase();

    let finalPrompt = "";

    // ========= Explain =========
    if (
      message.includes("explain") ||
      message.includes("what does this") ||
      message.includes("how does this")
    ) {
      finalPrompt = `
You are an expert software engineer.

Explain the following code in simple language.

Include:
- Overview
- How it works
- Important parts
- Best practices
- Possible improvements

Return Markdown.

Code:

\`\`\`
${code}
\`\`\`
`;
    }

    // ========= Find Bugs =========
    else if (
      message.includes("bug") ||
      message.includes("error") ||
      message.includes("issue") ||
      message.includes("problem")
    ) {
      finalPrompt = `
You are a senior software engineer.

Review the following code.

Find:
- Bugs
- Runtime errors
- Logical mistakes
- Edge cases
- Security issues

If no bugs exist, say so.

Return Markdown.

Code:

\`\`\`
${code}
\`\`\`
`;
    }

    // ========= Optimize =========
    else if (
      message.includes("optimize") ||
      message.includes("performance") ||
      message.includes("improve")
    ) {
      finalPrompt = `
Optimize this code.

Suggest:

- Cleaner code
- Better performance
- Better readability
- React best practices
- Cleaner architecture

Return improved code when necessary.

Code:

\`\`\`
${code}
\`\`\`
`;
    }

    // ========= Add Comments =========
    else if (
      message.includes("comment") ||
      message.includes("documentation")
    ) {
      finalPrompt = `
Add meaningful comments to this code.

Do not change functionality.

Return only the commented code.

Code:

\`\`\`
${code}
\`\`\`
`;
    }

    // ========= Convert to TypeScript =========
    else if (
      message.includes("typescript") ||
      message.includes("convert")
    ) {
      finalPrompt = `
Convert this JavaScript code into TypeScript.

Explain any required changes.

Code:

\`\`\`
${code}
\`\`\`
`;
    }

    // ========= General Programming =========
    else if (
      message.includes("react") ||
      message.includes("javascript") ||
      message.includes("node") ||
      message.includes("express") ||
      message.includes("mongodb") ||
      message.includes("css") ||
      message.includes("html")
    ) {
      finalPrompt = prompt;
    }

    // ========= Everything Else =========
    else {
      finalPrompt = prompt;
    }

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