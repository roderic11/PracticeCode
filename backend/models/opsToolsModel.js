const mongoose = require('mongoose');

const OpsToolsSchema = new mongoose.Schema({

	projectId: {type: String},
	projectName: {type: String},
	projectLocation: {type: String},
    monitoringToolsTable: [{
		dateModified: {type: String, default: ""},
		timeModified:  {type: String, default: ""},
		personModified:  {type: String, default: ""},
		dateUsedModified: {type: String, default: ""},
		personComment: {type: String, default: ""},
	}],
	toolsTable: [
	{
        personnel:{ type: String },
        workDate: { type: String },
        workTime: { type: String },
        workActivity: { type: String },
        toolsItemsTable: [{
                    ToolsItemName: {
                        type: String
                    },
                    ToolsSN: {
                        type: String
                    },
                    ToolsRemarks: {
                        type: String
                    },
                    ToolsInCharge: {
                        type: String
                    },
                    ToolsStart: {
                        type: String
                    },
                    ToolsEnd: {
                        type: String
                    },
                          }]
	}]
});

module.exports = mongoose.model('OpsTools', OpsToolsSchema);
