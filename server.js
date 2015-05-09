// Sukeerthi Khadri : khadri2
// GrubBudge server for CS498 RK1 Spring 2015 Final Project

// Get the packages we need
var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var expressSession = require('express-session');
var bCrypt = require('bcrypt-nodejs');
var LocalStrategy = require('passport-local').Strategy;

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
var pageRouter = express.Router(); // Page router
app.use(allowCrossDomain); 

// Allow access to POST request body
var bodyParser = require('body-parser');

//Configure our app to use bodyParser(), letting us get the data from a POST
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// configure passport
app.use(expressSession({secret: 'grubbudge_secret'}));
app.use(passport.initialize());
app.use(passport.session());

// configure flash
app.use(flash());

passport.serializeUser(function (user, done) {
	done(null, user._id);
});

passport.deserializeUser(function (id, done) {
	User.findById(id, function (err, user) {
		done(err, user);
	});
});

passport.use('login', new LocalStrategy({
	passReqToCallback : true
}, function (req, email, password, done) {
	// check in mongo if user with email exists or not
	User.findOne({'email': email}, function (err, user) {
		// Handle error
		if (err)
			return done(err);
		// User name does not exist, log error and redirect back
		if(!user) {
			console.log('User not found.');
			return done(null, false, req.flash('message', 'User not found.'));
		}
		// User exists but wrong password, log the error
		if(!isValidPassword(user, password)) {
			console.log('Invalid password');
			return done(null, false, req.flash('message', 'Invalid password'));
		}
		// User and password match, return user from done method
		return done(null, user);
	});	
}));

var isValidPassword = function(user, password) {
	return bCrypt.compareSync(password, user.password);
}


passport.use('signup', new LocalStrategy({
	passReqToCallback : true
}, function (req, email, password, done) {
	findOrCreateUser = function() {
		// find a user in Mongo with provided username
		User.findOne({'email': email}, function(err, user) {
			// in case of any error return
			if (err) {
				console.log('Error in SignUp');
				return done(err);
			}
			// already exists
			if (user) {
				console.log('User already exists.');
				return done(null, false, req.flash('message', 'User already exists.'));
			}
			else {
				// if no user with that email, create user
				var newUser = new User();
				// set the user's local credentials
				newUser.email = email;
				newUser.password = createHash(password);
				newUser.first = req.param('first');
				newUser.last = req.param('last');
			}

			// save user
			newUser.save(function (err) {
				if (err) {
					console.log('Error in Saving user');
					throw err;
				}
				console.log('User registration successful.');
				return done(null, newUser);
			});
		});
	}
}));

var createHash = function (password) {
	return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

// Routes --------------------

// All our routes will start with /api
app.use('/api', router);
app.use('/', pageRouter);


pageRouter.use(function (req, res, next) {
	console.log('Page request was made!');
	next();
});

var homePageRoute = pageRouter.route('/');

homePageRoute.get(function (req, res) {
	res.json({message: 'This is homepage'});
});

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
	if(!req.body.phone)	{
		res.status(400).json({message: 'Missing phone number.', data: []});
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

	// Save user object in database
	newUser.save(function (err, saveduser) {
		// Handle error
		if (err) {
			res.status(500).json({message: 'Internal server error. Duplicate email or phone.', data: []});
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

		// Success, update user object
		if(req.body.first)
			user.first = req.body.first;
		if(req.body.last)
			user.last = req.body.last;
		if(req.body.email) 
			user.email = req.body.email;
		if(req.body.password)
			user.password = req.body.password;
		if(req.body.phone)
			user.phone = req.body.phone;
		if(req.body.mealPlans) 
			user.mealPlans = req.body.mealPlans;

		// Save updated user to database
		user.save(function (err, saveduser) {
			// Handle error
			if (err) {
				res.status(500).json({message: 'Internal server error', data: []});
				return;
			}

			// Success
			res.status(202).json({message: 'User updated.', data: saveduser});
		});
	});
});

// DELETE - remove an existing user from database
userIdRoute.delete(function (req, res) {
	// Find user in database
	User.findById(req.params.id, function (err, user) {
		// Handle error
		if (err) {
			res.status(404).json({message: 'User not found.', data: []});
			return;
		}

		// ID exists, but user doesn't exist.
		if(!user) {
			res.status(404).json({message: 'User not found.', data: []});
			return;
		}

		// Success, user found, now delete user.
		User.remove({_id: req.params.id}, function (err) {
			// Handle error
			if(err) {
				res.status(500).json({message: 'Internal server error.', data: []});
				return;
			}

			// Success
			res.status(200).json({message: 'User removed.', data: []});
		});
	});
});


// mealplans route ----------------------------
var mealPlansRoute = router.route('/mealplans');

// GET - List of meal plans
mealPlansRoute.get(function (req, res) {
	
	var query = MealPlan.find(); // Mongoose query

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
    	query.exec(function (err, mealplans) {
    		// Error
    		if (err) {
    			res.status(500).json({message: 'Internal server error!', data: []});
    			return;
    		}
    		// Success
    		res.status(200).json({message: 'OK', data: mealplans});
    	});
});

// POST - Create a meal plan
mealPlansRoute.post(function (req, res) {
	
	// Check request body for missing required attributes
	if(!req.body.breakfastID) {
		res.status(400).json({message: 'Missing breakfast ID.', data: []});
		return;
	}
	if(!req.body.lunchID) {
		res.status(400).json({message: 'Missing lunch ID.', data: []});
		return;
	}
	if(!req.body.dinnerID) {
		res.status(400).json({message: 'Missing dinner ID.', data: []});
		return;
	}
	if(!req.body.lateID) {
		res.status(400).json({message: 'Missing late night ID.', data: []});
		return;
	}
	if(!req.body.planDate) {
		res.status(400).json({message: 'Missing meal plan date.', data: []});
		return;
	}
	if(!req.body.name) {
		res.status(400).json({message: 'Missing name for meal plan.', data: []});
		return;
	}
	if(!req.body.assignedUser) {
		res.status(400).json({message: 'Missing user ID to assign to.', data: []});
		return;
	}

	// Construct meal plan object
	var newMealPlan = new MealPlan();
	newMealPlan.breakfastID = req.body.breakfastID;
	newMealPlan.lunchID = req.body.lunchID;
	newMealPlan.dinnerID = req.body.dinnerID;
	newMealPlan.lateID = req.body.lateID;
	newMealPlan.planDate = req.body.planDate;
	newMealPlan.name = req.body.name;
	newMealPlan.assignedUser = req.body.assignedUser;

	// Save meal plan object to database
	newMealPlan.save(function (err, savedmealplan) {
		// Handle error
		if (err) {
			res.status(500).json({message: 'Internal server error.', data: []});
			return;
		}
		// Success
		res.status(201).json({message: 'Meal plan created.', data: savedmealplan});
	});
});

// OPTIONS 
mealPlansRoute.options(function (req, res) {
	res.writeHead(200);
	res.end();
});

// mealplans/:id route -------------------------------
var mealPlanIdRoute = router.route('/mealplans/:id');

// GET - details of a specific meal plan
mealPlanIdRoute.get(function (req, res) {

	// find meal plan in database
	MealPlan.findById(req.params.id, function (err, mealplan) {
		// Handle error
		if (err) {
			res.status(404).json({message: 'Meal plan not found.', data: []});
			return;
		}
		// ID exists, but not assigned to any meal plan
		if (!mealplan) {
			res.status(404).json({message: 'Meal plan not found.', data: []});
			return;
		}

		// Success
		res.status(200).json({message: 'OK', data: mealplan});
	});
});

// PUT - modify existing meal plan
mealPlanIdRoute.put(function (req, res) {

	// find meal plan in database
	MealPlan.findById(req.params.id, function (err, mealplan) {
		// Handle error
		if (err) {
			res.status(404).json({message: 'Meal plan not found.', data: []});
			return;
		}

		// ID exists, but not assigned to any meal plan.
		if(!mealplan) {
			res.status(404).json({message: 'Meal plan not found.', data: []});
			return;
		}

		// Success, update meal plan object
		if(req.body.name)
			mealplan.name = req.body.name;
		if(req.body.breakfastID)
			mealplan.breakfastID = req.body.breakfastID;
		if(req.body.lunchID)
			mealplan.lunchID = req.body.lunchID;
		if(req.body.dinnerID) 
			mealplan.dinnerID = req.body.dinnerID;
		if(req.body.lateID)
			mealplan.lateID = req.body.lateID;
		if(req.body.planDate)
			mealplan.planDate = req.body.planDate;
		if(req.body.assignedUser) 
			mealplan.assignedUser = req.body.assignedUser;

		// Save updated meal plan to database
		mealplan.save(function (err, savedmealplan) {
			// Handle error
			if (err) {
				res.status(500).json({message: 'Internal server error', data: []});
				return;
			}

			// Success
			res.status(202).json({message: 'Meal plan updated.', data: savedmealplan});
		});
	});
});

// DELETE - remove an existing meal plan from database
mealPlanIdRoute.delete(function (req, res) {
	// Find meal plan in database
	MealPlan.findById(req.params.id, function (err, mealplan) {
		// Handle error
		if (err) {
			res.status(404).json({message: 'Meal plan not found.', data: []});
			return;
		}

		// ID exists, but not assigned to any meal plan
		if(!mealplan) {
			res.status(404).json({message: 'Meal plan not found.', data: []});
			return;
		}

		// Success, meal plan found, now delete it.
		MealPlan.remove({_id: req.params.id}, function (err) {
			// Handle error
			if(err) {
				res.status(500).json({message: 'Internal server error.', data: []});
				return;
			}

			// Success
			res.status(200).json({message: 'Meal plan removed.', data: []});
		});
	});
});

// restaurants route --------------------------------------
var restaurantsRoute = router.route('/restaurants');

// GET - List of restaurants
restaurantsRoute.get(function (req, res) {
	
	var query = Restaurant.find(); // Mongoose query

	// Build query based on request
    if(req.query.where) {
        var where = JSON.parse(req.query.where);
        query.where(where).lte(where.price);
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
    	query.exec(function (err, restaurants) {
    		// Error
    		if (err) {
    			res.status(500).json({message: 'Internal server error!', data: []});
    			return;
    		}
    		// Success
    		res.status(200).json({message: 'OK', data: restaurants});
    	});
});

// POST - Create a restaurant listing
restaurantsRoute.post(function (req, res) {
	
	// Check request body for missing required attributes
	if(!req.body.name) {
		res.status(400).json({message: 'Missing restaurant name.', data: []});
		return;
	}
	if(!req.body.imageURL) {
		res.status(400).json({message: 'Missing restaurant image URL.', data: []});
		return;
	}
	if(!req.body.lat) {
		res.status(400).json({message: 'Missing restaurant latitude.', data: []});
		return;
	}
	if(!req.body.lon) {
		res.status(400).json({message: 'Missing restaurant longitude.', data: []});
		return;
	}
	if(!req.body.address) {
		res.status(400).json({message: 'Missing restaurant address.', data: []});
		return;
	}
	if(!req.body.rating) {
		res.status(400).json({message: 'Missing restaurant rating.', data: []});
		return;
	}
	if(!req.body.ratingURL) {
		res.status(400).json({message: 'Missing restaurant rating URL.', data: []});
		return;
	}
	if(!req.body.yelpURL) {
		res.status(400).json({message: 'Missing restaurant Yelp URL.', data: []});
		return;
	}
	if(!req.body.categories) {
		res.status(400).json({message: 'Missing restaurant categories.', data: []});
		return;
	}
	if(!req.body.price) {
		res.status(400).json({message: 'Missing restaurant price.', data: []});
		return;
	}
	if(!req.body.open) {
		res.status(400).json({message: 'Missing restaurant open times.', data: []});
		return;
	}
	if(!req.body.close) {
		res.status(400).json({message: 'Missing restaurant close times.', data: []});
		return;
	}
	if(!req.body.mealType) {
		res.status(400).json({message: 'Missing meal types (breakfast, lunch, dinner, latenight).', data: []});
		return;
	}

	// Construct restaurant object
	var newRestaurant = new Restaurant();
	newRestaurant.name = req.body.name;
	newRestaurant.imageURL = req.body.imageURL;
	newRestaurant.lat = req.body.lat;
	newRestaurant.lon = req.body.lon;
	newRestaurant.address = req.body.address;
	newRestaurant.rating = req.body.rating;
	newRestaurant.ratingURL = req.body.ratingURL;
	newRestaurant.yelpURL = req.body.yelpURL;
	newRestaurant.categories = req.body.categories;
	newRestaurant.price = req.body.price;
	newRestaurant.open = req.body.open;
	newRestaurant.close = req.body.close;
	newRestaurant.mealType = req.body.mealType;

	// Save restaurant object to database
	newRestaurant.save(function (err, savedrestaurant) {
		// Handle error
		if (err) {
			res.status(500).json({message: 'Internal server error.', data: []});
			return;
		}
		// Success
		res.status(201).json({message: 'Restaurant created.', data: savedrestaurant});
	});
});

// OPTIONS 
restaurantsRoute.options(function (req, res) {
	res.writeHead(200);
	res.end();
});


// restaurants/:id route ------------------------------------
var restaurantIdRoute = router.route('/restaurants/:id');

// GET - details of a specific restaurant
restaurantIdRoute.get(function (req, res) {

	// find restaurant in the database
	Restaurant.findById(req.params.id, function (err, restaurant) {
		// Handle error
		if (err) {
			res.status(404).json({message: 'Restaurant not found.', data: []});
			return;
		}
		// ID exists, but not assigned to any restaurant
		if (!restaurant) {
			res.status(404).json({message: 'Restaurant not found.', data: []});
			return;
		}

		// Success
		res.status(200).json({message: 'OK', data: restaurant});
	});
});

// PUT - modify existing restaurant
restaurantIdRoute.put(function (req, res) {

	// find meal plan in database
	Restaurant.findById(req.params.id, function (err, restaurant) {
		// Handle error
		if (err) {
			res.status(404).json({message: 'Restaurant not found.', data: []});
			return;
		}

		// ID exists, but not assigned to any restaurant
		if(!restaurant) {
			res.status(404).json({message: 'Restaurant not found.', data: []});
			return;
		}

		// Success, update restaurant object
		if(req.body.name)
			restaurant.name = req.body.name;
		if(req.body.imageURL)
			restaurant.imageURL = req.body.imageURL;
		if(req.body.lat)
			restaurant.lat = req.body.lat;
		if(req.body.lon)
			restaurant.lon = req.body.lon;
		if(req.body.address)
			restaurant.address = req.body.address;
		if(req.body.rating) 
			restaurant.rating = req.body.rating;
		if(req.body.ratingURL)
			restaurant.ratingURL = req.body.ratingURL;
		if(req.body.yelpURL)
			restaurant.yelpURL = req.body.yelpURL;
		if(req.body.categories)
			restaurant.categories = req.body.categories;
		if(req.body.price)
			restaurant.price = req.body.price;
		if(req.body.open)
			restaurant.open = req.body.open;
		if(req.body.close)
			restaurant.close = req.body.close;
		if(req.body.mealType)
			restaurant.mealType = req.body.mealType;

		// Save updated restaurant to database
		restaurant.save(function (err, savedrestaurant) {
			// Handle error
			if (err) {
				res.status(500).json({message: 'Internal server error', data: []});
				return;
			}

			// Success
			res.status(202).json({message: 'Restaurant updated.', data: savedrestaurant});
		});
	});
});

// DELETE - remove an existing restaurant from database
restaurantIdRoute.delete(function (req, res) {
	// Find restaurant in database
	Restaurant.findById(req.params.id, function (err, restaurant) {
		// Handle error
		if (err) {
			res.status(404).json({message: 'Restaurant not found.', data: []});
			return;
		}

		// ID exists, but not assigned to any restaurant
		if(!restaurant) {
			res.status(404).json({message: 'Restaurant not found.', data: []});
			return;
		}

		// Success, restaurant found, now delete it.
		Restaurant.remove({_id: req.params.id}, function (err) {
			// Handle error
			if(err) {
				res.status(500).json({message: 'Internal server error.', data: []});
				return;
			}

			// Success
			res.status(200).json({message: 'Restaurant removed.', data: []});
		});
	});
});


// Start the server
app.listen(port);
console.log('Server running on port ' + port); 