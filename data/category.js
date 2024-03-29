/* Counts the frequency of categories in the restaurant data and prints it to categories.json
 * NOTE: Requires a correctly formatted output.json. Check the comment at the top of restaurant.js
 * on how to fix current formatting issues before proceeding with this script.
 */

// Node Dependencies
var express = require('express');
var app = express();
var fs = require('fs');

var categoriesList = {};

// Semantic replacement for console.log()
function print(me) {
	console.log(me);
}

/* ----- File Writing Functions ----- */

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

function writeJSONToFile(data, fileName) {
	var s = JSON.stringify(data, null, 3);
	fs.writeFile(fileName, s, function(err) {
		if (err) throw err;
	});
}

/* ----- Sort and JSON Building Functions ----- */

// http://stackoverflow.com/questions/1069666/sorting-javascript-object-by-property-value

function sortByValueDesc(dict) {
	print("#   Sorting data by value");
	var dataArr = [];
	var sortedArr = [];

	// Generate an array with key/values so we can sort
	for (var i = 0; i < Object.keys(dict).length; i++) {
		var key = Object.keys(dict)[i];
		var value = dict[key];
		dataArr.push([key, value]);
	}

	// Do sort
	sortedArr = dataArr.sort(function(a, b) {return b[1] - a[1]});
	return sortedArr;
}

function rebuildJSONFromArray(arr) {
	print("#   Rebuilding data to JSON format");
	var sortedCatList = {};
	for (var i = 0; i < arr.length; i++) {
		var category = arr[i][0];
		var frequency = arr[i][1];
		sortedCatList[category] = frequency;
	}
	return sortedCatList;
}

/* ----- Category Data Retrieval Functions ----- */

function getCategories() {
	clearFile("categories.json");
	var data = getJSONFromFile("output.json");
	var num = data.length;
	print("#   Getting category count data for " + num + " data points");
	for (var i = 0; i < num; i++) {
		var pt = data[i];
		var categories = pt["categories"];
		for (var c = 0; c < categories.length; c++ ) {
			var category = categories[c];
			if (categoriesList.hasOwnProperty(category)) {
				categoriesList[category] += 1;
			}
			else {
				categoriesList[category] = 1;
			}
		}
	}
	var sortedData = sortByValueDesc(categoriesList);
	var categoryData = rebuildJSONFromArray(sortedData);
	writeJSONToFile(categoryData, "categories.json");
}

function main() {
	print("#   Script started.");
	getCategories();
}

main();