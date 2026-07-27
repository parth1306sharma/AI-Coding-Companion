import { chromium } from "playwright";

// ==========================================================
// Codeforces — no public API for problem statements, so we
// drive a headless browser and read the rendered DOM.
// ==========================================================

export const importCodeforces = async (url) => {
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

    await page.goto(url, {
      waitUntil: "networkidle",
      timeout: 60000,
    });

    await page.waitForSelector(".problem-statement", {
      timeout: 15000,
    });

    // Codeforces typesets math with MathJax *after* the page loads —
    // scraping too early leaves raw "$$$...$$$" / "\(...\)" source text
    // in place of the <script type="math/tex"> tags we convert below.
    // Hook into MathJax's own completion queue instead of guessing a
    // fixed delay, so we only proceed once it's actually done.
    await page
      .evaluate(() => {
        return new Promise((resolve) => {
          if (window.MathJax?.Hub?.Queue) {
            window.MathJax.Hub.Queue(() => resolve());
            // Safety net in case the queue callback never fires.
            setTimeout(resolve, 5000);
          } else {
            // No MathJax on the page (or a version we don't recognize) —
            // give any client-side rendering a brief moment anyway.
            setTimeout(resolve, 1000);
          }
        });
      })
      .catch(() => {});

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
    // Title / limits
    //----------------------------------------

    const title = await page
      .locator(".problem-statement .title")
      .first()
      .innerText();

    const timeLimit = await page
      .locator(".time-limit")
      .innerText()
      .catch(() => "");

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
  } finally {
    await browser.close();
  }
};