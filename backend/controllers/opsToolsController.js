const asyncHandler = require('express-async-handler');
const OpsTools = require('../models/opsToolsModel');

// Get all OpsTools
const getAllOpsTools = asyncHandler(async (req, res) => {
  const opstools = await OpsTools.find();
  res.json(opstools);
});

// Get a single OpsTools by ID
const getOpsToolsById = asyncHandler(async (req, res) => {
  const opstools = await OpsTools.findById(req.params.id);
  if (opstools) {
    res.json(opstools);
  } else {
    res.status(404).json({ message: 'OpsTools not found' });
  }
});

// Create a new OpsTools
const createOpsTools = asyncHandler(async (req, res) => {
  const opstools = await OpsTools.create(req.body);
  res.status(201).json(opstools);
});

// Update an existing OpsTools
const updateOpsTools = asyncHandler(async (req, res) => {
  const opstools = await OpsTools.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (opstools) {
    res.json(opstools);
  } else {
    res.status(404).json({ message: 'OpsTools not found' });
  }
});

// Delete an OpsTools
const deleteOpsTools = asyncHandler(async (req, res) => {
  const opstools = await OpsTools.findByIdAndDelete(req.params.id);
  if (opstools) {
    res.json({ message: 'OpsTools deleted' });
  } else {
    res.status(404).json({ message: 'OpsTools not found' });
  }
});

module.exports = {
    getAllOpsTools,
    getOpsToolsById,
    createOpsTools,
    updateOpsTools,
    deleteOpsTools
  };
  