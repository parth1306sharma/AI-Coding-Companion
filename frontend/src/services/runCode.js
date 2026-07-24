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