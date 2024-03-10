const express = require('express')

const router = express.Router()
const {
  registerUser,
  loginUser,
  getMe,
  deleteUser,
  getAllUser,
  updateUser,
  getUserById,
} = require('../controllers/userController')
const { protect } = require('../middleware/authMiddleware')

router.post('/', registerUser)
router.post('/login', loginUser)
router.get('/me', protect, getMe)

router.get('/getAllUser', getAllUser),
router.get('/getUser/:id', getUserById),
router.put('/updateUser/:id', updateUser)
router.delete('/deleteUser/:id', deleteUser)

module.exports = router
