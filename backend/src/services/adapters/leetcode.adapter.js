import axios from "axios";
import * as cheerio from "cheerio";

// ==========================================================
// LeetCode exposes problem statements through its public
// GraphQL endpoint (the same one leetcode.com's own frontend
// calls), so we hit that directly instead of driving a browser.
//
// We also fetch `metaData` here - a JSON string LeetCode itself
// uses internally to describe the function's name, parameter
// names/types, and return type. Without it, there's no reliable
// way to know that e.g. `maxProduct` takes one `int` and returns
// an `int`, which means there's nothing to build a test-runner
// harness from. `codeSnippets` gives the correct starter code
// (the `class Solution { ... }` wrapper) per language.
// ==========================================================

function extractSlug(url) {
  const match = url.match(/leetcode\.com\/problems\/([a-z0-9-]+)/i);

  if (!match) {
    throw new Error(
      "Couldn't find a problem slug in that LeetCode URL. Expected something like https://leetcode.com/problems/two-sum/"
    );
  }

  return match[1];
}

// LeetCode's `content` field is one HTML blob with the examples
// and constraints baked in as <pre> blocks / a trailing <ul>.
// Pull those out so they can populate their own fields, and trim
// them out of the main statement so nothing shows twice.
// Some LeetCode problems format examples as plain bold paragraphs
// ("Example 1:" / "Input: n = 31" / "Output: 3") instead of <pre>
// blocks. This catches those, and removes the matched paragraphs
// from the statement so they don't render twice.
function parsePlainExamples($, root) {
  const examples = [];
  let current = null;
  const toRemove = [];

  root.find("p").each((_, el) => {
    const text = $(el).text().trim();

    if (/^example\s*\d*:?$/i.test(text)) {
      if (current && (current.input || current.output)) {
        examples.push(current);
      }
      current = { input: "", output: "" };
      toRemove.push(el);
      return;
    }

    const inputMatch = text.match(/^input:?\s*(.*)$/i);
    if (inputMatch && current) {
      current.input = inputMatch[1].trim();
      toRemove.push(el);
      return;
    }

    const outputMatch = text.match(/^output:?\s*(.*)$/i);
    if (outputMatch && current) {
      current.output = outputMatch[1].trim();
      toRemove.push(el);
      return;
    }
  });

  if (current && (current.input || current.output)) {
    examples.push(current);
  }

  // Only commit to this interpretation - and only remove the matched
  // paragraphs - if we actually found something usable.
  if (examples.length > 0) {
    toRemove.forEach((el) => $(el).remove());
  }

  return examples;
}

function parseContent(html) {
  const $ = cheerio.load(`<div id="root">${html || ""}</div>`);
  const root = $("#root");

  const examples = [];

  root.find("pre").each((_, el) => {
    const text = $(el).text().trim();

    const inputMatch = text.match(/Input:\s*([\s\S]*?)(?:\n\s*Output:|$)/i);
    const outputMatch = text.match(
      /Output:\s*([\s\S]*?)(?:\n\s*Explanation:|$)/i
    );

    if (inputMatch) {
      examples.push({
        input: inputMatch[1].trim(),
        output: outputMatch ? outputMatch[1].trim() : "",
      });
    }

    // Drop the parsed example out of the statement flow.
    $(el).remove();
  });

  // Constraints are conventionally the last <ul> in the content,
  // right after a "Constraints:" paragraph/strong tag.
  let constraints = "";

  root.find("p, strong, b").each((_, el) => {
    if (/^constraints:?$/i.test($(el).text().trim())) {
      const list = $(el).nextAll("ul").first();

      if (list.length) {
        constraints = $.html(list);
        list.remove();
      }

      $(el).remove();
    }
  });

  // Fallback: no <pre>-based examples found - try the plain-paragraph
  // format some problems use instead.
  const finalExamples =
    examples.length > 0 ? examples : parsePlainExamples($, root);

  return {
    statement: root.html() || "",
    constraints,
    examples: finalExamples,
  };
}

// LeetCode's metaData is a JSON string like:
// { "name": "maxProduct", "params": [{ "name": "n", "type": "integer" }], "return": { "type": "integer" } }
function parseMetaData(raw) {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);

    if (!parsed?.name || !Array.isArray(parsed.params)) return null;

    return parsed;
  } catch {
    return null;
  }
}

// codeSnippets is an array of { lang, langSlug, code } - key it by
// our own internal language keys (cpp, python) for easy lookup.
const LANGSLUG_TO_KEY = {
  cpp: "cpp",
  python3: "python",
};

function parseCodeSnippets(snippets) {
  const byLang = {};

  for (const snippet of snippets || []) {
    const key = LANGSLUG_TO_KEY[snippet.langSlug];
    if (key) byLang[key] = snippet.code;
  }

  return byLang;
}

export const importLeetCode = async (url) => {
  const slug = extractSlug(url);

  const query = `
    query questionData($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        title
        difficulty
        content
        metaData
        codeSnippets {
          lang
          langSlug
          code
        }
      }
    }
  `;

  let data;

  try {
    const response = await axios.post(
      "https://leetcode.com/graphql",
      {
        query,
        variables: { titleSlug: slug },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Referer: `https://leetcode.com/problems/${slug}/`,
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        timeout: 15000,
      }
    );

    data = response.data?.data?.question;
  } catch (err) {
    throw new Error(
      "Couldn't reach LeetCode's problem API right now. It may be rate-limiting automated requests — try again in a moment."
    );
  }

  if (!data) {
    throw new Error(
      "That LeetCode problem couldn't be found. Double-check the URL and that the problem is public (not premium-only)."
    );
  }

  const { statement, constraints, examples } = parseContent(data.content);
  const functionMeta = parseMetaData(data.metaData);
  const codeSnippets = parseCodeSnippets(data.codeSnippets);

  return {
    platform: "LeetCode",
    url,
    title: data.title?.trim() || "",
    difficulty: data.difficulty || "",
    timeLimit: "",
    memoryLimit: "",
    statement,
    input: "",
    output: "",
    note: "",
    constraints,
    examples,
    functionMeta,
    codeSnippets,
  };
};