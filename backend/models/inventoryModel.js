const mongoose = require('mongoose')

const productSchema = mongoose.Schema(
  {
    product: [{
      type: String,
      required: [true, 'Please add a product'],
    }],
    unit: [{
      type: String,
      required: [true, 'Please add unit'],
      unique: true,
    }],
    category: {
      type: String,
      required: [true, 'Please add a category'],
    },
    quantity:[{
        type: String,
        required: [true, 'Please add a quantity'],
    }]
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Product', productSchema)
