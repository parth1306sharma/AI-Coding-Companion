import axios from "axios";
import { chromium } from "playwright";
import { splitStatementHTML } from "./htmlSection.util.js";

// ==========================================================
// CodeChef — three attempts, in order of speed/reliability:
//
//  1. The lightweight JSON API (fast, no browser).
//  2. Sniffing the network traffic of a real page load for
//     whatever JSON response CodeChef's own frontend uses to
//     populate the statement — this sidesteps guessing CSS
//     selectors entirely, since we just read the same data
//     their client already fetches.
//  3. A narrow set of DOM selectors as a last resort.
//
// Every candidate is validated before being trusted: CodeChef
// has been seen returning a UI stub ("All submissions for this
// problem are available.") instead of the real statement, and
// that phrase — or short/near-empty content — is rejected
// outright rather than accepted just because it's non-empty.
//
// Every candidate is also run through stripBoilerplate() before
// being handed to splitStatementHTML: CodeChef's standard editorial
// template prepends "PROBLEM LINK / Practice / Contest: Division
// 1-4 / Author / Tester / Editorialist / DIFFICULTY / PREREQUISITES"
// before a "PROBLEM:" heading that introduces the real statement.
// None of that metadata is part of the actual problem, so it's
// stripped rather than shown to the user.
// ==========================================================

const BOILERPLATE_SNIPPETS = [
  "all submissions for this problem are available",
  "login to view",
  "please login",
];

function extractCode(url) {
  // Matches /problems/CODE, /PRACTICE-CONTEST/problems/CODE, etc.
  const match = url.match(/codechef\.com\/(?:[a-z0-9-]+\/)?problems\/([A-Za-z0-9_]+)/i);

  if (!match) {
    throw new Error(
      "Couldn't find a problem code in that CodeChef URL. Expected something like https://www.codechef.com/problems/TSHIRT"
    );
  }

  return match[1];
}

// Strict: rejects short text AND text that's mostly/entirely a known
// UI stub, even if padded with surrounding nav/chrome text.
function isUsableText(text) {
  if (!text) return false;

  const clean = text.replace(/\s+/g, " ").trim();

  if (clean.length < 150) return false;

  const lower = clean.toLowerCase();

  if (BOILERPLATE_SNIPPETS.some((snippet) => lower.includes(snippet))) {
    return false;
  }

  return true;
}

function htmlToText(html) {
  return (html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function isUsableHtml(html) {
  return isUsableText(htmlToText(html));
}

//----------------------------------------
// CodeChef's own editorial template starts with "PROBLEM LINK:"
// followed by Author/Tester/Editorialist credits - this exact
// header never appears in a real problem statement, so it's a
// reliable signal we've grabbed an editorial instead. This check
// happens BEFORE anything is accepted as a candidate, unlike
// stripBoilerplate() (which cleans up text we've already decided
// to trust).
//----------------------------------------

function isEditorialTemplate(html) {
  const text = htmlToText(html).toLowerCase();

  if (text.includes("problem link:")) return true;

  const hasAuthorCredits =
    text.includes("author:") &&
    text.includes("tester:") &&
    text.includes("editorialist:");

  return hasAuthorCredits;
}

//----------------------------------------
// Strip CodeChef's standard editorial-template metadata block
// (problem link / contest divisions / author / tester /
// editorialist / difficulty / prerequisites) that precedes the
// actual statement under a "PROBLEM:" heading.
//----------------------------------------

function stripBoilerplate(html) {
  if (!html) return html;

  // Only look for the heading near the start of the document —
  // matching it anywhere could accidentally cut real statement
  // text later on if the word "problem" appears again.
  const searchWindow = html.slice(0, 3000);

  const headingMatch = searchWindow.match(
    /PROBLEM\s*:\s*(<\/(?:strong|b|em|h[1-6]|p|span)>)?/i
  );

  if (headingMatch) {
    const cutAt = headingMatch.index + headingMatch[0].length;
    const remainder = html.slice(cutAt).trim();

    // Sanity check: only cut if there's still substantial content
    // left afterward — otherwise this wasn't the boilerplate heading
    // we thought it was, and cutting would eat the whole statement.
    if (isUsableHtml(remainder)) {
      return remainder;
    }
  }

  return html;
}

//----------------------------------------
// Some CodeChef problems (especially "easy version" / educational
// contest problems) embed a full editorial - proof, complexity
// analysis, "let's denote..." walkthroughs - under the same "Note"
// heading a genuine sample-clarification note would use. A real
// note is usually a sentence or two; an editorial is a wall of text
// with distinctive phrasing. Flag and drop the latter, keep the former.
//----------------------------------------

const EDITORIAL_SIGNALS = [
  "proof",
  "editorial",
  "let's denote",
  "lets denote",
  "time complexity",
  "we claim",
  "we'll show",
  "we will show",
  "solution:",
  "rather simple solution",
];

function looksLikeEditorial(text) {
  if (!text) return false;

  const clean = text.toLowerCase();

  // A genuine note clarifying a sample is usually short. Several
  // paragraphs under "Note" is already suspicious on its own.
  if (clean.length > 600) return true;

  const hits = EDITORIAL_SIGNALS.filter((sig) => clean.includes(sig)).length;

  return hits >= 2;
}

function cleanNote(note) {
  if (!note) return note;
  return looksLikeEditorial(htmlToText(note)) ? "" : note;
}

//----------------------------------------
// Attempt 1: public JSON API (fast path)
//----------------------------------------

async function tryApi(url, code) {
  const response = await axios.get(
    `https://www.codechef.com/api/contests/PRACTICE/problems/${code}`,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      timeout: 15000,
    }
  );

  const data = response.data;

  if (!data || data.success === false || !isUsableHtml(data.body)) {
    return null;
  }

  const cleanedBody = stripBoilerplate(data.body);

  const { statement, input, output, constraints, note, examples } =
    splitStatementHTML(cleanedBody);

  const timeLimit = data.max_timelimit
    ? `${data.max_timelimit} sec`
    : data.time_limit
    ? `${data.time_limit} sec`
    : "";

  return {
    platform: "CodeChef",
    url,
    title: (data.problem_name || code).trim(),
    difficulty: data.difficulty_rating ? String(data.difficulty_rating) : "",
    timeLimit,
    memoryLimit: "",
    statement,
    input,
    output,
    note: cleanNote(note),
    constraints,
    examples,
  };
}

//----------------------------------------
// Shared: recursively find the best "statement-shaped" string
// inside an arbitrary JSON payload — prefers a key whose name
// hints at being the statement, falls back to the longest
// string field found anywhere in the object.
//----------------------------------------

function findStatementField(node, keyHints, depth = 0, best = { value: null, hinted: false }) {
  if (node == null || depth > 6) return best;

  if (typeof node === "string") {
    return best;
  }

  if (Array.isArray(node)) {
    for (const item of node) {
      findStatementField(item, keyHints, depth + 1, best);
    }
    return best;
  }

  if (typeof node === "object") {
    for (const [key, value] of Object.entries(node)) {
      if (typeof value === "string") {
        const hinted = keyHints.some((h) => key.toLowerCase().includes(h));

        if (isUsableText(htmlToText(value))) {
          if (hinted && !best.hinted) {
            best.value = value;
            best.hinted = true;
          } else if (!best.hinted && (!best.value || value.length > best.value.length)) {
            best.value = value;
          } else if (hinted && best.hinted && value.length > best.value.length) {
            best.value = value;
          }
        }
      } else {
        findStatementField(value, keyHints, depth + 1, best);
      }
    }
  }

  return best;
}

//----------------------------------------
// Attempt 2 & 3: real browser — network sniffing, then DOM
//----------------------------------------

const NARROW_SELECTORS = [
  "#problem-statement",
  ".problem-statement",
  "[class*='problem-statement' i]",
  "[class*='problemStatement' i]",
  "[data-cy='problem-statement']",
];

async function tryBrowser(url, code) {
  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext({
      ignoreHTTPSErrors: true,
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });

    const page = await context.newPage();

    let sniffed = null;

    page.on("response", async (response) => {
      if (sniffed) return;

      const respUrl = response.url();

      // Never trust editorial/discussion endpoints - they use the
      // same JSON shape as the real statement endpoint, but contain
      // the wrong content entirely.
      if (/editorial|discuss/i.test(respUrl)) return;

      const contentType = response.headers()["content-type"] || "";
      if (!contentType.includes("application/json")) return;
      if (!/codechef\.com/i.test(respUrl)) return;

      try {
        const json = await response.json();
        const found = findStatementField(json, [
          "statement",
          "body",
          "description",
          "problem_statement",
        ]);

        if (found.value && !isEditorialTemplate(found.value)) {
          sniffed = found.value;
        }
      } catch {
        // Not usable JSON — ignore.
      }
    });

    const targetUrl = url.includes("tab=statement")
      ? url
      : `${url.split("?")[0]}?tab=statement`;

    await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 60000 });

    // Make sure the Statement tab is actually the active one.
    try {
      await page.getByText(/^statement$/i).first().click({ timeout: 3000 });
    } catch {
      // Already on it, or no explicit tab control — fine either way.
    }

    // Give any lazy/async statement fetch a bit more time to land.
    await page.waitForTimeout(2500);

    const title = await page
      .title()
      .then((t) => t.replace(/\s*[|\-]\s*CodeChef.*$/i, "").trim())
      .catch(() => "");

    const pageText = await page
      .locator("body")
      .innerText()
      .catch(() => "");

    const timeLimitMatch = pageText.match(
      /time\s*limit[:\s]*([\d.]+\s*sec[a-z]*)/i
    );

    // Prefer whatever we sniffed off the network — most reliable.
    if (sniffed) {
      const isHtml = /<[a-z][\s\S]*>/i.test(sniffed);
      const html = isHtml
        ? sniffed
        : sniffed
            .split(/\n{2,}/)
            .map((p) => `<p>${p}</p>`)
            .join("");

      const cleanedHtml = stripBoilerplate(html);

      const { statement, input, output, constraints, note, examples } =
        splitStatementHTML(cleanedHtml);

      return {
        platform: "CodeChef",
        url,
        title: title || code,
        difficulty: "",
        timeLimit: timeLimitMatch ? timeLimitMatch[1] : "",
        memoryLimit: "",
        statement,
        input,
        output,
        note: cleanNote(note),
        constraints,
        examples,
      };
    }

    // Fall back to a narrow set of DOM selectors.
    for (const selector of NARROW_SELECTORS) {
      try {
        const el = page.locator(selector).first();
        if ((await el.count()) === 0) continue;

        const candidateHtml = await el.innerHTML();
        if (!isUsableHtml(candidateHtml)) continue;
        if (isEditorialTemplate(candidateHtml)) continue;

        const cleanedHtml = stripBoilerplate(candidateHtml);

        const { statement, input, output, constraints, note, examples } =
          splitStatementHTML(cleanedHtml);

        return {
          platform: "CodeChef",
          url,
          title: title || code,
          difficulty: "",
          timeLimit: timeLimitMatch ? timeLimitMatch[1] : "",
          memoryLimit: "",
          statement,
          input,
          output,
          note: cleanNote(note),
          constraints,
          examples,
        };
      } catch {
        continue;
      }
    }

    return null;
  } finally {
    await browser.close();
  }
}

export const importCodeChef = async (url) => {
  const code = extractCode(url);

  try {
    const viaApi = await tryApi(url, code);
    if (viaApi) {
      console.log("[CodeChef] Resolved via API");
      return viaApi;
    }
    console.log("[CodeChef] API path returned null, falling back to browser");
  } catch (err) {
    console.log("[CodeChef] API path threw:", err.message);
  }

  try {
    const viaBrowser = await tryBrowser(url, code);
    if (viaBrowser) {
      console.log("[CodeChef] Resolved via browser");
      return viaBrowser;
    }
    console.log("[CodeChef] Browser path returned null");
  } catch (err) {
    console.log("[CodeChef] Browser path threw:", err.message);
  }

  throw new Error(
    "Couldn't read that CodeChef problem's statement — CodeChef may be gating it behind login, or its layout changed. Try pasting the problem manually for now."
  );
};