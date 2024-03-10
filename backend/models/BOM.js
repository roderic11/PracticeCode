const mongoose = require("mongoose");

const BomSchema = new mongoose.Schema({
  // Explicitly define the _id field
  projectId: {
    type: String,
  },

  name: {
    type: String,
  },
  location: {
    type: String,
  },
  subject: {
    type: String,
  },

  remarks: {
    type: String,
  },

  items: [
    {
      visibility: String,
      category: String,
      subCategory: String,
      product: String,
      unit: String,
      quantity: Number,
      fixedQuantity: Number,
      cost: Number,
      comment: [
        {
          personnel: String,
          Date: String,
          Time: String,
          TextField: String,
        },
      ],
    },
  ],
});

module.exports = mongoose.model("BOM", BomSchema);
