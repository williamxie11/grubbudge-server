// Meal Plan mongoose model

var mongoose = require('mongoose');

// Define schema
var MealPlanSchema = new mongoose.Schema({
	name: {type: String},
	breakfastID: {type: String},
	lunchID: {type: String},
	dinnerID: {type: String},
	lateID: {type: String},
	planDate: {type: Date, required: true},
	dateCreated: {type: Date, default: Date.now},
	assignedUser: {type: String}
});

// Export Meal Plan model
module.exports = mongoose.model('MealPlan', MealPlanSchema);

