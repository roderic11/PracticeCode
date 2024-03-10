const express = require("express");
const router = express.Router();
const {
  getAllProjects,
  createNewProject,
  getIDProjects,
  getItemById,
  updateItemQuantity,
  updateProject,
  editItem,
  editProject,
  deleteItem,
  deleteProject,
  updateRemarks,
  getProjectContents,
} = require("../controllers/bomController");

// GET /api/projects
router.get("/", getAllProjects);
router.get("/:id", getIDProjects);
router.get("/:id/project", getProjectContents);
router.get(":id/items/:itemId", getItemById);

// POST /api/projects
router.post("/", createNewProject);
router.put("/:projectId/items/:itemId", editItem);

// PATCH /api/projects/:projectId/items/:itemId/quantity
router.patch("/:id/items/:itemId", updateItemQuantity);
router.patch("/:id/remarks", updateRemarks);
router.patch("/:id", updateProject);
router.put("/:editId", editProject);
router.delete("/:editId", deleteProject);
// DELETE /api/projects/:projectId/:itemId
router.delete("/:projectId/:itemId", deleteItem);

module.exports = router;
