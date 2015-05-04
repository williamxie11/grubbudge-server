// Node Dependencies
var express = require('express');
var app = express();
var Step = require('step');
var async = require('async');
var fs = require('fs');

// Google Places Search/Details API
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

function writeDataToFile(data, name) {
	var s = JSON.stringify(data, null, 3);
	var fileName = name + ".json";
	fs.writeFile(fileName, s, function(err) {
		if (err) throw err;
	});
}

function appendDataToFile(data, name) {
	var s = JSON.stringify(data, null, 3);
	var fileName = name + ".json";
	fs.appendFile(fileName, s, function(err) {
		if (err) throw err;
	});
}

// Callback function that appends data from Google Places API
function addGoogleData(restaurant, lat, lon) {
	restaurant["open"] = [];
	restaurant["close"] = [];
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
					for (var i = 0; i < times.length; i++) {
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
				}
				appendDataToFile(restaurant, "output");
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
	for (var i = 0; i < businesses.length; i++) {
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
				restaurant["categories"].push(rt.categories[k][0].toLowerCase());
			}
		}

		// Set up callback requests to get more detail from Google Places
		var latitude = rt.location.coordinate.latitude;
		var longitude = rt.location.coordinate.longitude;

		requests.push(addGoogleData(restaurant, latitude, longitude));
	}
	async.seq(requests);
}

function getData() {
	fs.truncate('output.json', 0, function(){ console.log("output.json cleared for new data") })
	yelp.search({term: term, location: location, sort: sort}, function(error, data) {
		var err = error;
		var total = data["total"];
		var requests = [];
		for (var offset = 0; offset < total; offset += 20) {
			//var last = ((offset >= total) ? true : false);
			var restaurantCB = function(error, data) { 
				addData(data); 
			}
			requests.push(yelp.search({term: term, location: location, offset: offset}, restaurantCB))
		}
		async.seq(requests);
	});
}

function main() {
	getData();
}

main();