import { Folder } from "../models/Folder.model.js";

// ================= CREATE FOLDER =================

const createFolder = async (req, res) => {
  try {
    const { name, project, parentFolder } = req.body;

    if (!name || !project) {
      return res.status(400).json({
        success: false,
        message: "Name and Project are required",
      });
    }

    const folder = await Folder.create({
      name,
      project,
      parentFolder: parentFolder || null,
    });

    res.status(201).json({
      success: true,
      message: "Folder created successfully",
      data: folder,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
const getProjectTree = async (req, res) => {
  try {
    const { projectId } = req.params;

    const folders = await Folder.find({ project: projectId });
    const files = await File.find({ project: projectId });

    res.status(200).json({
      success: true,
      folders,
      files,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export {
    createFolder,
    getProjectTree,
};