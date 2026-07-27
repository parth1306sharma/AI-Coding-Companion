// A strict `actual.trim() === expected.trim()` comparison fails on
// differences that don't actually matter - different line endings
// (\r\n vs \n), an extra blank line, or inconsistent spacing between
// numbers, even when the output is visually identical. This collapses
// all whitespace (including newlines) down to single spaces after
// trimming, so only the actual tokens are compared - the same
// approach most competitive judges use ("token comparison").
export function normalizeOutput(str) {
  return (str || "")
    .replace(/\r\n/g, "\n")
    .trim()
    .split(/\s+/)
    .join(" ");
}

export function outputsMatch(actual, expected) {
  if (!expected) return false;
  return normalizeOutput(actual) === normalizeOutput(expected);
}