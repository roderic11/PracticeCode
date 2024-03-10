const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    title : {type: String, },
    location:{type:String},
    dateNeeded:{type:String},
    dateRequested:{type:String},
    targetDelivery:{type:String},
    remarks: {type: String, },
    date: {type: String, },
    time: {type: String, },
    comment: {type: String, },
    view: {type: String,},
    deliveryId: {type: String,},
    tableData: [
        {
          id: {
            type: String,
        
          },
          supplier: {
            type: String,
          
          },
        
          stockRequest:{ 
          type:Number,
          },

          proccuredQuantity:{
            type:Number,
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
            type: Number,
        
          },
          unitCost: {
            type: Number,
          
          },
          materialCost: {
            type: Number,
         
          },
          
          subCategory: {
            
            type:String,
            default: " ",
         
          },
          warehouseUnitcost: {
            
            type:Number,
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
          changes: {
            type: String,
          
          },

        },
      ],
}, {timestamps: true})

module.exports = mongoose.model('comment', commentSchema)