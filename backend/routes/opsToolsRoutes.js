const express = require('express')
const router = express.Router()
const {
  getAllOpsTools,
  getOpsToolsById,
  createOpsTools,
  updateOpsTools,
  deleteOpsTools
  
} = require('../controllers/opsToolsController')

router.get('/read',   getAllOpsTools)
router.get('/readByID/:id',  getOpsToolsById)
router.post('/create', createOpsTools)
router.put('/updateTools/:id', updateOpsTools)
router.delete('/delete/:id', deleteOpsTools)

module.exports = router