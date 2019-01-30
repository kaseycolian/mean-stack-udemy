const express = require('express');
const PostEntry = require("../models/post");


const router = express.Router();

router.post("", (req, res, next) => {
  const post = new PostEntry({
    title: req.body.title,
    content: req.body.content
  });
  console.log(`This is the post and is logging on the express server: ${post}`);
  post.save().then(createdPost => { // .save is provided by mongoose module -> inserts new entry w/ built-in query
    res.status(201).json({ // need to return a response - 201 means new resource was created
      message: 'Post added successfully!',
      postId: createdPost._id
    });
  });
});

// patch updates resource w/ new values - patch would work here too
// put does a whole new object.
router.put("/:post_id", (req, res, next) => {
  const post = new PostEntry({
    _id: req.body.id, // this comes from the incoming Post
    title: req.body.title,
    content: req.body.content
  });
  //the req.params.post_id is the same ID from the route url
  PostEntry.updateOne({_id: req.params.post_id}, post).then(result => {
    console.log(result);
    res.status(200).json({ message: 'Update successful!' });
  })
});

router.get("",(req, res, next) => { //can also get router.get
  PostEntry.find().then(documents => { // this works like a promise when the data/"documents" are returned
    console.log(`These are being returned from the DB: ${documents}`)
    res.status(200).json({  // this is async, so the return needs to be in same block as find to finish executing before moving on.
      message: 'Posts fetched successfully!',
      posts: documents
    });
  });
});

router.get("/:post_id", (req, res, next) => {
  PostEntry.findById(req.params.post_id).then(post => {
    if (post) {
      res.status(200).json(post); //if post found, return 200 with post data as json
    } else {
      res.status(404).json({message: 'Post not found!'}); //respond w/ 404 w/ json body containing msg
    }
  });

});

// id_of_post is being passed from the front
// params gives us access to all encoded parameters
router.delete("/:post_id", (req, res, next) => {
  PostEntry.deleteOne({ _id: req.params.post_id }).then(result => { // need the db version of id -> _id
    console.log(`The result for deleting ${req.params.post_id} is: ${result}`);
    res.status(200).json({ message: 'Post deleted :(' });
  })
  .catch((e) => {
    console.log(`Error deleting post because: ${e}`);
  });
});

module.exports = router;
