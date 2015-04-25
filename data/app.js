var express = require('express');
var Promise = require('promise').Promise;
var fs = require('fs');
var yelp = require('yelp');
var app = express();

app.use(express.static(__dirname + '/public'));

var port = process.env.PORT || 4000;
console.log("Express server running on " + port);
app.listen(process.env.PORT || port);

var yelp = require('yelp').createClient({
  consumer_key: "qydJIFh5gHAyMj6KlrNmtw", 
  consumer_secret: "VV0q8-sVQa8wvxTw_cvkl6YEgJM",
  token: "aKaWdjmngGphvyi6w87WYXE1SUKvkltk",
  token_secret: "ATtV4sABI6EalSInRYgYELU05_c"
});

var promise = new Promise();

function Restaurant() {
}

// Writes data to JSON file in local directory of a specified name
function writeData(data, name) {
	var s = JSON.stringify(data, null, 3);
	var fileName = name + ".json";
	fs.writeFile(fileName, s, function(err) {
		if (err) throw err;
	});
}

// Semantic replacement for console.log()
function print(me) {
	console.log(me);
}

// Var
var total = 40;
var term = "restaurants";
var location = "Champaign-Urbana";
var sort = 0;
var businesses = [];
var newData = [];

function initData(error, data) {
	total = data["total"];
	businesses = data["businesses"];
	getData(total, businesses, term, location, sort)
}

// NOTE: With Yelp Search API's limit of 20 results per call, we use sequential requests
// with an 20 offset to get all of the data
function getData(total, businesses) {
	var offset = 0;

	var sequence = Futures.sequence();

	sequence
	  .then(function(next) {
	     yelp.search({term: term, location: location, sort: sort, offset: offset}, function(error, data) {
			var err = error;

			// Scrub each business for the data that we want
			for (var i = 0; i < total; i++) {
				var rt = businesses[i];
				var restaurant = new Restaurant();
				restaurant["name"] = rt.name;
				restaurant["image"] = rt.image_url;
				restaurant["lat"] = rt.location.coordinate.latitude;
				restaurant["lon"] = rt.location.coordinate.longitude;
				restaurant["address"] = rt.location.display_address[0] + ", " + rt.location.display_address[1];
				restaurant["rating"] = rt.rating;
				restaurant["rating-img"] = rt.rating_img_url;
				restaurant["url"] = rt.url;
				restaurant["categories"] = rt.categories[0].toLowerCase();
				newData.push(restaurant);
			}
		});
	     offset += 20;
	  })
	/*var sequence = Sequence.create();

	 sequence
    .then(function (next) {
      setTimeout(function () {
        next(err, "Hi", "World!");
      }, 120);
    })
    .then(function (next, err, a, b) {
      setTimeout(function () {
        next(err, "Hello", b);
      }, 270);
    })
    .then(function (next, err, a, b) {
      setTimeout(function () {
        console.log(a, b);
        next();
      }, 50);
    });*/
}


/*
	// Get information for each business, scrub the data we want, and save to local JSON
	for (var offset = 0; offset < total; offset += 20) {
		yelp.search({term: term, location: location, sort: sort, offset: offset}, function(error, data) {
			var err = error;

			// Scrub each business for the data that we want
			for (var i = 0; i < total; i++) {
				var rt = businesses[i];
				var restaurant = new Restaurant();
				restaurant["name"] = rt.name;
				restaurant["image"] = rt.image_url;
				restaurant["lat"] = rt.location.coordinate.latitude;
				restaurant["lon"] = rt.location.coordinate.longitude;
				restaurant["address"] = rt.location.display_address[0] + ", " + rt.location.display_address[1];
				restaurant["rating"] = rt.rating;
				restaurant["rating-img"] = rt.rating_img_url;
				restaurant["url"] = rt.url;
				restaurant["categories"] = rt.categories[0];
				newData.push(restaurant);
			}
		});
	}
	writeData(newData, "output")
}
*/

// Get all Yelp data for C-U area
yelp.search({term: term, location: location, sort: sort}, initData(error, data));





