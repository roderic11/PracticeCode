const asyncHandler = require('express-async-handler');
const EquipmentsInstalled = require('../models/equipmentInstalledModel');

// @desc      Get a specific equipment installation by ID
// @route     GET /api/equipments-installed/:id
// @access    Public
const getEquipmentsInstalledById = asyncHandler(async (req, res) => {
  const equipmentId = req.params.id;

  const equipment = await EquipmentsInstalled.findById(equipmentId);
  if (!equipment) {
    return res.status(404).json({ error: 'Equipment installation not found' });
  }

  res.json(equipment);
});

// @desc      Get all equipment installations
// @route     GET /api/equipments-installed
// @access    Public
const getEquipmentsInstalled = asyncHandler(async (req, res) => {
  const equipments = await EquipmentsInstalled.find();
  res.json(equipments);
});

// @desc      Create a new equipment installation
// @route     POST /api/equipments-installed
// @access    Public
const createEquipmentInstalled = asyncHandler(async (req, res) => {
  const {
    projectId,
    projectName,
    projectLocation,
    startDate,
    endDate,
    monitoringTable,
    equipmentTable,
  } = req.body;

  const equipmentInstalled = new EquipmentsInstalled({
    projectId,
    projectName,
    projectLocation,
    startDate,
    endDate,
    monitoringTable,
    equipmentTable,
  });

  const createdEquipmentInstalled = await equipmentInstalled.save();
  res.status(201).json(createdEquipmentInstalled);
});

// @desc      Update equipment installation
// @route     PUT /api/equipments-installed/:id
// @access    Public
const updateEquipmentInstalled = asyncHandler(async (req, res) => {
  const equipmentId = req.params.id;
  const {
    projectId,
    projectName,
    projectLocation,
    startDate,
    endDate,
    monitoringTable,
    equipmentTable,
  } = req.body;

  try {
    const equipment = await EquipmentsInstalled.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment installation not found' });
    }

    equipment.projectId = projectId;
    equipment.projectName = projectName;
    equipment.projectLocation = projectLocation;
    equipment.startDate = startDate;
    equipment.endDate = endDate;
    equipment.monitoringTable = monitoringTable;
    equipment.equipmentTable = equipmentTable;

    await equipment.save();

    res.json(equipment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update equipment installation' });
  }
});
// @desc      Update equipment installation table
// @route     PUT /api/equipments-installed/:id
// @access    Public
const updateEquipmentInstalledTable = asyncHandler(async (req, res) => {
  const equipmentId = req.params.id;
  const {
    monitoringTable,
    equipmentTable,
  } = req.body;

  try {
    const equipment = await EquipmentsInstalled.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment installation table not found' });
    }
    equipment.equipmentTable = equipmentTable;
    equipment.monitoringTable = monitoringTable;

    await equipment.save();

    res.json(equipment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update equipment installation table' });
  }
});
// @desc      Delete an equipment installation
// @route     DELETE /api/equipments-installed/:id
// @access    Public
const deleteEquipmentInstalled = asyncHandler(async (req, res) => {
  const equipmentId = req.params.id;

  const equipment = await EquipmentsInstalled.findById(equipmentId);
  if (!equipment) {
    return res.status(404).json({ error: 'Equipment installation not found' });
  }

  await equipment.remove();

  res.json({ message: 'Equipment installation removed' });
});

module.exports = {
  getEquipmentsInstalled,
  createEquipmentInstalled,
  updateEquipmentInstalled,
  deleteEquipmentInstalled,
  getEquipmentsInstalledById,
  updateEquipmentInstalledTable,
};
