const mongoose = require('mongoose');

//need to create a schema for our data structure
const postSchema = mongoose.Schema({
  title: { type: String, required: true }, //cap S for node.js lowercase for ts
  content: { type: String, default: "You should've typed content" }
});

module.exports = mongoose.model('PostEntry', postSchema);
