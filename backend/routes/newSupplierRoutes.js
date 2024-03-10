const express = require("express");
const router = express.Router();
const {
  createSupply,
  getAllSupplies,
  editSupply,
  getSupplyById,
  updateSupplyById,
  deleteSupplyById,
  fromInventory,
} = require("../controllers/newSupplierController");

// Create a new supply
router.post("/supplies", createSupply);

// Get all supplies
router.get("/supplies", getAllSupplies);

// Get a supply by ID
router.get("/supplies/:id", getSupplyById);
router.put("/supplies/:supplierId/items/:itemId", editSupply);

// Update a supply by ID
router.put("/supplies/:id", updateSupplyById);

// Delete a supply by ID
router.delete("/supplies/:supplierId/items/:itemId", deleteSupplyById);
router.patch("/supplies/items", fromInventory);
module.exports = router;
