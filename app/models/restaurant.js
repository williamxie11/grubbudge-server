// Restaurant mongoose model

var mongoose = require('mongoose');

// Define schema
var RestaurantSchema = new mongoose.Schema({
	name: {type: String},
	imageURL: {type: String},
	lat: {type: Number},
	lon: {type: Number},
	address: {type: String},
	rating: {type: Number},
	ratingURL: {type: String},
	yelpURL: {type: String},
	mealType: {type: [String]},
	categories: {type: [String], default: []},
	price: {type: Number},
	open: {type: [String], default: []},
	close: {type: [String], default: []},
	dateCreated: {type: Date, default: Date.now}
});

// Export the Restaurant mongoose model
module.exports = mongoose.model('Restaurant', RestaurantSchema);