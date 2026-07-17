import { Link } from "react-router-dom";

function ProjectCard({ project }) {
  return (
    <Link
      to={`/project/${project._id}`}
      style={{
        textDecoration: "none",
        color: "white",
      }}
    >
      <div
        style={{
          border: "1px solid #444",
          borderRadius: "10px",
          padding: "20px",
          marginBottom: "20px",
          background: "#2d2d2d",
        }}
      >
        <h2>{project.title}</h2>
        <p>{project.description}</p>
      </div>
    </Link>
  );
}

export default ProjectCard;