import { chromium } from "playwright";

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