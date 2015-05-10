// User mongoose model
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// Define schema
var userSchema = new mongoose.Schema({
	first: {type: String, required: true},
	last: {type: String, required: true},
	email: {type: String, required: true, unique: true},
	password: {type: String, required: true},
	phone: {type: String, required: true, unique: true},
	mealPlans: {type: [String], default: []},
	dateCreated: {type: Date, default: Date.now}
});

userSchema.methods.generateHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
	return bcrypt.compareSync(password, this.password);
};

// Export Restaurant model
module.exports = mongoose.model('User', userSchema);