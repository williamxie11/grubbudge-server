var express = require('express');
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

