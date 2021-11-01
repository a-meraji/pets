const mongoose = require("mongoose");

const petSchema = new mongoose.Schema({
  ownerID: {
    type: String,
    required: [true, "unable to verify user"],
  },
  name: {
    type: String,
    required: false,
  },
  species: {
    type: String,
    required: [true, "please select the species of your animal"],
  },
  race: {
    type: String,
    required: false,
  },
  age: {
    type: Number,
    required: [true, "please enter the age of your animal"],
  },
  gender: {
    type: String,
    required: [true, "please select the gender of your animal"],
  },
  vaccine_card: {
    type: Boolean,
    required: false,
  },
  tags: {
    type: Array,
    required: false,
  },
  lng: {
    type: Number,
    required: [true, "location not provided"],
  },
  lat: {
    type: Number,
    required: [true, "location not provided"],
  },
  city: {
    type: String,
    required: false,
  },
  country: {
    type: String,
    required: [true, "location not provided"],
  },
});

petSchema.post("save", (doc, next) => {
  console.log("new user pet created and saved");
  next();
});

const Pet = mongoose.model("pet", petSchema);

module.exports = Pet;