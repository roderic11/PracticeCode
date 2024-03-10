const asyncHandler = require('express-async-handler');
const ManpowerInfo = require('../models/manpowerInfoModel');

// @desc    Get all ManpowerInfo
// @route   GET /api/manpowerInfo
// @access  Public
const getManpowerInfo = asyncHandler(async (req, res) => {
  const manpowerInfo = await ManpowerInfo.find();
  res.json(manpowerInfo);
});

// @desc    Get single ManpowerInfo
// @route   GET /api/manpowerInfo/:id
// @access  Public
const getManpowerInfoById = asyncHandler(async (req, res) => {
  const manpowerInfo = await ManpowerInfo.findById(req.params.id);

  if (manpowerInfo) {
    res.json(manpowerInfo);
  } else {
    res.status(404);
    throw new Error('ManpowerInfo not found');
  }
});

// @desc    Create a ManpowerInfo
// @route   POST /api/manpowerInfo
// @access  Private
const createManpowerInfo = asyncHandler(async (req, res) => {
  const { name, arbitraryNumber } = req.body;

  const manpowerInfo = await ManpowerInfo.create({ name, arbitraryNumber });

  if (manpowerInfo) {
    res.status(201).json(manpowerInfo);
  } else {
    res.status(400);
    throw new Error('Invalid ManpowerInfo data');
  }
});

// @desc    Update a ManpowerInfo
// @route   PUT /api/manpowerInfo/:id
// @access  Private
const updateManpowerInfo = asyncHandler(async (req, res) => {
  const { name, arbitraryNumber } = req.body;

  const manpowerInfo = await ManpowerInfo.findById(req.params.id);

  if (manpowerInfo) {
    manpowerInfo.name = name;
    manpowerInfo.arbitraryNumber = arbitraryNumber;

    const updatedManpowerInfo = await manpowerInfo.save();
    res.json(updatedManpowerInfo);
  } else {
    res.status(404);
    throw new Error('ManpowerInfo not found');
  }
});

// @desc    Delete a ManpowerInfo
// @route   DELETE /api/manpowerInfo/:id
// @access  Private
const deleteManpowerInfo = asyncHandler(async (req, res) => {
  const manpowerInfo = await ManpowerInfo.findById(req.params.id);

  if (manpowerInfo) {
    await manpowerInfo.remove();
    res.json({ message: 'ManpowerInfo removed' });
  } else {
    res.status(404);
    throw new Error('ManpowerInfo not found');
  }
});

module.exports = {
  getManpowerInfo,
  getManpowerInfoById,
  createManpowerInfo,
  updateManpowerInfo,
  deleteManpowerInfo,
};
