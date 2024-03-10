const asyncHandler = require("express-async-handler");
const Storage = require("../models/storageModel");

// Controller actions
const getAllItems = asyncHandler(async (req, res) => {
  const items = await Storage.find();
  res.json(items);
});

const createItem = asyncHandler(async (req, res) => {
  try {
    const { siteName, projectName, projectId, siteTable } = req.body;
    const newItem = new Storage({
      siteName,
      projectName,
      projectId,
      siteTable,
    });
    const createdItem = await newItem.save();
    res.status(201).json(createdItem);
  } catch (error) {
    res.status(500).json({ message: "Error creating item" });
  }
});

//newCode:
const editProject = async (req, res) => {
  const { id } = req.params;
  const { projectName, siteName } = req.body;

  try {
    // Find the project by ID
    const project = await Storage.findById(id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Update the project's properties
    project.projectName = projectName; // Use the provided name or keep the existing one
    project.siteName = siteName; // Use the provided subject or keep the existing one

    // Save the updated project
    const updatedProject = await Storage.save();

    return res.json(updatedProject);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getItemById = asyncHandler(async (req, res) => {
  const item = await Storage.findById(req.params.id);
  if (item) {
    res.json(item);
  } else {
    res.status(404).json({ message: "Item not found" });
  }
});

const updateItem = asyncHandler(async (req, res) => {
  const storageId = req.params.id;
  const { projectName, siteName, siteTable } = req.body;
  try {
    const storage = await Storage.findById(storageId);
    if (!storage) {
      return res.status(404).json({ error: "Storage not found" });
    }

    // Update the storage properties with the provided values
    storage.projectName = projectName;
    storage.siteName = siteName;
    storage.siteTable = siteTable;

    const updatedStorage = await storage.save();
    res.json(updatedStorage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update storage status" });
  }
});

const deleteProduct = async (req, res) => {
  const { projectId, itemId } = req.params;

  try {
    // Find the project by projectId
    const project = await Storage.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Find the index of the item to be deleted
    const itemIndex = project.siteTable.findIndex(
      (item) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Remove the item from the items array
    project.siteTable.splice(itemIndex, 1);

    // Save the updated project
    await Storage.save();

    res.json({ message: "Item deleted from BOM" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting item" });
  }
};

const deleteItem = asyncHandler(async (req, res) => {
  const item = await Storage.findById(req.params.id);
  if (item) {
    await item.remove();
    res.json({ message: "Item removed" });
  } else {
    res.status(404).json({ message: "Item not found" });
  }
});

const updateItemQuantity = asyncHandler(async (req, res) => {
  try {
    const storageId = req.params.id;
    const updatedFields = req.body;

    // Find the storage item by ID and update the fields
    const updatedStorage = await Storage.findByIdAndUpdate(
      storageId,
      updatedFields,
      { new: true }
    );

    if (!updatedStorage) {
      return res.status(404).json({ error: "Storage item not found" });
    }

    return res.status(200).json(updatedStorage);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

//#modified#2 new:editItem in consumables
const editItem = async (req, res) => {
  const { projectId, itemId } = req.params;
  const { quantity, cost, comment, personnel } = req.body;

  // Get the current date and time
  const timestamp = new Date();

  console.log(`Edit item request received at ${timestamp}`);

  try {
    const item = await Storage.findById(projectId).exec();

    if (!item) {
      console.log("Project not found");
      return res.status(404).json({ message: "Project not found" });
    }

    const itemToUpdate = item.siteTable.find(
      (item) => item._id.toString() === itemId
    );

    if (!itemToUpdate) {
      console.log("Item not found in BOM");
      return res.status(404).json({ message: "Item not found in BOM" });
    }

    // Store the original fixedQuantity and cost for the comment
    const originalFixedQuantity = itemToUpdate.quantity;
    const originalCost = itemToUpdate.unitCost;

    itemToUpdate.quantity =
      parseInt(itemToUpdate.quantity || 0) + parseInt(quantity);
    itemToUpdate.unitCost = cost;
    itemToUpdate.materialCost = parseFloat(quantity) * parseFloat(cost);

    // Create a new comment object
    const newComment = {
      Date: timestamp.toLocaleDateString(),
      Time: timestamp.toLocaleTimeString(),
      TextField: comment,
      personnel: personnel,
    };

    // Add the new comment to the item's comments array
    itemToUpdate.comment.push(newComment);

    // Save the updated item
    await item.save(); // Use the save method on the item instance

    console.log(`Item updated successfully at ${timestamp}`);

    res.json({
      message: "Item updated",
      item: itemToUpdate, // Return the updated item
      project: item, // Return the updated project
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Assuming you're using Express.js
const getSiteById = async (req, res) => {
  try {
    const siteId = req.params.siteId; // Retrieve the siteId from the request parameters

    // Use the siteId to fetch the site data from the database
    const siteData = await Site.findById(siteId);

    if (!siteData) {
      return res.status(404).json({ error: "Site not found" });
    }

    // Return only the specific data you need from the siteData
    const filteredData = {
      id: siteData.id,
      name: siteData.name,
      // Add other properties as needed
    };

    // Return the filtered site data in the response
    res.json(filteredData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch site data" });
  }
};

module.exports = {
  getAllItems,
  editProject,
  createItem,
  getItemById,
  updateItem,
  editItem,
  deleteProduct,
  deleteItem,
  updateItemQuantity,
  getSiteById,
};
