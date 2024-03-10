const asyncHandler = require("express-async-handler");
const MaterialRequest = require('../models/materialRequestOpsModel');


// @desc    Get all material requests
// @route   GET /api/material-requests
// @access  Public
const getAllMaterialRequests = asyncHandler(async (req, res) => {
  const materialRequests = await MaterialRequest.find();
  res.json(materialRequests);
});

// @desc    Get a material request by ID
// @route   GET /api/material-requests/:id
// @access  Public
const getMaterialRequestById = asyncHandler(async (req, res) => {
  const materialRequestId = req.params.id;
  const materialRequest = await MaterialRequest.findById(materialRequestId);
  if (!materialRequest) {
    res.status(404).json({ message: 'Material Request not found' });
  } else {
    res.json(materialRequest);
  }
});

// @desc    Create a new material request
// @route   POST /api/material-requests
// @access  Public
const createMaterialRequest = asyncHandler(async (req, res) => {
  const { projectId,  name, location, tableData } = req.body;
  const newMaterialRequest = new MaterialRequest({
    projectId,
 
    name,
    location,
    tableData
  });
  const createdMaterialRequest = await newMaterialRequest.save();
  res.status(201).json(createdMaterialRequest);
});

// @desc    Update a material request
// @route   PUT /api/material-requests/:id
// @access  Public
const updateMaterialRequest = asyncHandler(async (req, res) => {
  const materialRequestId = req.params.id;
  const { projectId,  name, location, tableData } = req.body;

  const materialRequest = await MaterialRequest.findById(materialRequestId);
  if (!materialRequest) {
    res.status(404).json({ message: 'Material Request not found' });
  } else {
    materialRequest.projectId = projectId;

    materialRequest.name = name;
    materialRequest.location = location;
    materialRequest.tableData = tableData;

    const updatedMaterialRequest = await materialRequest.save();
    res.json(updatedMaterialRequest);
  }
});

const updateMaterialRequestTableData = asyncHandler(async (req, res) => {
  try {
    const { id, mrfName } = req.params;

    // Fetch the material request by ID and ensure that tableData is populated
    const materialRequest = await MaterialRequest.findById(id).populate('tableData');
    console.log("ID:", id);
    console.log("MRF Name:", mrfName);
    console.log("Material Request:", materialRequest);
    if (!materialRequest) {
      return res.status(404).json({ success: false, message: 'Material Request not found' });
    }

    // Find the matching MRF item inside the tableData array
    const threshold = 0.9;
    const stringSimilarity = require('string-similarity');
    const matchingMrfItem = materialRequest.tableData.find((data) => {
      const mrfNameLowerCase = mrfName.trim().toLowerCase();
      const similarity = data.mrfName?.trim().toLowerCase();
    console.log("mrfName:", similarity);
    console.log("mrfName:", mrfNameLowerCase);
      return similarity && stringSimilarity.compareTwoStrings(similarity, mrfNameLowerCase) >= threshold;
    });
   

    if (!matchingMrfItem) {
      console.log("No matching item found for the specified MRF name inside the Material Request");
      return res.json({ success: true, message: 'No updates were made to remarks' });
    }

    // Update the remarks to 'processed' for the matching mrfName item
    matchingMrfItem.remarks = 'processed';

    // Save the updated material request
    const updatedMaterialRequest = await materialRequest.save();

    // Respond with success message and the updated materialRequest
    res.json({ success: true, message: 'Remarks updated successfully', updatedMaterialRequest });
  } catch (error) {
    // Handle errors
    console.error('Error updating remarks:', error);
    res.status(500).json({ success: false, error: 'Failed to update remarks' });
  }
});



// @desc    Delete a material request
// @route   DELETE /api/material-requests/:id
// @access  Public
const deleteMaterialRequest = asyncHandler(async (req, res) => {
  const materialRequestId = req.params.id;
  const materialRequest = await MaterialRequest.findById(materialRequestId);
  if (!materialRequest) {
    res.status(404).json({ message: 'Material Request not found' });
  } else {
    await materialRequest.remove();
    res.json({ message: 'Material Request removed' });
  }
});

module.exports = {
  getAllMaterialRequests,
  getMaterialRequestById,
  createMaterialRequest,
  updateMaterialRequest,
  deleteMaterialRequest,
  updateMaterialRequestTableData,
};
