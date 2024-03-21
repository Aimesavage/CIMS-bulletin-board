const mongoose = require('mongoose');

    // Define the Poster Schema with more detailed fields
  const posterSchema = new mongoose.Schema({
    ID: String,
    name: String,
    date: Date,
  });

  const Poster = mongoose.model("Poster", posterSchema);

  const userSchema = new mongoose.Schema({
    email: String,
    password: String

  });

  const User = mongoose.model("User", userSchema);

  
  const reviewSchema = new mongoose.Schema({
    review: String
  })
  
  const Review = mongoose.model("Review", reviewSchema)
  module.exports = {Poster, User, Review};

