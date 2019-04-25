// Require npm packages
var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

// Set port to listen on
var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Use morgan logger for logging requests
app.use(logger("dev"));

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/beer";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// Routes

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
  axios.get("https://www.ratebeer.com/top").then(function(response) {
    var $ = cheerio.load(response.data);
    var result = {};
    var beers = [];
    var urls = [];

    $("table td").each(function(i, element) {
      beers.push($(this).text());
      urls.push(
        $(this)
          .children("a")
          .attr("href")
      );
    });

    urls = urls.filter(u => u !== undefined);
    var chunk_size = 6;
    var groups = beers
      .map(function(e, i) {
        return i % chunk_size === 0 ? beers.slice(i, i + chunk_size) : null;
      })
      .filter(function(e) {
        return e;
      });

    for (var i = 0; i < groups.length; i++) {
      groups[i].push(urls[i]);
    }

    groups.forEach(group => {
      result.rank = parseInt(group[0]);
      result.name = group[1];
      result.reviews = parseInt(group[2]);
      result.abv = parseFloat(group[3]);
      result.score = parseFloat(group[4]);
      result.throwAway = group[5];
      result.url = group[6];

      db.Beer.create(result)
        .then(function(dbBeer) {
          // View the added result in the console
          console.log(dbBeer);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
    });

    // Send a message to the client
    return res.redirect("/");
  });
});

// Route for getting all Articles from the db
app.get("/beers", function(req, res) {
  // Grab every document in the Articles collection
  db.Beer.find({})
    .then(function(dbBeer) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbBeer);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/beers/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Beer.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbBeer) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbBeer);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/beers/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Beer.findOneAndUpdate(
        { _id: req.params.id },
        { note: dbNote._id },
        { new: true }
      );
    })
    .then(function(dbBeer) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbBeer);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.get("/cleardata", function(req, res) {
  db.Beer.deleteMany({}, function (err) {
    if (err) return handleError(err);
  }).then(function() {
    db.Note.deleteMany({}, function (err) {
      if (err) return handleError(err);
    }).then(function(){
      return res.redirect("/")
    })
  })
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
