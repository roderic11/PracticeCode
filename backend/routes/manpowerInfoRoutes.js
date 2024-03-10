const express = require('express')
const router = express.Router()
const {
    getManpowerInfo,
  getManpowerInfoById,
  createManpowerInfo,
  updateManpowerInfo,
  deleteManpowerInfo,
  
} = require('../controllers/manpowerInfoController')

router.get('/read', getManpowerInfo)
router.get('/readByID/:id', getManpowerInfoById)
router.post('/create', createManpowerInfo)
router.put('/updateManpowerInfo/:id', updateManpowerInfo)
router.delete('/delete/:id', deleteManpowerInfo)

module.exports = router