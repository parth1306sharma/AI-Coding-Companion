import { Link } from "react-router-dom";

function ProjectCard({ project }) {
  return (
    <Link
      to={`/workspace/${project._id}`}
      className="block no-underline text-white"
    >
      <div className="border border-gray-700 rounded-xl p-5 mb-5 bg-gray-800 hover:bg-gray-700 transition-colors">
        <h2 className="text-lg font-semibold mb-1">{project.title}</h2>
        <p className="text-gray-400 text-sm">{project.description}</p>
      </div>
    </Link>
  );
}

export default ProjectCard;