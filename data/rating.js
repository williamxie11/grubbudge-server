// Node Dependencies
var express = require('express');
var app = express();
var fs = require('fs');

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

function appendStrToFile(str, fileName) {
	fs.appendFile(fileName, str, function(err) {
		if (err) throw err;
	})
}

/* ----- Category Data Retrieval Functions ----- */

function main() {
	print("#   Script started.");
}

main();