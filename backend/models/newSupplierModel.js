const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const supplySchema = new Schema({
    supplier : {type: String, },
    items: [
        {
           
            category: String,
            brand: String,
            ItemName:  String,
            unit:String,
            unitCost: Number,
            
        }
      ]
    
    
}, {timestamps: true})

module.exports = mongoose.model('supply', supplySchema)
