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
mongoose.connect("mongodb://heroku_gd8h025t:n4p8gjm9pca1fmbt4q4cdq6oco@ds131512.mlab.com:31512/heroku_gd8h025t");
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
//A GET request to populate the / page
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

//A POST request to add a recipe to the db
app.post("/recipes/:title/:link/:pic", function(req, res) {

    var result = {};

    var link = req.params.link;
    var pic = req.params.pic;

    var modLink = link.split('**').join('/');
    var modPic = pic.split('**').join('/');

    var finalLink = modLink.replace('http', 'https');
    var finalPic = modPic.replace('http', 'https');

    result.title = req.params.title;
    result.link = finalLink;
    result.pic = finalPic;

    var entry = new Article(result);

    // Save that entry to the db
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

// A GET request to populate the saved recipe page
app.get('/saved', function(req, res) {
    Article.find({})
        .populate("note")
        .exec(function(error, doc) {
            if (error) {
                console.log(error);
            } else {
                console.log(doc);
                res.render('saved', { article: doc });
            }
        });
});

// A POST request to save a new note to the db and associate the new note to an article already in the db
app.post("/saved/:id/:note", function(req, res) {
    var result = {};
    result.comment = req.params.note;

    var newNote = new Note(result);

    // Save the new note the db
    newNote.save(function(error, doc) {
        // Log any errors
        if (error) {
            console.log(error);
        }
        // Otherwise
        else {
            // Use the article id to find and update it's note array
            Article.update({ "_id": req.params.id }, { $push: { "note": doc._id } })
                // Execute the above query
                .exec(function(err, doc) {
                    // Log any errors
                    if (err) {
                        console.log(err);
                    } else {
                        // Or send the document to the browser
                        res.send(doc);
                    }
                });
        }
    });
});

//Get a single Article and its' Notes by id
app.get('/saved/:id', function(req, res) {

    Article.find({ "_id": req.params.id })
        .populate("note")
        .exec(function(error, doc) {
            if (error) {
                console.log(error);
            } else {
                console.log(doc);
            }
        });

})

//A DELETE request to remove an Article from the db
app.delete('/saved/:id', function(req, res) {

    Article.remove({ "_id": req.params.id }, function(error, doc) {
        if (error) {
            console.log(error);
        } else {
            console.log(doc);
        }
    });

});

//A DELETE request to remove a Note from the db
app.delete('/comment/:id', function(req, res) {

    Note.remove({ "_id": req.params.id }, function(error, doc) {
        if (error) {
            console.log(error);
        } else {
            console.log(doc);
        }
    });

});

//Start the server
app.listen(PORT, function() {
    console.log("App running on port 8080!");
});
