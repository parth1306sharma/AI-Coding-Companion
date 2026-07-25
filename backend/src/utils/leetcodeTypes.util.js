// ==========================================================
// Maps LeetCode's metaData type strings (e.g. "integer[]") to:
//  - the C++/Python type/literal needed to declare an argument
//  - the code needed to print a RESULT of that type in a
//    format that matches how LeetCode displays expected output
//    (compact JSON-style arrays: [1,2,3], lowercase true/false)
//
// Supported: integer, long, double, boolean, string, character,
// and their 1D/2D array forms. ListNode/TreeNode are out of scope
// for now - those need actual struct construction, not literals.
// ==========================================================

const CPP_TYPE_MAP = {
  integer: "int",
  long: "long long",
  double: "double",
  boolean: "bool",
  string: "string",
  character: "char",
  "integer[]": "vector<int>",
  "long[]": "vector<long long>",
  "double[]": "vector<double>",
  "boolean[]": "vector<bool>",
  "string[]": "vector<string>",
  "character[]": "vector<char>",
  "integer[][]": "vector<vector<int>>",
  "string[][]": "vector<vector<string>>",
};

export function cppType(type) {
  if (!(type in CPP_TYPE_MAP)) {
    throw new Error(`Unsupported type for C++: "${type}"`);
  }

  return CPP_TYPE_MAP[type];
}

export function cppLiteral(type, value) {
  if (type === "string") return JSON.stringify(String(value));
  if (type === "character") return `'${String(value)}'`;
  if (type === "boolean") return value ? "true" : "false";
  if (type === "integer" || type === "long" || type === "double") {
    return String(value);
  }

  if (type === "integer[]" || type === "long[]" || type === "double[]") {
    return `{${(value || []).map((v) => String(v)).join(", ")}}`;
  }

  if (type === "boolean[]") {
    return `{${(value || []).map((v) => (v ? "true" : "false")).join(", ")}}`;
  }

  if (type === "string[]") {
    return `{${(value || []).map((v) => JSON.stringify(String(v))).join(", ")}}`;
  }

  if (type === "integer[][]") {
    return `{${(value || [])
      .map((row) => `{${row.map((v) => String(v)).join(", ")}}`)
      .join(", ")}}`;
  }

  if (type === "string[][]") {
    return `{${(value || [])
      .map(
        (row) => `{${row.map((v) => JSON.stringify(String(v))).join(", ")}}`
      )
      .join(", ")}}`;
  }

  throw new Error(`Unsupported type for C++ literal: "${type}"`);
}

// Returns a C++ *statement* (ending without a trailing semicolon
// handled by the caller) that prints `resultVar` in a format
// comparable to LeetCode's displayed expected output.
export function cppPrintStatement(type, resultVar) {
  if (type === "boolean") {
    return `cout << (${resultVar} ? "true" : "false");`;
  }

  if (
    type === "string" ||
    type === "integer" ||
    type === "long" ||
    type === "double" ||
    type === "character"
  ) {
    return `cout << ${resultVar};`;
  }

  if (type && type.endsWith("[][]")) {
    return `
    cout << "[";
    for (size_t __i = 0; __i < ${resultVar}.size(); __i++) {
        cout << "[";
        for (size_t __j = 0; __j < ${resultVar}[__i].size(); __j++) {
            cout << ${resultVar}[__i][__j];
            if (__j + 1 < ${resultVar}[__i].size()) cout << ",";
        }
        cout << "]";
        if (__i + 1 < ${resultVar}.size()) cout << ",";
    }
    cout << "]";
    `;
  }

  if (type && type.endsWith("[]")) {
    const isString = type === "string[]";

    return `
    cout << "[";
    for (size_t __i = 0; __i < ${resultVar}.size(); __i++) {
        ${
          isString
            ? `cout << "\\"" << ${resultVar}[__i] << "\\"";`
            : `cout << ${resultVar}[__i];`
        }
        if (__i + 1 < ${resultVar}.size()) cout << ",";
    }
    cout << "]";
    `;
  }

  return `cout << ${resultVar};`;
}

export function pythonLiteral(value) {
  // JSON syntax matches Python literal syntax for these types,
  // except true/false/null need capitalizing for Python.
  const json = JSON.stringify(value);

  return json
    .replace(/\btrue\b/g, "True")
    .replace(/\bfalse\b/g, "False")
    .replace(/\bnull\b/g, "None");
}

export function pythonPrintStatement(type, resultVar) {
  if (type === "boolean") {
    return `print(str(${resultVar}).lower())`;
  }

  if (type && type.includes("[]")) {
    // Compact JSON-style formatting: [1,2,3] not Python's default [1, 2, 3]
    return `import json as __json\nprint(__json.dumps(${resultVar}, separators=(",", ":")))`;
  }

  return `print(${resultVar})`;
}