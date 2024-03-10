const mongoose = require('mongoose')

const newinventorySchema = mongoose.Schema(
  {
   siteName: {
   
    type:String,

   },

    product: {
      type: String,
    },
    unit: {
        type: String,
      },
    quantity: {
        type: String,
      },
    
    },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Newinventory', newinventorySchema)