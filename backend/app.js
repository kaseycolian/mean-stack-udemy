const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const postsRoutes = require("./routes/posts.js");

const app = express();

// replace 'test' w/ whatever you want your db folder to be ie: node-angular
// colletion in db will automatically be named the plural form of model name (ie: post.js from models dir)
mongoose.connect("mongodb+srv://kaseycolian:KGK1Q6UraKrFnrUz@cluster0-07gmc.mongodb.net/node-angular?retryWrites=true", { useNewUrlParser: true})
  .then(() => {
    console.log('Connected to DB! Go Goose!');
  })
  .catch((e) => {
    console.log(`Connected failed because: ${e}`)
  });

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS, PUT"
  );
  next();
});

// makes the app aware of the postRoutes import
// only requests where path of url starts with api/posts will be forwarded to postsRoutes
app.use("/api/posts", postsRoutes);

module.exports = app;
