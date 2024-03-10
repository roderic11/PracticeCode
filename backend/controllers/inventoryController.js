const asyncHandler = require('express-async-handler')
const Product = require('../models/inventoryModel')
//const Admin = require('../models/adminModel');

// @desc    Get products
// @route   GET /api/products
// @access  Private
const getAllProducts = asyncHandler(async (req, res) => {
    // Get all products from MongoDB
    const products = await Product.find().lean()
  
    res.status(200).json(products)
  })
  

// @desc Create new product
// @route POST /products
// @access Private
const createNewProduct = async (req, res) => {
    const { product, unit, category, quantity } = req.body

    // Confirm data
    if (!product.length || !unit.length || !category || !quantity.length) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Check for duplicate title
    const duplicate = await Product.findOne({ product, unit, category, quantity }).collation({ locale: 'en', strength: 2 }).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate product, unit, category, quantity' })
    }

    // Create and store the new product 
    const products = await Product.create({ product, unit, category, quantity  })

    if (products) { // Created 
        return res.status(201).json({ message: 'New product created' })
    } else {
        return res.status(400).json({ message: 'Invalid product data received' })
    }

}

// @desc Update a product
// @routes PATCH /products
// @access Private

const updateProducts =  asyncHandler(async(req, res) => {
    const { id, product, unit, category, quantity } = req.body

    //Confirm data
    if (!id || !product.length || !unit.length || !category || !quantity.length) {
        res.status(400)
        throw new Error('Please add all fields')
    }

    const products = await Product.findById(id).exec()

    if (!products) {
        return res.status(400).json({message: 'Product not found'})
    }

    // Check for duplicate
    const duplicate = await Product.findOne({ product, unit, category, quantity }).lean().exec()
    // Allow updates to the original product inputted
    if (duplicate && duplicate?._id.toString() !== id){
        return res.status(409).json({message: 'Duplicate Product'})
    }
    
    products.product = product
    products.unit = unit
    products.category = category
    products.quantity = quantity
 
    const updatedProduct = await products.save()

    res.json({ message: `${updatedProduct.product} updated`})
});

// @desc Delete a product
// @routes DELETE /products
// @access Private

const deleteProduct =  asyncHandler(async(req, res) => {
    const {id} = req.body;

    //Confirm Data
    if (!id ){
        return res.status(400).json({message: 'Product ID Required'})
    }
    // Does the product, unit, category, quantity exist to delete?
    const product = await Product.findById(id).exec()

    if (!product){
        return res.status(400).json({ message: 'Admin not found'})
    }

    const result = await product.deleteOne()

    const reply = `Email ${result.product} with ID ${result._id}
    deleted`

    res.json(reply)
});



module.exports = {
    getAllProducts,
    createNewProduct,
    updateProducts,
    deleteProduct,
    
  
}