const asyncHandler = require("express-async-handler");
const Mrf = require("../models/mrfModel");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private

const getAllMrf = asyncHandler(async (req, res) => {
  const { mrfName, quantity } = req.query;

  try {
    let query = {};

    // Apply the MRF name filter if provided
    if (mrfName) {
      query.name = mrfName;
    }

    // Fetch the MRF data from the database
    const mrfData = await Mrf.find(query).lean().exec();

    // Apply the quantity filter if provided
    let filteredMrfData = mrfData;
    if (quantity) {
      filteredMrfData = filteredMrfData.filter((mrf) => {
        const filteredItems = mrf.items.filter(
          (item) => item.quantity === quantity
        );
        return filteredItems.length > 0;
      });
    }

    res.status(200).json(filteredMrfData);
  } catch (error) {
    console.error("Error fetching MRF data:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
const getIdProjectMrf = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const project = await Mrf.findById(id);

  if (!project) {
    return res.status(404).json({ message: "Mrf not found" });
  }

  res.json(project.items); // Return only the 'items' array of the project
});

const createNewMrf = asyncHandler(async (req, res) => {
  const { tableData, formData } = req.body;

  // Extract the relevant data from the request body
  const { name, location, dateNeeded, dateRequested,mrfName } = formData;

  const items = tableData.map((item) => ({
    product: item.product,
    quantity: item.quantity,
    unit: item.unit,
    stockRequest: item.stockRequest,
    subCategory: item.subCategory,
    proccuredQuantity: item.proccuredQuantity,
    Scope: item.category,
  }));

  try {
    // Validate the items before saving the MRF

    // Create and store the new project
    const newMrf = await Mrf.create({
      projectId: uuidv4(),
      name,
      mrfName,
      location,
      dateNeeded,
      dateRequested,
      items,
    });

    if (newMrf) {
      return res
        .status(201)
        .json({ message: "New project created", project: newMrf });
    } else {
      return res.status(400).json({ message: "Failed to create project" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

//---------------------------------

// bomController.js
const updateItemQuantity = asyncHandler(async (req, res) => {
  const { projectId, itemId } = req.params;
  const { quantity } = req.body;

  try {
    const project = await Mrf.findById(projectId).exec();

    if (!project) {
      return res.status(404).json({ message: "Mrf not found" });
    }

    const itemToUpdate = project.items.find(
      (item) => item._id.toString() === itemId
    );

    if (!itemToUpdate) {
      return res.status(404).json({ message: "Item not found in BOM" });
    }

    // Update the item quantity
    itemToUpdate.quantity = quantity;

    const updatedProject = await project.save();

    res.json({
      message: "Item quantity updated",
      item: itemToUpdate,
      project: updatedProject,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

//------------------------
// @route   PATCH /api/projects/:id
// @access  Private
const updateProjectMrf = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    product,
    quantity,
    unit,
    stockRequest,
    subCategory,
    Scope,
    proccuredQuantity, // Include the 'procurredQuantity' field in the request body
  } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const project = await Mrf.findById(id).exec();

    if (!project) {
      return res.status(404).json({ message: "Mrf not found" });
    }

    const newItem = {
      product,
      unit,
      quantity,
      stockRequest,
      subCategory,
      proccuredQuantity, // Include the 'procurredQuantity' field in the newItem object
      Scope,
    };

    project.items.push(newItem);
    const updatedProject = await project.save();

    res.json({ message: "Item added to BOM", project: updatedProject });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteMrf = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "Mrf ID required" });
  }

  const project = await Mrf.findById(id).exec();

  if (!project) {
    return res.status(400).json({ message: "Mrf not found" });
  }

  await project.deleteOne();

  res.json({ message: "Mrf deleted" });
});
// Import necessary dependencies and models
// elementsController.js

// POST route to add a new product to an existing project

const getObjAddMrf = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { projectId, product, quantity, unit } = req.body;

  // Confirm data
  if (!product || !quantity || !unit) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const project = await Mrf.findById(id).exec();

  if (!project) {
    return res.status(400).json({ message: "Mrf not found" });
  }

  // Add the new product to the project
  const newProduct = {
    product: product,
    quantity: quantity,
    unit: unit,
  };

  project.products.push(newProduct);

  const updatedProject = await project.save();

  res.json({ message: "Product added to project", project: updatedProject });
});

module.exports = {
  getAllMrf,
  createNewMrf,
  updateProjectMrf,
  deleteMrf,
  getObjAddMrf,
  getIdProjectMrf,
  updateItemQuantity,
};
