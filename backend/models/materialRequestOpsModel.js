const mongoose = require('mongoose');

const MaterialRequestSchema = new mongoose.Schema({
  
  projectId: {
    type: String,
  },
  name: {
    type: String,
  },
  location: {
    type: String,
  },
  tableData: [{

    username:{
      type:String, 
     },
      dateRequested:{
        type:String, 
       },
       dateNeeded: {
         type: String,
       },
       mrfName: {
        type: String,
        
      },
      
      remarks: {
        type:String,
      },
      comment: {
        type:String,
      },
       items: [
         {
           
           product: String,
           unit: String,
           quantity: Number,
           mrfValue: Number,
           subCategory: String,
           scope: String,
          
           
         }
       ]
  }]
});

module.exports = mongoose.model('MaterialRequest', MaterialRequestSchema);