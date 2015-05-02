// Meal Plan mongoose model

var mongoose = require('mongoose');

// Define schema
var MealPlanSchema = new mongoose.Schema({
	breakfastID: {type: String},
	lunchID: {type: String},
	dinnerID: {type: String},
	lateID: {type: String},
	planDate: {type: Date, required: true},
	dateCreated: {type: Date, default: Date.now}
});

// Export Meal Plan model
module.exports = mongoose.model('MealPlan', MealPlanSchema);

