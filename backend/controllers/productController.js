const asyncHandler = require('express-async-handler')

const Inventory = require('../models/productModel')
const Admin = require('../models/adminModel')

// @desc    Get inventorys
// @route   GET /api/inventorys
// @access  Private
const getInventory = asyncHandler(async (req, res) => {
  const inventorys = await Inventory.find({ user: req.user.id })

  res.status(200).json(inventorys)
})

// @desc    Set inventory
// @route   POST /api/inventorys
// @access  Private
const setInventory = asyncHandler(async (req, res) => {
  if (!req.body.itemName || !req.body.unit || !req.body.category || !req.body.quantity) {
    res.status(400)
    throw new Error('Please add a text field')
  }

  const inventory = await Inventory.create({
    itemName: req.body.itemName,
    unit: req.body.unit,
    category: req.body.category,
    quantity: req.body.quantity,
    user: req.user.id,
  })

  res.status(200).json(inventory)
})

// @desc    Update inventory
// @route   PUT /api/inventorys/:id
// @access  Private
const updateInventory = asyncHandler(async (req, res) => {
  const inventory = await Inventory.findById(req.params.id)

  if (!inventory) {
    res.status(400)
    throw new Error('Inventory not found')
  }

  // Check for user
  if (!req.user) {
    res.status(401)
    throw new Error('User not found')
  }

  // Make sure the logged in user matches the inventory user
  if (inventory.user.toString() !== req.user.id) {
    res.status(401)
    throw new Error('User not authorized')
  }

  const updatedInventory = await Inventory.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  })

  res.status(200).json(updatedInventory)
})

// @desc    Delete inventory
// @route   DELETE /api/inventorys/:id
// @access  Private
const deleteInventory = asyncHandler(async (req, res) => {
  const inventory = await Inventory.findById(req.params.id)

  if (!inventory) {
    res.status(400)
    throw new Error('Inventory not found')
  }

  // Check for user
  if (!req.user) {
    res.status(401)
    throw new Error('User not found')
  }

  // Make sure the logged in user matches the inventory user
  if (inventory.user.toString() !== req.user.id) {
    res.status(401)
    throw new Error('User not authorized')
  }

  await inventory.remove()

  res.status(200).json({ id: req.params.id })
})

module.exports = {
  getInventory,
  setInventory,
  updateInventory,
  deleteInventory,
}
