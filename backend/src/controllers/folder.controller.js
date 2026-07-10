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

export {
  createFolder,
};