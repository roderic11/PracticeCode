const asyncHandler = require('express-async-handler');
const ManpowerCost = require('../models/manpowerCostModel');

// @desc    Get all manpower costs
// @route   GET /manpowercosts
// @access  Public
const getManpowerCost = asyncHandler(async (req, res) => {
  const manpowerCost = await ManpowerCost.find();
  res.json(manpowerCost);
});

// @desc    Get single manpower cost
// @route   GET /manpowercosts/:id
// @access  Public
const getManpowerCostById = asyncHandler(async (req, res) => {
  const manpowerCost = await ManpowerCost.findById(req.params.id);
  if (manpowerCost) {
    res.json(manpowerCost);
  } else {
    res.status(404);
    throw new Error('Manpower cost not found');
  }
});

// @desc    Create a Manpower Cost
// @route   POST /manpowerCosts
// @access  Public
const createManpowerCost = asyncHandler(async (req, res) => {
  const {
    projectId,
    siteName,
    projectName,
    costingTable,
    monitoringManCostTable,
  } = req.body;

  const manpowerCost = await ManpowerCost.create({
    projectId,
    siteName,
    projectName,
    costingTable,
    monitoringManCostTable,
  });

  res.status(201).json(manpowerCost);
});

// @desc    Update a Manpower Cost
// @route   PUT /manpowerCosts/:id
// @access  Public
const updateManpowerCost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    siteName,
    projectName,
    costingTable,
    monitoringManCostTable,
  } = req.body;

  const manpowerCost = await ManpowerCost.findById(id);
  if (manpowerCost) {
    manpowerCost.siteName = siteName || manpowerCost.siteName;
    manpowerCost.projectName = projectName || manpowerCost.projectName;
    manpowerCost.costingTable = costingTable || manpowerCost.costingTable;
    manpowerCost.monitoringManCostTable = monitoringManCostTable || manpowerCost.monitoringManCostTable;

    const updatedManpowerCost = await manpowerCost.save();
    res.json(updatedManpowerCost);
  } else {
    res.status(404);
    throw new Error('Manpower Cost not found');
  }
});

// @desc    Delete a manpower cost
// @route   DELETE /manpowercosts/:id
// @access  Public
const deleteManpowerCost = asyncHandler(async (req, res) => {
  const manpowerCost = await ManpowerCost.findById(req.params.id);

  if (manpowerCost) {
    await manpowerCost.remove();
    res.json({ message: 'Manpower cost removed' });
  } else {
    res.status(404);
    throw new Error('Manpower cost not found');
  }
});

module.exports = {
  getManpowerCost,
  getManpowerCostById,
  createManpowerCost,
  updateManpowerCost,
  deleteManpowerCost,
};
