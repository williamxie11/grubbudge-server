// Sukeerthi Khadri : khadri2
// GrubBudge server for CS498 RK1 Spring 2015 Final Project

// Get the packages we need
var express = require('express');
var mongoose = require('mongoose');

// Mongoose models (local representations of MongoDB collections)
var Llama = require('./models/llama');
var User = require('./models/user');
var Restaurant = require('./models/restaurant');
var MealPlan = require('./models/mealplan');

// Connect to GrubBudge database hosted by MongoLab
mongoose.connect('mongodb://testuser:cc0717@ds055709.mongolab.com:55709/grubbudge', function (err) {
	// Print error and exit
	if (err) {
		console.log(err);
		return;
	}
});

// Use environment defined port or 4000
var port = process.env.PORT || 4000;

//Allow CORS so that backend and frontend can be put on different servers
var allowCrossDomain = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
  next();
};

// EXPRESS SETUP ---------------
var app = express(); // define this app to use an express instance
var router = express.Router(); // get instance of an express Router object
app.use(allowCrossDomain); 

// Allow access to POST request body
var bodyParser = require('body-parser');

//Configure our app to use bodyParser(), letting us get the data from a POST
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// REGISTER ROUTES --------------------

// All our routes will start with /api
app.use('/api', router);

var requestCount = 0; // track # of requests
// Middleware to use for all our requests
// Used here to keep track of # of requests just for fun.
router.use(function (req, res, next) {
	requestCount++;
	console.log(requestCount + " request(s) made to GrubBudge API.");
	next(); // Fall through to next routes
})

//Default route
var homeRoute = router.route('/');

homeRoute.get(function(req, res) {
  res.json({ message: 'Hello World!' });
});

//Llama route 
var llamaRoute = router.route('/llamas');

llamaRoute.get(function(req, res) {
  res.json([{ "name": "alice", "height": 12 }, { "name": "jane", "height": 13 }]);
});


// Start the server
app.listen(port);
console.log('Server running on port ' + port); 