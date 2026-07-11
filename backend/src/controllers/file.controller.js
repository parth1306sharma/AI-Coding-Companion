import { File } from "../models/File.model.js";

// ================= CREATE FILE =================

const createFile = async (req, res) => {
  try {

    const {
      name,
      language,
      project,
      folder,
      content,
    } = req.body;

    if (!name || !project) {
      return res.status(400).json({
        success: false,
        message: "Name and Project are required",
      });
    }

    const file = await File.create({
      name,
      language,
      project,
      folder: folder || null,
      content: content || "",
    });

    res.status(201).json({
      success: true,
      message: "File created successfully",
      data: file,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
const getFileById = async (req, res) => {
  try {

    const { id } = req.params;

    const file = await File.findById(id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    res.status(200).json({
      success: true,
      data: file,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
const updateFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const file = await File.findByIdAndUpdate(
      id,
      { content },
      { new: true }
    );

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "File updated successfully",
      data: file,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await File.findByIdAndDelete(id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "File deleted successfully",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
export {
  createFile,
  getFileById,
  updateFile,
  deleteFile,
};