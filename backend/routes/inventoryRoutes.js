const express = require('express')
const router = express.Router()
const {
    getAllProducts,
    createNewProduct,
    updateProducts,
    deleteProduct,    
} = require('../controllers/inventoryController')

const { protect } = require('../middleware/authMiddleware')

router.delete('/delete', deleteProduct)
router.post('/create', createNewProduct)
router.patch('/update', updateProducts) 
router.get('/read', getAllProducts)

module.exports = router