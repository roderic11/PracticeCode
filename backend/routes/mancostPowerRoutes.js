const express = require('express')
const router = express.Router()
const {
    getManpowerCost,
  getManpowerCostById,
  createManpowerCost,
  updateManpowerCost,
  deleteManpowerCost,
  
} = require('../controllers/manpowerCostController')

router.get('/read', getManpowerCost)
router.get('/readByID/:id', getManpowerCostById)
router.post('/create', createManpowerCost)
router.put('/updateManpowerCost/:id', updateManpowerCost)
router.delete('/delete/:id', deleteManpowerCost)

module.exports = router