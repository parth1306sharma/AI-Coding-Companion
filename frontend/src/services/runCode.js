import axios from "axios";

const API = "http://localhost:8000/api/v1/execute";

export const runCode = async (language, code, input = "") => {
  const { data } = await axios.post(API, {
    language,
    code,
    input,
  });

  console.log(data);

  return data;
};

// For LeetCode problems: the editor only has a bare `class Solution`,
// so the backend needs the function signature metadata (meta) plus
// the raw test-case text (e.g. "n = 31") to build a runnable program.
export const runLeetCodeCode = async (language, code, meta, input = "") => {
  const { data } = await axios.post(`${API}/leetcode`, {
    language,
    code,
    meta,
    input,
  });

  console.log(data);

  return data;
};