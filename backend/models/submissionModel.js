const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({

  location:{ 

    type:String,
  
  },
  
  title: {
    type: String,
  },
  
  date: {
    type: String,
    
  },

  dateRequested: {
    type: String,
    
  },
  dateNeeded: {
    type: String,
    
  },
  
  targetDelivery: {
    type:String,
    
  },
  
  
  sender: {
    type: String,
    default: "Procurement Head"
  },

  remark: {

    type:String,
    
  }, 
  view: {
    type:String,
  },
  tableData: [
    {
      id: {
        type: String,
    
      },
      supplier: {
        type: String,
      
      },
    
      stockRequest:{ 
      type:String,
      },
      procurredQuantity:{
        type:String,
      },
     
      warehouse:{
        type:String,
      },
      
      ItemName: {
        type: String,
        
      },
      unit: {
        type: String,
     
      },
      quantity: {
        type: String,
    
      },
      unitCost: {
        type: String,
      
      },
      materialCost: {
        type: String,
     
      },
      proccuredQuantity: {
        type:String,
      },      
      subCategory: {
        
        type:String,
        default: " ",
     
      },
      warehouseUnitcost: {
        
        type:String,
        default: " ",
     
      },
      warehouseMaterialCost: {
        
        type:Number,
        default: " ",
     
      },
      proccuredMaterialCost: {
        
        type:Number,
        default: " ",
     
      },
    },
  ],
},{timestamps: true});

module.exports= mongoose.model("Submission", submissionSchema);

