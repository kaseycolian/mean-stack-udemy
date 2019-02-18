const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const postsRoutes = require('./routes/posts');
const userRoutes = require('./routes/user');

const app = express();

// replace 'test' w/ whatever you want your db folder to be ie: node-angular
// colletion in db will automatically be named the plural form of model name (ie: post.js from models dir)
// during pass auth portion of course, there was a cyclic dependency error that caused crash due bug in mongoose
  // if this happens, remove '?retryWrites=true' from URL.

mongoose.connect('mongodb+srv://kaseycolian:' + process.env.MONGO_ATLAS_PASSWORD + '@cluster0-07gmc.mongodb.net/node-angular?retryWrites=true',
  { useNewUrlParser: true })
  .then(() => {
    console.log('Connected to DB! Go Goose!');
  })
  .catch((e) => {
    console.log(`Connected failed because: ${e}`)
    res.status(500).json({
      message: `Cannot connect to Mongo: ${e}`
    })
  });

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  // join lets us forward the request to the actual path of the dir
  app.use('/backend/images', express.static(path.join(__dirname, 'images'))); //allows us to have access to only this directory

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE, OPTIONS, PUT'
  );
  next();
});

// makes the app aware of the postRoutes import
// only requests where path of url starts with api/posts will be forwarded to postsRoutes
app.use('/api/posts', postsRoutes);
app.use('/api/user', userRoutes); //any url that goes to api/user will go to user routes

module.exports = app;
