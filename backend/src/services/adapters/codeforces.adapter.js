import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ==========================================================
// Codeforces — no public API for problem statements, so we
// drive a headless browser and read the rendered DOM.
//
// Codeforces sits behind Cloudflare's bot-check ("Just a
// moment..." interstitial). Bare Playwright + bundled Chromium
// gets fingerprinted and blocked almost every time. The fixes
// below, in order of impact:
//
//   1. Use the real installed Chrome binary (channel: "chrome")
//      instead of Playwright's bundled Chromium — far fewer
//      automation tells in the JS environment.
//   2. Patch the handful of navigator/window properties that
//      bot-detection scripts check most commonly.
//   3. Detect the Cloudflare interstitial explicitly and give
//      it a few seconds to auto-resolve, instead of just
//      timing out waiting for .problem-statement.
//   4. Persist cookies (incl. cf_clearance) to disk so once a
//      session clears the challenge, later imports skip it.
// ==========================================================

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORAGE_STATE_PATH = path.join(__dirname, ".cf-session-state.json");

// FlareSolverr does the actual Cloudflare-solving with its own patched
// browser (it clears challenges Playwright + manual stealth patches can't,
// since Cloudflare's newer checks can detect the CDP connection Playwright
// uses regardless of navigator/window patches). We call it once per cold
// session to get a working cf_clearance cookie, then hand that cookie to
// our normal Playwright context so the rest of the scraping code is
// unchanged.
const FLARESOLVERR_URL = process.env.FLARESOLVERR_URL || "http://localhost:8191/v1";

async function getCloudflareClearedCookies(url) {
  const res = await fetch(FLARESOLVERR_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cmd: "request.get",
      url,
      maxTimeout: 60000,
    }),
  });

  if (!res.ok) {
    throw new Error(`FlareSolverr request failed with status ${res.status}`);
  }

  const data = await res.json();

  if (data.status !== "ok") {
    throw new Error(`FlareSolverr couldn't solve the challenge: ${data.message || "unknown error"}`);
  }

  return {
    cookies: data.solution.cookies, // array of { name, value, domain, path, ... }
    userAgent: data.solution.userAgent, // the UA FlareSolverr's browser used — reuse it so cookies match
  };
}

async function applyStealthPatches(context) {
  await context.addInitScript(() => {
    // navigator.webdriver is the single most common automation flag
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });

    // Headless browsers report an empty plugins array
    Object.defineProperty(navigator, "plugins", {
      get: () => [1, 2, 3, 4, 5],
    });

    // Headless Chrome often reports no languages or just "en-US"
    Object.defineProperty(navigator, "languages", {
      get: () => ["en-US", "en"],
    });

    // Real Chrome exposes window.chrome; bundled/headless builds sometimes don't
    // @ts-ignore
    window.chrome = window.chrome || { runtime: {} };

    // Patch the permissions API — headless Chrome answers "denied" for
    // Notification.permission in a way real Chrome doesn't by default
    const originalQuery = window.navigator.permissions?.query;
    if (originalQuery) {
      window.navigator.permissions.query = (parameters) =>
        parameters.name === "notifications"
          ? Promise.resolve({ state: Notification.permission })
          : originalQuery(parameters);
    }
  });
}

async function waitOutCloudflareChallenge(page) {
  const title = await page.title().catch(() => "");
  if (!title.includes("Just a moment")) return; // no challenge shown, nothing to do

  console.log("Cloudflare challenge detected, waiting for it to auto-resolve...");
  await page
    .waitForFunction(() => !document.title.includes("Just a moment"), {
      timeout: 15000,
    })
    .catch(() => {
      // If it's still showing after 15s, we'll fail below at the
      // .problem-statement wait with a clear debug screenshot anyway.
    });
}

export const importCodeforces = async (url) => {
  const browser = await chromium.launch({
    headless: true,
    channel: "chrome", // real installed Chrome — fewer automation fingerprints than bundled Chromium
    args: ["--disable-blink-features=AutomationControlled"],
  });

  try {
    // Ask FlareSolverr to clear the Cloudflare challenge and give us
    // working cookies + the UA its browser presented (must match, or
    // Codeforces will flag the mismatch and re-challenge us).
    let flareResult;
    try {
      flareResult = await getCloudflareClearedCookies(url);
    } catch (flareErr) {
      console.error("FlareSolverr failed:", flareErr.message);
      throw new Error(
        "Couldn't get past Codeforces' bot check. Make sure FlareSolverr is running (docker run ... ghcr.io/flaresolverr/flaresolverr) and reachable at " +
          FLARESOLVERR_URL
      );
    }

    const context = await browser.newContext({
      ignoreHTTPSErrors: true,
      userAgent: flareResult.userAgent,
      viewport: { width: 1366, height: 768 },
      locale: "en-US",
      timezoneId: "America/New_York",
    });

    await applyStealthPatches(context);

    // Hand Playwright the cf_clearance (and any other) cookies FlareSolverr
    // obtained, so when we navigate normally we're already "cleared".
    await context.addCookies(
      flareResult.cookies.map((c) => ({
        name: c.name,
        value: c.value,
        domain: c.domain,
        path: c.path || "/",
        expires: c.expires,
        httpOnly: c.httpOnly,
        secure: c.secure,
        sameSite: ["Strict", "Lax", "None"].includes(c.sameSite) ? c.sameSite : "Lax",
      }))
    );

    const page = await context.newPage();

    try {
      // "networkidle" is unreliable here — Codeforces keeps background
      // requests going (view counters, ads, analytics) that often never
      // fully go idle, causing false timeouts even when the page itself
      // has loaded fine. "domcontentloaded" fires as soon as the HTML is
      // parsed; the waits right after are what actually confirm the
      // real content (not the CF interstitial) is ready.
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      await waitOutCloudflareChallenge(page);

      await page.waitForSelector(".problem-statement", {
        timeout: 20000,
      });

      // Challenge cleared (or wasn't shown) and real content loaded —
      // persist cookies so future imports in this process/session can
      // skip the challenge entirely.
      await context.storageState({ path: STORAGE_STATE_PATH }).catch(() => {});
    } catch (err) {
      // The page loaded but the expected content never appeared — capture
      // what actually rendered (title, final URL, screenshot) so we can
      // tell a login wall / block page / redirect apart from a real timeout.
      const debugInfo = {
        finalUrl: page.url(),
        title: await page.title().catch(() => "(couldn't read title)"),
      };
      console.error("Codeforces page did not show expected content:", debugInfo);

      try {
        await page.screenshot({ path: "cf-debug-screenshot.png", fullPage: true });
        console.error("Saved debug screenshot to cf-debug-screenshot.png");
      } catch {}

      // A stale/invalid saved session can itself cause failures (e.g. if
      // Codeforces flagged that cf_clearance cookie). Drop it so the next
      // attempt starts clean instead of repeating the same failure forever.
      if (debugInfo.title.includes("Just a moment") && fs.existsSync(STORAGE_STATE_PATH)) {
        fs.unlinkSync(STORAGE_STATE_PATH);
        console.error("Cleared saved Cloudflare session; next import will start fresh.");
      }

      throw new Error(
        "Couldn't load that Codeforces problem in time. It may be temporarily slow, rate-limiting automated requests, or the URL may be wrong — try again in a moment."
      );
    }

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