const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema(
  {
    trackingNumber: { type: String },
    title: { type: String },
    place: { type: String },
    remark:  { type: String , default: ""},
    view: { type: String , default: ""},
    read: { type: String , default: ""},
    see:  { type: String , default: ""},
    purchaseId: { type: String },
    tableData: [
      {
        status: { type: String },
        name: { type: String },
        date: { type: String },
        time: { type: String },
        location: { type: String },
        qrCodeData: { type: String },
        comment: { type: String, default: " " },
        undeliveredId: { type: String },
        transactionTable:[
          {
            id: {
              type: String,
          
            },
            category: {
              type: String,
            
            },
            supplier: {
              type: String,
            
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
            changes: {
              type: String,
              default: "",
            },
            itemStatus: {
              type: String,
              default: "",
            },
            
          }
        ]
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Delivery', deliverySchema);
