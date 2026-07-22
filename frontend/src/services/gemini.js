import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const analyzeProblem = async (problem) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
You are an expert competitive programmer.

Analyze the following problem and return ONLY this format:

Difficulty:
Tags:
Approach:
Time Complexity:
Space Complexity:
Hints:

Problem:
${problem}
`;

    const result = await model.generateContent(prompt);

    return result.response.text();
  } catch (err) {
    console.log(err);
    return "Failed to analyze problem.";
  }
};