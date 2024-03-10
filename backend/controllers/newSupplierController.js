const Supply = require("../models/newSupplierModel");

// Controller for creating a new supply
const createSupply = async (req, res) => {
  try {
    const { supplier, items } = req.body;

    const newSupply = new Supply({
      supplier,
      items,
    });

    const savedSupply = await newSupply.save();
    res.status(201).json(savedSupply);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create supply" });
  }
};

const fromInventory = async (req, res) => {
  try {
    const { supplierName, items } = req.body;

    // Find the supplier that has a matching name with the location
    const supplier = await Supply.findOne({
      supplier: { $regex: new RegExp(supplierName, "i") },
    });

    if (!supplier) {
      return res
        .status(404)
        .json({ error: "Supplier not found for the location" });
    }

    // Push the items to the items array of the matching supplier
    items.ItemName.forEach((itemName, index) => {
      supplier.items.push({
        ItemName: itemName,
        unit: items.unit[index],
        unitCost: items.unitCost[index],
      });
    });

    // Save the updated supplier
    const updatedSupplier = await supplier.save();

    res.status(201).json(updatedSupplier);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add items to supplier" });
  }
};

const editSupply = async (req, res) => {
  const { supplierId, itemId } = req.params;
  const { ItemName, unit, unitCost } = req.body;

  console.log("Edit item request received");

  try {
    const project = await Supply.findById(supplierId).exec();

    if (!project) {
      console.log("item not found");
      return res.status(404).json({ message: "item not found" });
    }

    const itemToUpdate = project.items.find(
      (item) => item._id.toString() === itemId
    );

    if (!itemToUpdate) {
      console.log("Item not found in supplier");
      return res.status(404).json({ message: "Item not found in BOM" });
    }

    itemToUpdate.ItemName = ItemName;
    itemToUpdate.unit = unit;
    itemToUpdate.unitCost = unitCost;

    const updatedProject = await project.save();

    const updatedItem = updatedProject.items.find(
      (item) => item._id.toString() === itemId
    );

    console.log("Item updated successfully");

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

// Controller for fetching all supplies
const getAllSupplies = async (req, res) => {
  try {
    const supplies = await Supply.find();
    res.status(200).json(supplies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch supplies" });
  }
};

// Controller for fetching a single supply by ID
const getSupplyById = async (req, res) => {
  try {
    const { id } = req.params;

    const supply = await Supply.findById(id);
    if (!supply) {
      return res.status(404).json({ error: "Supply not found" });
    }

    res.status(200).json(supply);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch supply" });
  }
};

// Controller for updating a supply by ID
const updateSupplyById = async (req, res) => {
  try {
    const { id } = req.params;
    const { supplier, items } = req.body;

    const supply = await Supply.findByIdAndUpdate(
      id,
      { supplier, items },
      { new: true }
    );
    if (!supply) {
      return res.status(404).json({ error: "Supply not found" });
    }

    res.status(200).json(supply);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update supply" });
  }
};

// Controller for deleting a supply by ID
const deleteSupplyById = async (req, res) => {
  const { supplierId, itemId } = req.params;

  try {
    // Find the project by supplierId
    const project = await Supply.findById(supplierId);

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

    res.json({ message: "Item deleted from supplierDB" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting item" });
  }
};

module.exports = {
  createSupply,
  getAllSupplies,
  getSupplyById,
  updateSupplyById,
  deleteSupplyById,
  editSupply,
  fromInventory,
};
