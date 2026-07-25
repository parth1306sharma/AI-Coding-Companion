import {
  cppType,
  cppLiteral,
  cppPrintStatement,
  pythonLiteral,
  pythonPrintStatement,
} from "../utils/leetcodeTypes.util.js";
import { parseLeetCodeArgs } from "../utils/leetcodeArgs.util.js";

/**
 * Builds a full, runnable source file by combining the user's
 * LeetCode-style solution (a `class Solution { ... };` for C++,
 * or `class Solution:` for Python) with an auto-generated main
 * that constructs the test case's arguments as literals, calls
 * the solution's function, and prints the result in a format
 * comparable to LeetCode's displayed expected output.
 */
export function buildLeetCodeHarness({ language, code, meta, inputText }) {
  if (!meta || !meta.name || !Array.isArray(meta.params)) {
    throw new Error(
      "This problem is missing function signature data needed to run it. Try re-importing it."
    );
  }

  const args = parseLeetCodeArgs(inputText, meta.params);

  if (language === "cpp") {
    return buildCppHarness(code, meta, args);
  }

  if (language === "python") {
    return buildPythonHarness(code, meta, args);
  }

  throw new Error(
    `Running LeetCode test cases isn't supported for "${language}" yet — try C++ or Python.`
  );
}

function buildCppHarness(code, meta, args) {
  const argDecls = meta.params.map((p, i) => {
    const type = cppType(p.type);
    const literal = cppLiteral(p.type, args[i]);
    return `${type} arg_${p.name} = ${literal};`;
  });

  const callArgs = meta.params.map((p) => `arg_${p.name}`).join(", ");
  const returnType = meta.return?.type;
  const printStatement = returnType
    ? cppPrintStatement(returnType, "__result")
    : `cout << "(no return value)";`;

  return `#include <bits/stdc++.h>
using namespace std;

${code}

int main() {
    Solution sol;
    ${argDecls.join("\n    ")}
    auto __result = sol.${meta.name}(${callArgs});
    ${printStatement}
    cout << endl;
    return 0;
}
`;
}

function buildPythonHarness(code, meta, args) {
  const argDecls = meta.params.map(
    (p, i) => `arg_${p.name} = ${pythonLiteral(args[i])}`
  );

  const callArgs = meta.params.map((p) => `arg_${p.name}`).join(", ");
  const returnType = meta.return?.type;
  const printStmt = returnType
    ? pythonPrintStatement(returnType, "__result")
    : `print("(no return value)")`;

  return `${code}

sol = Solution()
${argDecls.join("\n")}
__result = sol.${meta.name}(${callArgs})
${printStmt}
`;
}