const express = require('express')
const router = express.Router()
const {
    getEquipmentsInstalled,
  getEquipmentsInstalledById,
  createEquipmentInstalled,
  updateEquipmentInstalled,
  deleteEquipmentInstalled,
  updateEquipmentInstalledTable,
  
} = require('../controllers/equipmentInstalledController')

router.get('/read', getEquipmentsInstalled)
router.get('/readByID/:id', getEquipmentsInstalledById)
router.post('/create', createEquipmentInstalled)
router.put('/updateEquipmentsInstalled/:id', updateEquipmentInstalled)
router.put('/updateEquipTable/:id', updateEquipmentInstalledTable)
router.delete('/delete/:id', deleteEquipmentInstalled)

module.exports = router