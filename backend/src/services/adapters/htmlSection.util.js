import * as cheerio from "cheerio";

// ==========================================================
// Generic helper for platforms (CodeChef, HackerRank) whose
// problem statement comes back as ONE blob of HTML instead of
// pre-split "input" / "output" / "constraints" fields the way
// Codeforces gives us. We walk the top-level nodes and bucket
// everything under the nearest matching heading.
// ==========================================================

const SECTION_MATCHERS = {
  input: /^input(\s+format)?:?$/i,
  output: /^output(\s+format)?:?$/i,
  constraints: /^constraints?:?$/i,
  sampleInput: /^sample\s*input/i,
  sampleOutput: /^sample\s*output/i,
  explanation: /^explanation/i,
  note: /^note:?$/i,
};

function matchSection(text) {
  const clean = text.trim();

  for (const [key, regex] of Object.entries(SECTION_MATCHERS)) {
    if (regex.test(clean)) return key;
  }

  return null;
}

/**
 * Splits a raw HTML statement into { statement, input, output, constraints, note, examples }.
 * Anything before the first recognized heading becomes `statement`.
 * Sample Input / Sample Output headings are paired up (in order) into `examples`.
 */
export function splitStatementHTML(html) {
  const $ = cheerio.load(`<div id="root">${html || ""}</div>`);
  const root = $("#root");

  const buckets = {
    statement: [],
    input: [],
    output: [],
    constraints: [],
    note: [],
  };

  const sampleInputs = [];
  const sampleOutputs = [];

  let current = "statement";

  root.children().each((_, el) => {
    const node = $(el);
    const tag = (el.tagName || "").toLowerCase();
    const isHeading = /^h[1-6]$/.test(tag) || tag === "strong" || tag === "b";

    if (isHeading) {
      const match = matchSection(node.text());

      if (match === "sampleInput") {
        current = "sampleInput";
        return;
      }
      if (match === "sampleOutput") {
        current = "sampleOutput";
        return;
      }
      if (match) {
        current = match;
        return;
      }
    }

    if (current === "sampleInput") {
      if (tag === "pre" || tag === "code") {
        sampleInputs.push(node.text().trim());
        current = "statement";
      }
      return;
    }

    if (current === "sampleOutput") {
      if (tag === "pre" || tag === "code") {
        sampleOutputs.push(node.text().trim());
        current = "statement";
      }
      return;
    }

    if (current === "explanation") {
      // Explanations get folded into notes rather than dropped.
      buckets.note.push($.html(el));
      return;
    }

    if (buckets[current]) {
      buckets[current].push($.html(el));
    }
  });

  const examples = sampleInputs.map((input, i) => ({
    input,
    output: sampleOutputs[i] || "",
  }));

  return {
    statement: buckets.statement.join("\n"),
    input: buckets.input.join("\n"),
    output: buckets.output.join("\n"),
    constraints: buckets.constraints.join("\n"),
    note: buckets.note.join("\n"),
    examples,
  };
}