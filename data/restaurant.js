// Node Dependencies
var express = require('express');
var app = express();
var Step = require('step');
var async = require('async');
var fs = require('fs');

// Google Places Search/Details API
// NOTE: Capped at 1000 requests/day
var GOOGLE_PLACES_API_KEY = "AIzaSyCm7xtB2Oq93Qdfh38fAiUa92OdksKx9IA"
var GooglePlaces = require("googleplaces");
var googlePlaces = new GooglePlaces(GOOGLE_PLACES_API_KEY, "json");

// Yelp Search API 
var yelp = require('yelp').createClient({
  consumer_key: "qydJIFh5gHAyMj6KlrNmtw", 
  consumer_secret: "VV0q8-sVQa8wvxTw_cvkl6YEgJM",
  token: "aKaWdjmngGphvyi6w87WYXE1SUKvkltk",
  token_secret: "ATtV4sABI6EalSInRYgYELU05_c"
});
var term = "restaurants";
var location = "Champaign-Urbana";
var sort = 0;

function Restaurant() {}

// Semantic replacement for console.log()
function print(me) {
	console.log(me);
}

/* ----- File Writing Functions ----- */

function clearOutputFiles() {
	clearFile("output.json");
}

function clearFile(fileName) {
	fs.truncate(fileName, 0, function() { 
		print(fileName + " cleared");
	})
}

function writeStrToFile(str, fileName) {
	fs.writeFile(fileName, str, function(err) {
		if (err) throw err;
	})
}

function writeJSONToFile(data, fileName) {
	var s = JSON.stringify(data, null, 3);
	fs.writeFile(fileName, s, function(err) {
		if (err) throw err;
	});
}

function appendStrToFile(str, fileName) {
	fs.appendFile(fileName, str, function(err) {
		if (err) throw err;
	})
}

function appendJSONToFile(data, fileName) {
	var s = JSON.stringify(data, null, 3);
	s += ",";
	fs.appendFile(fileName, s, function(err) {
		if (err) throw err;
	});
}

/* ----- Data Retrieval Functions ----- */

// An opening time is considered breakfast if it is between 5 AM (0500) and (9:59 AM) (0959) 
function isBreakfast(open, close) {
	if ( (open >= "0500") && (open <= "0959") ) {
		return true;
	}
	return false;
}

// An opening time is considered lunch if it is between 10 AM (1000) and (3:59 PM) (1559) 
function isLunch(open, close) {
	if ( (open >= "0500") && ((close > "1200") || (close < "0500")) ) { 
		return true;
	}
	return false;
}

// An opening time is considered dinner if it is between 4 PM (1600) and (9:59 PM) (2159) 
function isDinner(open, close) {
	if ( (open >= "0500") && ((close > "1600") || (close < "0500")) ) {
		return true;
	} 	
	return false;
}

// An opening time is considered late night if it is between 10 PM (2200) and (4:59 AM) (0459) 
function isLateNight(open, close) {
	if ( (close > "2200") || (close <= "0459") ) {
		return true;
	}
	return false;
}

// Callback function that appends data from Google Places API
function addGoogleData(restaurant, lat, lon) {
	restaurant["open"] = [];
	restaurant["close"] = [];
	restaurant["mealType"] = [];

	var parameters = {
		location: [lat, lon],
		types: "restaurant"
	};

	googlePlaces.placeSearch(parameters, function (error, response) {
		if (error) throw error;
		var results = response["results"];
		if (results.length > 0) {
			googlePlaces.placeDetailsRequest({reference: results[0]["reference"]}, function (error, response) {
				if (error) throw error;
				if (response.result.hasOwnProperty("opening_hours") && response.result["opening_hours"].hasOwnProperty("periods")) {
					var times = response.result["opening_hours"]["periods"];
					var opens = [];
					var closes = [];

					// Add opening and closing times for each day of the week
					for (var i = 0; i < 7; i++) {
						var openingTime = times[i].open["time"];
						var closingTime = null;
						if (times[i].close) {
							closingTime = times[i].close["time"];
						}
						opens.push(openingTime);
						if (closingTime) {
							closes.push(closingTime);
						}
					}
					restaurant["open"] = opens;
					restaurant["close"] = closes;

					// Checks to set the correct mealType for each data point
					// We are just using the first available opening hour for the time being
					var time_open = opens[0];
					var time_close = closes[0];
					if (isBreakfast(time_open, time_close)) {
						restaurant["mealType"].push("breakfast");
					}
					if (isLunch(time_open, time_close)) {
						restaurant["mealType"].push("lunch");
					}
					if (isDinner(time_open, time_close)) {
						restaurant["mealType"].push("dinner");
					}
					if (isLateNight(time_open, time_close)) {
						restaurant["mealType"].push("latenight");
					}
				}
				appendJSONToFile(restaurant, "output.json");
			});
		}
	});
}

// Callback function that appends data from the Yelp API
function addData(data) {
	var newData = [];
	var businesses = data["businesses"];
	var requests = [];

	// Scrub each business for the data that we want from Yelp
	for (var i = 0; i < 1; i++) { // reduced to 1 for testing purposes
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
		restaurant["categories"] = [];
		if (rt.categories) {
			for (var k = 0; k < rt.categories.length; k++) {
				var category = rt.categories[k][0].toLowerCase();
				restaurant["categories"].push(category);
			}
		}
		restaurant["price"] = 1; // this will be set manually because price data is not given

		// Set up callback requests to get more detail from Google Places
		var latitude = rt.location.coordinate.latitude;
		var longitude = rt.location.coordinate.longitude;

		requests.push(addGoogleData(restaurant, latitude, longitude));
	}
	async.seq(requests);
}

// Begins sequential requests to get data starting from the Yelp API
function getData() {
	clearOutputFiles();
	yelp.search({term: term, location: location, sort: sort}, function(error, data) {
		var err = error;
		var total = data["total"];
		var requests = [];
		for (var offset = 0; offset < total; offset += 20) {
			var restaurantCB = function(error, data) { 
				addData(data); 
			}
			requests.push(yelp.search({term: term, location: location, offset: offset}, restaurantCB))
		}
		print("#   Running async requests for Yelp and Google data.");
		async.seq(requests);
	});
}

function main() {
	print("#   Script started.");
	getData();
}

main();