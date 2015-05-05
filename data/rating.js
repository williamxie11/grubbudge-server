/* Gets price level data by scraping each Yelp page corresponding to the restaurant data point
 * NOTE: Requires a correctly formatted output.json from restaurant.js. Reference the comment at the top of
 * restaurant.js for instructions on how to manually fix the JSON format before continuing with this script.
 */

// Node Dependencies
var express = require('express');
var app = express();
var fs = require('fs');

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

function writeStrToFile(str, fileName) {
	fs.writeFile(fileName, str, function(err) {
		if (err) throw err;
	})
}

function appendStrToFile(str, fileName) {
	fs.appendFile(fileName, str, function(err) {
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

function scrapeRating() {

}

function getRatings() {
	clearFile("output_full.json");
	var data = getJSONFromFile("output.json");
}

function main() {
	print("#   Script started.");
	getRatings();
}

main();