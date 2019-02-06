// mongoose model

const mongoose = require('mongoose');

//need to create a schema for our data structure
const postSchema = mongoose.Schema({
  title: { type: String, required: true }, //cap S for node.js lowercase for ts
  content: { type: String, default: "You should've typed content", required: true },
  imagePath: { type: String, required: true },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  creatorEmail: { type: String, required: true }
});

module.exports = mongoose.model('PostEntry', postSchema);
