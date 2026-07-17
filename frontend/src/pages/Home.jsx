import { useEffect, useState } from "react";
import { getProjects } from "../services/project";
import ProjectCard from "../components/ProjectCard";

function Home() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await getProjects();
      setProjects(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>My Projects</h1>

      {projects.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        projects.map((project) => (
          <ProjectCard
            key={project._id}
            project={project}
          />
        ))
      )}
    </div>
  );
}

export default Home;