import { executeCode } from "../services/execute.service.js";

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