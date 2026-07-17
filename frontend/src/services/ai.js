import api from "./api";

export const chatWithAI = async (code, prompt) => {
  const response = await api.post("/ai/chat", {
    code,
    prompt,
  });

  return response.data;
};