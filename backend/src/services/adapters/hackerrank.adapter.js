import axios from "axios";
import { splitStatementHTML } from "./htmlSection.util.js";

// ==========================================================
// HackerRank challenges are readable through a public REST
// endpoint keyed by challenge slug. Most site-wide practice
// challenges resolve under the "master" contest namespace.
// ==========================================================

function extractSlug(url) {
  const match = url.match(/hackerrank\.com\/challenges\/([a-z0-9-]+)/i);

  if (!match) {
    throw new Error(
      "Couldn't find a challenge slug in that HackerRank URL. Expected something like https://www.hackerrank.com/challenges/solve-me-first/problem"
    );
  }

  return match[1];
}

export const importHackerRank = async (url) => {
  const slug = extractSlug(url);

  let model;

  try {
    const response = await axios.get(
      `https://www.hackerrank.com/rest/contests/master/challenges/${slug}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        timeout: 15000,
      }
    );

    model = response.data?.model;
  } catch (err) {
    throw new Error(
      "Couldn't reach HackerRank's challenge API right now. Double-check the URL, or try again in a moment."
    );
  }

  if (!model || !model.body_html) {
    throw new Error(
      "That HackerRank challenge couldn't be found. Double-check the URL and that the challenge is public."
    );
  }

  const { statement, input, output, constraints, note, examples } =
    splitStatementHTML(model.body_html);

  return {
    platform: "HackerRank",
    url,
    title: (model.name || slug).trim(),
    difficulty: model.difficulty_name || "",
    timeLimit: "",
    memoryLimit: "",
    statement,
    input,
    output,
    note,
    constraints,
    examples,
  };
};