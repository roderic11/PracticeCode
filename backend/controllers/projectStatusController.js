const asyncHandler = require("express-async-handler");
const ProjectStatus = require("../models/ProjectStatusModel");

// @desc    Get all project statuses
// @route   GET /api/projectStatus
// @access  Public
const getAllProjectStatuses = asyncHandler(async (req, res) => {
  const projectStatuses = await ProjectStatus.find();
  res.json(projectStatuses);
});

// @desc    Get project status by ID
// @route   GET /api/projectStatus/:id
// @access  Public
const getProjectStatusById = asyncHandler(async (req, res) => {
  const projectStatus = await ProjectStatus.findById(req.params.id);
  if (projectStatus) {
    res.json(projectStatus);
  } else {
    res.status(404);
    throw new Error("Project status not found");
  }
});

// @desc    Create a new project status
// @route   POST /api/projectStatus
// @access  Public
const createProjectStatus = asyncHandler(async (req, res) => {
  const { projectId, projectName, siteName, statusTable } = req.body;
  const projectStatus = await ProjectStatus.create({
    projectId,
    projectName,
    siteName,
    statusTable,
  });
  res.status(201).json(projectStatus);
});

// @desc    Update project status by ID
// @route   PUT /api/projectStatus/:id
// @access  Public
const updateProjectStatus = asyncHandler(async (req, res) => {
  const { projectId, projectName, siteName, statusTable } = req.body;
  const projectStatus = await ProjectStatus.findById(req.params.id);
  if (projectStatus) {
    projectStatus.projectId = projectId;
    projectStatus.projectName = projectName;
    projectStatus.siteName = siteName;
    projectStatus.statusTable = statusTable;

    const updatedProjectStatus = await projectStatus.save();
    res.json(updatedProjectStatus);
  } else {
    res.status(404);
    throw new Error("Project status not found");
  }
});

// @desc    Delete project status by ID
// @route   DELETE /api/projectStatus/:id
// @access  Public
const deleteProjectStatus = asyncHandler(async (req, res) => {
  const projectStatus = await ProjectStatus.findById(req.params.id);
  if (projectStatus) {
    await projectStatus.remove();
    res.json({ message: "Project status removed" });
  } else {
    res.status(404);
    throw new Error("Project status not found");
  }
});

module.exports = {
  getAllProjectStatuses,
  getProjectStatusById,
  createProjectStatus,
  updateProjectStatus,
  deleteProjectStatus,
};