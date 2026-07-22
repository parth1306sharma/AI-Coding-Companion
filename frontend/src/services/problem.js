import axios from "axios";

const API = "http://localhost:8000/api/v1/problem";

export const importProblem = async (url) => {
  const { data } = await axios.post(`${API}/import`, {
    url,
  });

  return data.problem;
};