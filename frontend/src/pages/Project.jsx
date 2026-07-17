import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProject } from "../services/project";

function Project() {
  const { id } = useParams();

  const [project, setProject] = useState(null);

  useEffect(() => {
    loadProject();
  }, []);

  const loadProject = async () => {
    try {
      const response = await getProject(id);
      setProject(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  if (!project) return <h2>Loading...</h2>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>{project.title}</h1>

      <p>{project.description}</p>

      <hr />

      <h2>Workspace Coming Soon...</h2>
    </div>
  );
}

export default Project;