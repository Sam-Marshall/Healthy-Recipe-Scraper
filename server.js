// mongodb://heroku_gd8h025t:n4p8gjm9pca1fmbt4q4cdq6oco@ds131512.mlab.com:31512/heroku_gd8h025t

// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");
var path = require("path");
// Requiring our Note and Article models
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");
// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");
// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

var PORT = process.env.PORT || 8080;

// Initialize Express
var app = express();

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

//Sets up handlebars as view engine
app.engine("handlebars", exphbs({
    defaultLayout: 'main',
    partialsDir: path.join(__dirname, '/views/layouts/partials')
}));
app.set("view engine", "handlebars");

// Make public a static dir
app.use(express.static("./public"));

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
app.get("/", function(req, res) {
    res.render('index');
});

// A GET request to scrape the recipe website
app.get("/recipes", function(req, res) {
    // Grab the body of the html with request
    request('http://cookieandkate.com/recipes/', function(error, response, html) {

        if (error) {
            throw error;
        }

        // Load the HTML into cheerio and save it to a variable
        var $ = cheerio.load(html);

        var result = []

        // Select each instance of the HTML body that you want to scrape
        $('div.lcp_catlist_item').each(function(i, element) {

            var title = $(element).children().attr("title");
            var link = $(element).children().attr("href");
            var pic = $(element).find("a").find("img").attr("src");

            if (result.length < 21) {

                result.push({
                    title: title,
                    link: link,
                    pic: pic

                });

            }

        });
        // Tell the browser that we finished scraping the text
        console.log(result);
        res.render("index", { article: result });
    });
});

app.post("/recipes/:title/:link/:pic", function(req, res) {

    var result = {};

    var link = req.params.link;
    var pic = req.params.pic;

    var modLink = link.split('**').join('/');
    var modPic = pic.split('**').join('/');

    result.title = req.params.title;
    result.link = modLink;
    result.pic = modPic;

    var entry = new Article(result);

    // Now, save that entry to the db
    entry.save(function(err, doc) {
        // Log any errors
        if (err) {
            console.log(err);
        }
        // Or log the doc
        else {
            console.log(doc);
        }
    });
});

app.get('/saved', function(req, res) {
    Article.find({}, function(error, doc) {
        if (error) {
            console.log(error);
        } else {
            console.log(doc);
            res.render('saved', { article: doc });
        }
    });
});

app.delete('/saved/:id', function(req, res) {
    Article.remove({ "_id": req.params.id }, function(error, doc) {
        if (error) {
            console.log(error);
        } else {
            console.log(doc);
        }
    });
});

app.listen(PORT, function() {
    console.log("App running on port 8080!");
});
