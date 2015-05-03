// Sukeerthi Khadri : khadri2
// GrubBudge server for CS498 RK1 Spring 2015 Final Project

// Get the packages we need
var express = require('express');
var mongoose = require('mongoose');

// Mongoose models (local representations of MongoDB collections)
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

// Routes --------------------

// All our routes will start with /api
app.use('/api', router);

var requestCount = 0; // track # of requests
// Middleware to use for all our requests
// Used here to keep track of # of requests just for fun.
router.use(function (req, res, next) {
	requestCount++;
	console.log(requestCount + " request(s) made to the GrubBudge API.");
	next(); // Fall through to next routes
});

//Default route
var homeRoute = router.route('/');

homeRoute.get(function(req, res) {
  res.json({ message: 'Hello World!' });
});


// users route -------------------------------------
var usersRoute = router.route('/users');

// GET - List of users
usersRoute.get(function (req, res) {
	var query = User.find(); // Mongoose query

	// Build query based on request
    if(req.query.where) {
        var where = JSON.parse(req.query.where);
        query.where(where);
    }
    if(req.query.sort) {
        var sort = JSON.parse(req.query.sort);
        query.sort(sort);
    }
    if(req.query.select) {
        var select = JSON.parse(req.query.select);
        query.select(select);
    }
    if(req.query.skip) {
        var skip = parseInt(req.query.skip, 10);
        query.skip(skip);
    }
    if(req.query.limit) {
        var limit = parseInt(req.query.limit, 10);
        query.limit(limit);
    }
    var count = (req.query.count === 'true');

    // If count is requested
    if(count)
    	query.count(function (err, count) {
    		// Error
    		if (err) {
    			res.status(500).json({message: 'Internal server error!', data: []});
    			return;
    		}
    		// Success
    		res.status(200).json({message: 'OK', data: count});
    	});
    // count not requested
    else
    	query.exec(function (err, users) {
    		// Error
    		if (err) {
    			res.status(500).json({message: 'Internal server error!', data: []});
    			return;
    		}
    		// Success
    		res.status(200).json({message: 'OK', data: users});
    	});
});

// POST - Create a user
usersRoute.post(function (req, res) {
	
	// Check request body for missing required attributes
	if(!req.body.first) {
		res.status(400).json({message: 'Missing first name.', data: []});
		return;
	}
	if(!req.body.last) {
		res.status(400).json({message: 'Missing last name.', data: []});
		return;
	}
	if(!req.body.email) {
		res.status(400).json({message: 'Missing email address.', data: []});
		return;
	}
	if(!req.body.password) {
		res.status(400).json({message: 'Missing password.', data: []});
		return;
	}

	// Construct user object
	var newUser = new User();
	newUser.first = req.body.first;
	newUser.last = req.body.last;
	newUser.email = req.body.email;
	newUser.password = req.body.password;
	newUser.phone = req.body.phone;

	if(!req.body.mealPlans)
		newUser.mealPlans = [];
	else
		newUser.mealPlans = req.body.mealPlans;

	// Save user object on database
	newUser.save(function (err, saveduser) {
		// Handle error
		if (err) {
			res.status(500).json({message: 'Email already exists.', data: []});
			return;
		}
		// Success
		res.status(201).json({message: 'User created.', data: saveduser});
	});
});

// OPTIONS 
usersRoute.options(function (req, res) {
	res.writeHead(200);
	res.end();
});


// users/:id route -------------------------------
var userIdRoute = router.route('/users/:id');

// GET - details of a specific user
userIdRoute.get(function (req, res) {

	// find user in database
	User.findById(req.params.id, function (err, user) {
		// Handle error
		if (err) {
			res.status(404).json({message: 'User not found.', data: []});
			return;
		}
		// ID exists, but not assigned to any user
		if (!user) {
			res.status(404).json({message: 'User not found.', data: []});
			return;
		}

		// Success
		res.status(200).json({message: 'OK', data: user});
	});
});

// PUT - modify existing user
userIdRoute.put(function (req, res) {

	// find user in database
	User.findById(req.params.id, function (err, user) {
		// Handle error
		if (err) {
			res.status(404).json({message: 'User not found.', data: []});
			return;
		}

		// ID exists, but not assigned to any user
		if(!user) {
			res.status(404).json({message: 'User not found.', data: []});
			return;
		}

		// Success, now check validity of request
		if(!req.body.first) {
			res.status(400).json({message: 'Missing first name.', data: []});
			return;
		}
		if(!req.body.last) {
			res.status(400).json({message: 'Missing last name.', data: []});
			return;
		}
		if(!req.body.email) {
			res.status(400).json({message: 'Missing email address.', data: []});
			return;
		}

		// Update user object

	});
});


// Start the server
app.listen(port);
console.log('Server running on port ' + port); 