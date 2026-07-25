// Splits "a = 1, b = [1,2,3], c = "hi, there"" into top-level
// comma-separated segments, ignoring commas nested inside
// [], {}, () or string literals.
function splitTopLevel(text) {
  const segments = [];
  let depth = 0;
  let inString = false;
  let stringChar = "";
  let current = "";

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (inString) {
      current += ch;
      if (ch === stringChar && text[i - 1] !== "\\") {
        inString = false;
      }
      continue;
    }

    if (ch === '"' || ch === "'") {
      inString = true;
      stringChar = ch;
      current += ch;
      continue;
    }

    if (ch === "[" || ch === "{" || ch === "(") depth++;
    if (ch === "]" || ch === "}" || ch === ")") depth--;

    if (ch === "," && depth === 0) {
      segments.push(current.trim());
      current = "";
      continue;
    }

    current += ch;
  }

  if (current.trim()) segments.push(current.trim());

  return segments;
}

function parseValue(raw) {
  // LeetCode's example values are JSON-compatible (arrays, numbers,
  // quoted strings, true/false), so JSON.parse handles nearly all cases.
  try {
    return JSON.parse(raw);
  } catch {
    return raw; // rare fallback for anything non-JSON-shaped
  }
}

/**
 * Parses LeetCode-style example input text (e.g. "nums = [2,7,11,15], target = 9")
 * into an ordered array of raw JS values, matched against the function's
 * declared parameter names from metaData.params. Falls back to positional
 * order if a name can't be matched (e.g. malformed/edited text).
 */
export function parseLeetCodeArgs(inputText, params) {
  const segments = splitTopLevel(inputText || "");

  const byName = {};

  for (const seg of segments) {
    const match = seg.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*([\s\S]+)$/);

    if (match) {
      const [, name, rawValue] = match;
      byName[name] = parseValue(rawValue.trim());
    }
  }

  return params.map((p, i) => {
    if (p.name in byName) return byName[p.name];

    // Fallback: positional, in case names didn't line up.
    if (segments[i] !== undefined) {
      const match = segments[i].match(/=\s*([\s\S]+)$/);
      return parseValue(match ? match[1].trim() : segments[i]);
    }

    return null;
  });
}