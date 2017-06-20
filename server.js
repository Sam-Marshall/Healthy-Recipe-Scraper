// mongodb://heroku_gd8h025t:n4p8gjm9pca1fmbt4q4cdq6oco@ds131512.mlab.com:31512/heroku_gd8h025t

// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
// Requiring our Note and Article models
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");
// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");
// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;


// Initialize Express
var app = express();

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
    extended: false
}));

// Make public a static dir
app.use(express.static("public"));

// Database configuration with mongoose
mongoose.connect("mongodb://localhost/recipemongoose");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
    console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
    console.log("Mongoose connection successful.");
});


// Routes
// ======

// A GET request to scrape the echojs website
app.get("/scrape", function(req, res) {
    // First, we grab the body of the html with request
    request('http://cookieandkate.com/recipes/', function(error, response, html) {

        if (error) {
            throw error;
        }

        // Load the HTML into cheerio and save it to a variable
        // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
        var $ = cheerio.load(html);

        // Select each instance of the HTML body that you want to scrape
        // NOTE: Cheerio selectors function similarly to jQuery's selectors, 
        // but be sure to visit the package's npm page to see how it works
        //i : index, element: element we selected
        $('div.lcp_catlist_item').each(function(i, element) {

            // var link = $(this).attr("href");
            var title = $(element).children().attr("title");
            var link = $(element).children().attr("href");
            var pic = $(element).find("a").find("img").attr("src");

            // Save these results in an object that we'll push into the result array we defined earlier

        });

    });
    // Tell the browser that we finished scraping the text
    res.send("Scrape Complete");
});

// Listen on port 3000
app.listen(3000, function() {
    console.log("App running on port 3000!");
});
