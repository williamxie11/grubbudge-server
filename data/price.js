/* Gets price level data by scraping each Yelp page corresponding to the restaurant data point
 * NOTE: Requires a correctly formatted output.json from restaurant.js. Reference the comment at the top of
 * restaurant.js for instructions on how to manually fix the JSON format before continuing with this script.
 * The output must also be fixed in the same way as the restaurant.js output.
 */

// Node Dependencies
var express = require("express");
var app = express();
var fs = require("fs");
var async = require("async");
var cheerio = require("cheerio");
var request = require("request");

// Semantic replacement for console.log()
function print(me) {
	console.log(me);
}

/* ----- File Read/Write Functions ----- */

function clearFile(fileName) {
	print("#   " + fileName + " cleared");
	fs.truncate(fileName, 0, function(err) { 
		if (err) throw err;
	})
}

function getJSONFromFile(fileName) {
	var fileData = fs.readFileSync(fileName, "utf8");
	var fileJSON = JSON.parse(fileData);
	return fileJSON;
}

function appendJSONToFile(data, fileName) {
	var s = JSON.stringify(data, null, 3);
	s += ",";
	fs.appendFile(fileName, s, function(err) {
		if (err) throw err;
	});
}

/* ----- Category Data Retrieval Functions ----- */

// Web scrape on the given Yelp URL for the price level and add data to output
function scrapeRating(data, link) {
	request(link, function(error, response, html) {
		if (error) throw error;
		$ = cheerio.load(html);
		var priceLevel = $(".business-attribute").html();
		if (priceLevel == "$") {
			data["price"] = 1;
		}
		else if (priceLevel == "$$") {
			data["price"] = 2;
		}
		else if (priceLevel == "$$$") {
			data["price"] = 3;
		}
		else if (priceLevel == "$$$$") {
			data["price"] = 4;
		}
		else {
			data["price"] = 0;
		}
		appendJSONToFile(data, "output_full.json");
	});
}

function getRatings() {
	clearFile("output_full.json");
	var requests = [];
	var data = getJSONFromFile("output.json");

	print("#   Enumerating URLs.");
	// Get URLs from data to scrape price level from
	for (var i = 0; i < data.length; i++) {
		var pt = data[i];
		var url = pt.url;
		var scrapeFunc = scrapeRating(pt, url);
		requests.push(scrapeFunc);
	}
	print("#   Scraping Yelp pages for price data.");
	async.seq(requests);
}

function main() {
	print("#   Script started.");
	getRatings();
}

main();