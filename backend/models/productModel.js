const mongoose = require('mongoose')

const inventorySchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    siteName: {
      type: String,
      required: [true, 'Please add a item name'],
      default: "Main Inventory",
    },
    itemName: {
      type: String,
      required: [true, 'Please add a item name'],
    },
    unit: {
        type: String,
        required: [true, 'Please add a unit'],
      },
    category: {
        type: String,
        required: [true, 'Please add a category'],
      },
    quantity: {
        type: String,
        required: [true, 'Please add a quantity'],
      },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Inventory', inventorySchema)