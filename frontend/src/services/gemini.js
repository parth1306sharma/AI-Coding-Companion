import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const analyzeProblem = async (problem) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const prompt = `
You are an expert competitive programming mentor.

Analyze the following problem and respond with ONLY valid JSON
(no markdown, no code fences, no extra text) matching exactly this shape:

{
  "explanation": "A very simple, beginner-friendly explanation of what the problem is asking, in 3-5 short sentences. Avoid jargon.",
  "topics": ["Topic 1", "Topic 2", "Topic 3"],
  "hints": [
    "Hint 1 - a gentle nudge, does not give away the solution",
    "Hint 2 - a bit more specific, points toward the approach",
    "Hint 3 - close to the solution, describes the key idea"
  ],
  "timeComplexity": "O(...) with a short reason",
  "spaceComplexity": "O(...) with a short reason"
}

Problem:
${JSON.stringify(problem, null, 2)}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return JSON.parse(text);
  } catch (err) {
    console.error("Gemini analyze error:", err);
    return null;
  }
};