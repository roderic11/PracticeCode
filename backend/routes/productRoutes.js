const express = require('express')
const router = express.Router()
const {
  getInventory,
  setInventory,
  updateInventory,
  deleteInventory,
} = require('../controllers/productController')

const { protect } = require('../middleware/authMiddleware')

router.delete('/delete', deleteInventory)
router.post('/create', setInventory)
router.patch('/update', updateInventory) 
router.get('/read', getInventory)
//router.route('/').get(protect, getAllProducts).post(protect, createNewProduct)
//router.route('/:id').delete(protect, deleteProduct).put(protect, updateProducts)
module.exports = router
