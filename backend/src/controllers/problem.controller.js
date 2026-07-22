import { importProblem } from "../services/problem.service.js";

export const importProblemController = async (req, res) => {
  try {
    console.log("Import request:", req.body);

    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "URL is required.",
      });
    }

    const problem = await importProblem(url);

    return res.status(200).json({
      success: true,
      message: "Problem imported successfully.",
      problem,
    });

  } catch (error) {
    console.error(
      "Import Problem Controller Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to import problem.",
    });
  }
};