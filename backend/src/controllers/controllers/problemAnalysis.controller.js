import { analyzeProblem } from "../services/problemAnalysis.service.js";

export const analyzeProblemController = async (req, res) => {
  try {
    const analysis = await analyzeProblem(req.body.problem);

    res.json({
      success: true,
      analysis,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Failed to analyze problem.",
    });
  }
};