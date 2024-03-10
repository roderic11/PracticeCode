const asyncHandler = require("express-async-handler");
const Project = require("../models/BOM");

const mongoose = require("mongoose");

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private

const getAllProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find().lean();
  res.status(200).json(projects);
});

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
const getIDProjects = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const project = await Project.findById(id);

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  res.json(project.items); // Return only the 'items' array of the project
});

const getProjectContents = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const project = await Project.findById(id);

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  res.json(project); // Return only the 'items' array of the project
});

const createNewProject = asyncHandler(async (req, res) => {
  const {
    name,
    location,
    subject,
    product,
    quantity,
    unit,
    category,
    subCategory,
    projectId,
    remarks,
    cost,
    visibility,
    comment,
  } = req.body;

  // Confirm data
  if (!name || !location || !subject) {
    return res
      .status(400)
      .json({ message: "Name, location, and subject are required fields" });
  }

  try {
    // Create and store the new project
    const newProject = await Project.create({
      projectId,
      name,
      cost,
      location,
      subject,
      product,
      remarks,
      quantity,
      comment,
      category,
      subCategory,
      unit,
      visibility,
      fixedQuantity: quantity,
    });

    if (newProject) {
      return res
        .status(201)
        .json({ message: "New project created", project: newProject });
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
const updateItemQuantity = async (req, res) => {
  const { id, itemId } = req.params; // Extract the project ID and item ID from the request parameters
  const { quantity } = req.body; // Extract the updated quantity from the request body

  try {
    // Find the project by ID
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Find the item by ID within the project's items array
    const item = project.items.find((item) => item._id.toString() === itemId);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Update the item quantity
    item.quantity = quantity;

    // Save the updated project
    await project.save();

    // Return the updated project or specific item if needed
    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateRemarks = async (req, res) => {
  const { id } = req.params; // Extract the project ID and item ID from the request parameters
  const { remarks } = req.body; // Extract the updated quantity from the request body

  try {
    // Find the project by ID
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Update the item quantity
    project.remarks = remarks;

    // Save the updated project
    await project.save();

    // Return the updated project or specific item if needed
    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//------------------------
// @route   PATCH /api/projects/:id
// @access  Private
const updateProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    product,
    quantity,
    unit,
    category,
    subCategory,
    cost,
    comment,
    visibility,
  } = req.body;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const project = await Project.findById(id).exec();

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const newItem = {
      product,
      cost,
      unit,
      quantity,
      category,
      fixedQuantity: quantity,
      comment,
      visibility,
      subCategory,
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
const deleteItem = async (req, res) => {
  const { projectId, itemId } = req.params;

  try {
    // Find the project by projectId
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Find the index of the item to be deleted
    const itemIndex = project.items.findIndex(
      (item) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Remove the item from the items array
    project.items.splice(itemIndex, 1);

    // Save the updated project
    await project.save();

    res.json({ message: "Item deleted from BOM" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting item" });
  }
};

const editItem = async (req, res) => {
  const { projectId, itemId } = req.params;
  const { quantity, cost, comment, personnel, visibility } = req.body;

  // Get the current date and time
  const timestamp = new Date();

  console.log(`Edit item request received at ${timestamp}`);

  try {
    const project = await Project.findById(projectId).exec();

    if (!project) {
      console.log("Project not found");
      return res.status(404).json({ message: "Project not found" });
    }

    const itemToUpdate = project.items.find(
      (item) => item._id.toString() === itemId
    );

    if (!itemToUpdate) {
      console.log("Item not found in BOM");
      return res.status(404).json({ message: "Item not found in BOM" });
    }

    // Store the original fixedQuantity and cost for the comment
    const originalFixedQuantity = itemToUpdate.fixedQuantity;
    const originalCost = itemToUpdate.cost;

    itemToUpdate.fixedQuantity =
      parseInt(itemToUpdate.fixedQuantity || 0) + parseInt(quantity);
    itemToUpdate.quantity =
      parseInt(itemToUpdate.quantity || 0) + parseInt(quantity);
    itemToUpdate.cost = cost;
    itemToUpdate.visibility = visibility;

    // Create a new comment object
    const newComment = {
      Date: timestamp.toLocaleDateString(),
      Time: timestamp.toLocaleTimeString(),
      TextField: comment,
      personnel: personnel,
    };

    // Add the new comment to the item's comments array
    itemToUpdate.comment.push(newComment);

    const updatedProject = await project.save();

    const updatedItem = updatedProject.items.find(
      (item) => item._id.toString() === itemId
    );

    console.log(`Item updated successfully at ${timestamp}`);

    res.json({
      message: "Item updated",
      item: updatedItem,
      project: updatedProject,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

//edit for the function of the BOM table: #modified 1
const editProject = async (req, res) => {
  const { editId } = req.params;
  const { name, location, subject } = req.body;

  // Get the current date and time
  const timestamp = new Date();

  console.log(`Edit item request received at ${timestamp}`);

  try {
    const project = await Project.findById(editId).exec();

    if (!project) {
      console.log("Project not found");
      return res.status(404).json({ message: "Project not found" });
    }

    // Update the project's name, location, and subject
    project.name = name;
    project.location = location;
    project.subject = subject;

    // Save the updated project
    const updatedProject = await project.save();

    console.log(`Project updated successfully at ${timestamp}`);

    res.json({
      message: "Project updated",
      project: updatedProject,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
//modified #2:
const deleteProject = async (req, res) => {
  const { editId } = req.params;

  try {
    // Find the project by projectId
    const project = await Project.findById(editId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Delete the project
    await project.remove(); // This deletes the project from the database

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting project" });
  }
};

// POST route to add a new product to an existing project

const getObjectAdd = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { projectId, product, quantity, unit, comment } = req.body;

  // Confirm data
  if (!product || !quantity || !unit) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const project = await Project.findById(id).exec();

  if (!project) {
    return res.status(400).json({ message: "Project not found" });
  }

  // Add the new product to the project
  const newProduct = {
    product: product,
    quantity: quantity,
    fixedQuantity: quantity,
    unit: unit,
    comment: comment,
  };

  project.products.push(newProduct);

  const updatedProject = await project.save();

  res.json({ message: "Product added to project", project: updatedProject });
});

async function getItemById(req, res) {
  const itemId = req.params.itemId; // Assuming the item ID is part of the URL params
  try {
    const item = await Item.findById(itemId); // Assuming you have an 'findById' method in your model to fetch a specific item by ID
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json(item); // Respond with the item in JSON format
  } catch (error) {
    console.error("Error getting item by ID:", error);
    res.status(500).json({ error: "Server Error" });
  }
}

module.exports = {
  getAllProjects,
  getItemById,
  createNewProject,
  updateProject,
  deleteItem,
  deleteProject,
  editItem,
  editProject,
  getObjectAdd,
  getIDProjects,
  updateItemQuantity,
  updateRemarks,
  getProjectContents,
};
