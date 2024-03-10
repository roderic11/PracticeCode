const mongoose = require("mongoose");

const projectStatusSchema = new mongoose.Schema({
  projectId: {
    type: String,
  },
  projectName: {
    type: String,
  },
  siteName: {
    type: String,
  },
  statusTable: [
    {   calculateScopeTotal: Number,
        handleFinalTotal: Number,
        categoryArbitrary: Number,
      
          category: String,
          subCategory: String,
          product: String,
          unit: String,
          fixedQuantity: Number,
          actualInstalled: Number,
          itemCompletion: Number,
          weightPercentage: Number,
          overallCompletion: Number,
          totalWeightPercentage: Number,
          totalOverallCompletion: Number,
          subCategoryArbitraryValue: Number,
          calculatedSubCategory: Number,
       
     
    },
  ],
},
{
    timestamps: true,
  }
  );

const ProjectStatus = mongoose.model("ProjectStatus", projectStatusSchema); // Renamed model here

module.exports = ProjectStatus; 