const express = require('express')
const router = express.Router()
const {
    getAdmin,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    loginAdmin,
  
} = require('../controllers/adminController')
const { protect } = require('../middleware/adminAuthMiddleware')

router.delete('/delete', deleteAdmin)
router.post('/create', createAdmin)
router.patch('/update', updateAdmin) 
router.get('/admin', protect, getAdmin)
router.post('/login', loginAdmin)


module.exports = router
