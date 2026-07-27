import axios from "axios";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"}/problem`;

export const importProblem = async (url) => {
  const { data } = await axios.post(`${API}/import`, {
    url,
  });

  return data.problem;
};

export const analyzeProblem = async (problem) => {
  const { data } = await axios.post(`${API}/analyze`, {
    problem,
  });

  return data.analysis;
};