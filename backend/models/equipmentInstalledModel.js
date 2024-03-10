const mongoose = require('mongoose');

const EquipmentsInstalledSchema = new mongoose.Schema({
	projectId: {type: String},
	projectName: {type: String},
	projectLocation: {type: String},
	startDate: {type: String},
	endDate: {type: String},

	monitoringTable: [{
		dateModified: {type: String, default: ""},
		timeModified:  {type: String, default: ""},
		personModified:  {type: String, default: ""},
		dateInstalledModified: {type: String, default: ""},
		personComment: {type: String, default: ""},
	}],
	equipmentTable: [{
		personnelInstalled: {type: String, default: ""},
		dateInstalled: {type: String, default: ""},
		overallTotalPercentage: {type: Number, default: ""},
		overAllTotalCost: {type: Number, default: ""},
		equipItemTable: [{
			category: {type: String, default: ""},
			totalInstalled: {type: Number, default: ""},
			numberInstalled: {type: Number, default: ""},
			actualInstalled: {type: Number, default: ""},
			ItemName: {type: String, default: ""},
			unit: {type: String, default: ""},
			newQuantity: {type: Number, default: ""},
			unitCost: {type: Number, default: ""},
			newMaterialCost: {type: Number, default: ""},
			comment:{type: String, default: ""},
			totalPercentage: {type: Number, default: ""},
			cost: {type: Number, default: ""},
			totalCost: {type: Number, default: ""},
		}],
		
	}]
});

module.exports = mongoose.model('EquipmentsInstalled', EquipmentsInstalledSchema);