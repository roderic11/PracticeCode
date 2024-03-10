const mongoose = require('mongoose');

const MrfSchema = new mongoose.Schema({
  projectId: {
    type: String,
    
  },
  mrfName: {
    type: String,
   
  },
  name: {
    type: String,
  },
  location: {
    type: String,
  },
  dateRequested:{
   type:String, // Set the default value to the current date and time
  },
  dateNeeded: {
    type: String,
  },
  subject: {
    type: String,
  },
  items: [
    {
      product: String,
      unit: String,
      quantity: Number,// this is a total quantity
      stockRequest: Number,
      subCategory: String,
      Scope: String,
      proccuredQuantity: { 
        type: Number,
        default: "",
      }
      
    }
  ]
});

module.exports = mongoose.model('Mrf', MrfSchema);
