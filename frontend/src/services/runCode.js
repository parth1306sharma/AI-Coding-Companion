export const runCode = async (language, code, input = "") => {
  const response = await fetch("https://emkc.org/api/v2/piston/execute", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      language,
      version: "*",
      stdin: input,
      files: [
        {
          content: code,
        },
      ],
    }),
  });

  const data = await response.json();

  console.log(data);

  return data;
};