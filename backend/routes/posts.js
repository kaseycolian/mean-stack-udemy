const express = require('express');
const PostEntry = require("../models/post");
const multer = require('multer'); // for image upload
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error('Invalid mime type');
    if (isValid) {
      error = null;
    }
    cb(error,"backend/images"); //relative path from server.js file
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + '-' + Date.now() + '.' + ext);
  }
});
// able to pass multiple args before (req, res, next)
// single -> expects single file -> multer will try to extract single file from req
// then try to find it in image property in req.body
router.post(
  "",
  checkAuth,
  multer({ storage: storage }).single('image'),
  (req, res, next) => {
    // constructs a url to  (to access where the files are stored)
    const url = req.protocol + '://' + req.get('host'); //req.protocol is http or https
    const post = new PostEntry({
      title: req.body.title,
      content: req.body.content,
      imagePath: url + '/images/' + req.file.filename, //be able to enter domain/images & multer will have file property w/ filename
      // this is what's being stored in DB instead of actual image
      // must have "/" on both sides of images to enter & access dir
      creatorId: req.userData.userId,
      creatorEmail: req.userData.email
    });
    console.log(`This is the post and is logging on the express server: ${post}`);
    post.save()
      .then(createdPost => { // .save is provided by mongoose module -> inserts new entry w/ built-in query
        res.status(201).json({ // need to return a response - 201 means new resource was created
          message: ` ${createdPost.title} added successfully!`,
          post: {
            title: createdPost.title,
            content: createdPost.content,
            imagePath: createdPost.imagePath,
            // ...createdPost, // spread operator will copy all props of createdPost obj (title, content, imagePath)
            id: createdPost._id, // this will set an extra field of the createdPost obj since it doesn't have id
            email: createdPost.creatorEmail
          }
        });
      })
      .catch(err => {
        return res.status(500).json({
          message: `Post could not save: ${err}`
        })
      })
  });

// patch updates resource w/ new values - patch would work here too
// put does a whole new object.
router.put(
  "/:post_id",
  checkAuth,
  multer({ storage: storage }).single('image'),
  (req, res, next) => {
    let imagePath = req.body.imagePath;
    // this allows uploading a new file image by post edit
    if (req.file) { // on editting post, if there's a new file, then we know a new image was uploaded
      console.log(`Updating file with: ${req.file}`);
      const url = req.protocol + '://' + req.get('host');
      imagePath = url + '/images/' + req.file.filename
    }
    const post = new PostEntry({
      _id: req.body.id, // this comes from the incoming Post
      title: req.body.title,
      content: req.body.content,
      imagePath: imagePath,
      creatorId: req.userData.userId,
      creatorEmail: req.userData.email
    });
    //the req.params.post_id is the same ID from the route url
    PostEntry.updateOne({ _id: req.params.post_id, creatorId: req.userData.userId }, post)
    .then(result => {
      if (result.nModified > 0) {
        res.status(200).json({
          message: "Post was updated successfully!"
        });
      } else {
        res.status(401).json({
          message: "Not authorized. Must be logged in as creator of post."
        });
      }
    })
    .catch(error => {
      return res.status(500).json({
        message: `Could not update post: ${error}`
      })
    })
  });

router.get("", (req, res, next) => { //can also get router.get
  const postQuery = PostEntry.find(); //default finds all
  // query parms - optional paramenters added to url /api/posts?pagesize=1&page=2
  // console.log( req.query);
  // express will grab query obj from params in url & querying is done by mongoose
  const pageSize = +req.query.pagesize; // "+" converts string to int like .to_i
  const currentPage = +req.query.page;
  let fetchedPosts;
  if (pageSize && currentPage) {
    // if these both have values
    postQuery // ie: (pageSize = 10) * (currentPage= 3 - 1) = display on pg 3: skip 20 posts to get to pg 3
      .skip(pageSize * (currentPage - 1)) // if on pg 2, we want to skip all items on pg 1
      .limit(pageSize); // limit amount to the amount of posts allowed on a page ie: 1, 2, 5, 10
  }
  postQuery
    .then(documents => {
      // this works like a promise when the data/"documents" are returned
      console.log(`Posts returned from the DB: ${documents}`);
      fetchedPosts = documents;
      return PostEntry.count(); // returns amount of posts as a promise (it's being returned in a then block)
    })
    .then(count => {
      res.status(200).json({
        message: "Posts fetched with success!",
        posts: fetchedPosts,
        maxPosts: count
      });
    })
    .catch(error => {
      return res.status(500).json({
        message: `Could not fetch posts: ${error}`
      })
    })
});

// get an individual post to return in the post.service to then handle in post-create.component
router.get("/:post_id", (req, res, next) => {
  PostEntry.findById(req.params.post_id)
    .then(post => {
      if (post) {
        res.status(200).json(post); //if post found, return 200 with post data as json
      } else {
        res.status(404).json({ message: 'Post not found!' }); //respond w/ 404 w/ json body containing msg
      }
    })
    .catch(error => {
      return res.status(500).json({
        message: `Could not fetch post: ${error}`
      })
    })
});

// id_of_post is being passed from the front
// params gives us access to all encoded parameters
router.delete("/:post_id", checkAuth, (req, res, next) => {
  PostEntry.deleteOne({ _id: req.params.post_id, creatorId: req.userData.userId })
  .then(result => { // need the db version of id -> _id
    console.log(result);
    if (result.deletedCount == 1) {
      res.status(200).json({ message: 'Post deleted :(' });
    } else {
      res.status(401).json({message: 'Not authorized. Must be logged in as creator of post'})
    }
  })
    .catch(error => {
      return res.status(500).json({
        message: `Could not connect to delete: ${error}`
      });
    });
});

module.exports = router;
