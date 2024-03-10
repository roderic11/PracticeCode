const mongoose = require('mongoose');

const ManpowerInfoSchema = new mongoose.Schema({
      name: {type: String,},
      arbitraryNumber: {type: String,},
  
});

module.exports = mongoose.model('ManpowerInfo', ManpowerInfoSchema);
