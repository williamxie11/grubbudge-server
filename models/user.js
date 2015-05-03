// User mongoose model

var mongoose = require('mongoose');

// Define schema
var UserSchema = new mongoose.Schema({
	first: {type: String, required: true},
	last: {type: String, required: true},
	email: {type: String, required: true, unique: true},
	password: {type: String, required: true},
	phone: {type: String, required: true, unique: true},
	mealPlans: {type: [String], default: []},
	dateCreated: {type: Date, default: Date.now}
});

// Export Restaurant model
module.exports = mongoose.model('User', UserSchema);