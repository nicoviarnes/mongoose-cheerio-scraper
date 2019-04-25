var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new BeerSchema object
// This is similar to a Sequelize model
var BeerSchema = new Schema({
  rank: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  reviews: {
    type: Number,
    required: true
  },
  abv: {
    type: Number,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  throwAway: {
    type: String
  },
  url: {
    type: String,
    required: true
  },
  // `note` is an object that stores a Note id
  // The ref property links the ObjectId to the Note model
  // This allows us to populate the Beer with an associated Note
  note: {
    type: Schema.Types.ObjectId,
    ref: "Note"
  }
});

// This creates our model from the above schema, using mongoose's model method
var Beer = mongoose.model("Beer", BeerSchema);

// Export the Beer model
module.exports = Beer;
