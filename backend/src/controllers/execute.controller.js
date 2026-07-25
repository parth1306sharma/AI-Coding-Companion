import { executeCode } from "../services/execute.service.js";
import { buildLeetCodeHarness } from "../services/leetcodeHarness.service.js";

export const executeController = async (req, res) => {
  try {
    const { language, code, input } = req.body;

    if (!language || !code) {
      return res.status(400).json({
        success: false,
        message: "language and code are required.",
      });
    }

    const result = await executeCode({ language, code, input });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Execute Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to execute code.",
    });
  }
};

// LeetCode problems come in as a bare `class Solution { ... }` with
// no main() - there's nothing to run directly. This builds a full
// program (harness + user's class) server-side using the function
// signature metadata captured at import time, then runs it exactly
// like a normal submission.
export const executeLeetCodeController = async (req, res) => {
  try {
    const { language, code, meta, input } = req.body;

    if (!language || !code || !meta) {
      return res.status(400).json({
        success: false,
        message: "language, code, and meta are required.",
      });
    }

    const harnessSource = buildLeetCodeHarness({
      language,
      code,
      meta,
      inputText: input || "",
    });

    const result = await executeCode({
      language,
      code: harnessSource,
      input: "",
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Execute LeetCode Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to run this test case.",
    });
  }
};