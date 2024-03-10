const mongoose = require('mongoose');

const ManpowerCostSchema = new mongoose.Schema({
    projectId:{type: String},
    siteName:{type: String},
    projectName:{type: String},
    monitoringManCostTable: [{
		dateModified: {type: String, default: ""},
		timeModified:  {type: String, default: ""},
		personModified:  {type: String, default: ""},
		dateWorkModified: {type: String, default: ""},
		personComment: {type: String, default: ""},
	}],
    costingTable:[
        {
                personnel:{ type: String },
                projectDate: {type: String},
                projectActivity: {type: String},
                totalManpowerNum: {type: String},
                totalRegTime: {type: String},
                totalOvertime: {type: String},
                totalNightDiff: {type: String},
                totalRestDay: {type: String},
                totalRestDayOT: {type: String},
                totalRegHoliday: {type: String},
                mansPageName: {type: String},
                totalPersonnel: {type: String},
                partialTotal: {type: String},
                grandTotalCost:{type: String},
                adminCostTotal: {type: String},
                adminCostREG: {type: String},
                adminCostOT: {type: String},
                adminCostND: {type: String},
                adminCostRD: {type: String},
                adminCostRDOT: {type: String},
                adminCostRH: {type: String},
                        mancostTable: [
                        { 
                            ManName: {
                                type: String
                            },
                            ArbitNum: {
                                type: Number
                            },
                            ManpowerNum: {
                                type: Number
                            },
                            RegTime: {
                                type: Number
                            },
                            Overtime: {
                                type: Number
                            },
                            NightDiff: {
                                type: Number
                            },
                            RestDay: {
                                type: Number
                            },
                            RestDayOT: {
                                type: Number
                            },
                            RegHoliday: {
                                type: Number
                            },
                            sumPerRow: {
                                type: Number
                            }
                        }
                        ],
}
]
});

module.exports = mongoose.model('ManpowerCost', ManpowerCostSchema);
