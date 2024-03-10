const mongoose = require("mongoose");

const storageSchema = new mongoose.Schema(
  {
    siteName: {
      type: String,
    },
    projectId: {
      type: String,
    },
    projectName: {
      type: String,
    },

    siteTable: [
      {
        id: {
          type: String,
        },

        category: {
          type: String,
          default: " ",
        },

        ItemName: {
          type: String,
          default: "",
        },
        unit: {
          type: String,
          default: "",
        },
        quantity: {
          type: Number,
          default: "",
        },
        unitCost: {
          type: String,
          default: "",
        },
        materialCost: {
          type: Number,
          default: "",
        },
        supplier: {
          type: String,
          // Reference to the 'supplier' collection
        },
        comment: [
          {
            Date: String,
            Time: String,
            TextField: String,
            personnel: String,
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Storage", storageSchema);
