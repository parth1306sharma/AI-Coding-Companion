import { chromium } from "playwright";
import dotenv from "dotenv";
dotenv.config();

import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const importProblem = async (url) => {
  console.log("=================================");
  console.log("IMPORTING PROBLEM");
  console.log("URL:", url);
  console.log("=================================");

  if (!url) {
    throw new Error("Problem URL is required.");
  }

  if (!url.includes("codeforces.com")) {
    throw new Error("Currently only Codeforces is supported.");
  }

  const browser = await chromium.launch({
    headless: true,
  });

  try {
    const context = await browser.newContext({
      ignoreHTTPSErrors: true,
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });

    const page = await context.newPage();

    console.log("Opening Codeforces...");

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    await page.waitForSelector(".problem-statement", {
      timeout: 15000,
    });

    console.log("Page loaded.");

    //----------------------------------------
    // Helper
    //----------------------------------------

  async function getHTML(selector, removeHeader = false) {
  try {
    return await page.locator(selector).evaluate(
      (root, removeHeader) => {
        const clone = root.cloneNode(true);

        if (removeHeader) {
          clone.querySelector(".header")?.remove();
        }

        // Remove rendered MathJax
        clone.querySelectorAll(".MathJax").forEach((e) => e.remove());
        clone.querySelectorAll(".MathJax_Preview").forEach((e) => e.remove());

        // Inline math
        clone.querySelectorAll("script[type='math/tex']").forEach((script) => {
          script.replaceWith(
            document.createTextNode(`\\(${script.textContent.trim()}\\)`)
          );
        });

        // Display math
        clone
          .querySelectorAll("script[type='math/tex; mode=display']")
          .forEach((script) => {
            script.replaceWith(
              document.createTextNode(`\\[${script.textContent.trim()}\\]`)
            );
          });

        return clone.innerHTML;
      },
      removeHeader
    );
  } catch {
    return "";
  }
}

    //----------------------------------------
    // Title
    //----------------------------------------

    const title = await page
      .locator(".problem-statement .title")
      .first()
      .innerText();

    //----------------------------------------
    // Time
    //----------------------------------------

    const timeLimit = await page
      .locator(".time-limit")
      .innerText()
      .catch(() => "");

    //----------------------------------------
    // Memory
    //----------------------------------------

    const memoryLimit = await page
      .locator(".memory-limit")
      .innerText()
      .catch(() => "");

    //----------------------------------------
    // Sections
    //----------------------------------------

    const statement = await getHTML(".problem-statement", true);

    const input = await getHTML(".input-specification");

    const output = await getHTML(".output-specification");

    const note = await getHTML(".note");

    //----------------------------------------
    // Sample Tests
    //----------------------------------------

    const examples = await page
      .locator(".sample-test")
      .evaluate((sample) => {
        const inputs = [...sample.querySelectorAll(".input pre")].map((e) =>
          e.innerText.trim()
        );

        const outputs = [...sample.querySelectorAll(".output pre")].map((e) =>
          e.innerText.trim()
        );

        return inputs.map((input, i) => ({
          input,
          output: outputs[i] || "",
        }));
      })
      .catch(() => []);

    console.log("Successfully imported:", title);

    return {
      platform: "Codeforces",
      url,
      title: title.trim(),
      timeLimit: timeLimit.trim(),
      memoryLimit: memoryLimit.trim(),
      statement,
      input,
      output,
      note,
      constraints: "",
      examples,
    };
  } catch (err) {
    console.error("Scraping failed:", err);
    throw err;
  } finally {
    await browser.close();
  }
};

//----------------------------------------
// Analyze Problem (via Groq)
//----------------------------------------

export const analyzeProblem = async (problem) => {
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

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.4,
      max_tokens: 1024,
      response_format: { type: "json_object" },
    });

    const text = completion.choices[0].message.content;

    return JSON.parse(text);
  } catch (error) {
    console.error("Groq analyze error:", error);
    throw new Error("Failed to analyze problem.");
  }
};