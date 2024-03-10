const express = require("express");
const router = express.Router();
const {
  getAllItems,
  createItem,
  getItemById,
  updateItem,
  editItem,
  deleteItem,
  deleteProduct,
  updateItemQuantity,
  editProject,
  getSiteById,
} = require("../controllers/storageController");

router.get("/", getAllItems);
router.post("/", createItem);
router.get("/:id", getItemById);
router.put("/:id", updateItem);
router.delete("/:id", deleteItem);
router.patch("/:id", updateItemQuantity);
router.get("/:siteId", getSiteById);
router.patch("/:id", editProject);
router.put("/:projectId/siteTable/:itemId", editItem);
router.delete("/:projectId/siteTable/:itemId", deleteProduct);
module.exports = router;
