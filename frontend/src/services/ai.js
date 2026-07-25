import api from "./api";

export const chatWithAI = async (code, prompt, problem) => {
  const response = await api.post("/ai/chat", {
    code,
    prompt,
    problem,
  });

  return response.data;
};