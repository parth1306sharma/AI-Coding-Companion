import api from "./api";

export const getProjects = async () => {
  const response = await api.get("/projects");
  return response.data;
};

export const getProject = async (id) => {
  const response = await api.get(`/projects/${id}`);
  return response.data;
};