import { Project } from "../models/Project.model.js";

// ================= CREATE PROJECT =================
const createProject = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    const project = await Project.create({
      title,
      description,
      owner: "6a42d8d535cfff4e9eefa035"
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ================= GET ALL PROJECTS =================

const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find();

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

export {
  createProject,
  getAllProjects,
};