const PostEntry = require("../models/post");

exports.createPost = (req, res, next) => {
  // constructs a url to  (to access where the files are stored)
  const url = req.protocol + "://" + req.get("host"); //req.protocol is http or https
  const post = new PostEntry({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + "/backend/images/" + req.file.filename, //be able to enter domain/images & multer will have file property w/ filename
    // this is what's being stored in DB instead of actual image
    // must have "/" on both sides of images to enter & access dir
    creatorId: req.userData.userId,
    creatorEmail: req.userData.email
  });
  console.log(`This is the post and is logging on the express server: ${post}`);
  post
    .save()
    .then(createdPost => {
      // .save is provided by mongoose module -> inserts new entry w/ built-in query
      res.status(201).json({
        // need to return a response - 201 means new resource was created
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
      });
    });
};

exports.savePost = (req, res, next) => {
  let imagePath = req.body.imagePath;
  // this allows uploading a new file image by post edit
  if (req.file) {
    // on editting post, if there's a new file, then we know a new image was uploaded
    console.log(`Updating file with: ${req.file}`);
    const url = req.protocol + "://" + req.get("host");
    imagePath = url + "/backend/images/" + req.file.filename;
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
  PostEntry.updateOne(
    { _id: req.params.post_id, creatorId: req.userData.userId },
    post
  )
    .then(result => {
      if (result.n > 0) {
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
      });
    });
};

exports.getPosts = (req, res, next) => {
  //can also get router.get
  const postQuery = PostEntry.find(); //default finds all
  // query parms - optional paramenters added to url /api/posts?pagesize=1&page=2
  // express will grab query obj from params in url & querying is done by mongoose
  const pageSize = +req.query.pagesize; // "+" converts string to int like .to_i
  const currentPage = +req.query.page;
  console.log(req);
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
      });
    });
};

exports.getPost = (req, res, next) => {
  PostEntry.findById(req.params.post_id)
    .then(post => {
      if (post) {
        res.status(200).json(post); //if post found, return 200 with post data as json
      } else {
        res.status(404).json({ message: "Post not found!" }); //respond w/ 404 w/ json body containing msg
      }
    })
    .catch(error => {
      return res.status(500).json({
        message: `Could not fetch post: ${error}`
      });
    });
};

exports.deletePost = (req, res, next) => {
  PostEntry.deleteOne({
    _id: req.params.post_id,
    creatorId: req.userData.userId
  })
    .then(result => {
      // need the db version of id -> _id
      console.log(result);
      if (result.deletedCount == 1) {
        res.status(200).json({ message: "Post deleted :(" });
      } else {
        res.status(401).json({
          message: "Not authorized. Must be logged in as creator of post"
        });
      }
    })
    .catch(error => {
      return res.status(500).json({
        message: `Could not connect to delete: ${error}`
      });
    });
};
