// mongoose model

const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

//need to create a schema for our data structure
const userSchema = mongoose.Schema({
  // unique allows mongoose & mongodb to perform optimumly knowing it will be unique
  email: { type: String, required: true, unique: true }, // unique doesn't act as validator - need to validate uniqueness elsewhere
  password: { type: String, required: true }
});

userSchema.plugin(uniqueValidator); // validates that email is unique when signing up


module.exports = mongoose.model('User', userSchema);
