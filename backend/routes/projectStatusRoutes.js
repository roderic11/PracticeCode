const express = require("express");
const router = express.Router();
const {
  getAllProjectStatuses,
  getProjectStatusById,
  createProjectStatus,
  updateProjectStatus,
  deleteProjectStatus,
} = require("../controllers/projectStatusController");

router.get("/", getAllProjectStatuses);
router.get("/:id", getProjectStatusById);
router.post("/", createProjectStatus);
router.put("/:id", updateProjectStatus);
router.delete("/:id", deleteProjectStatus);

module.exports = router;
