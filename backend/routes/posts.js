const express = require("express");
const checkAuth = require("../middleware/check-auth");
const extractFile = require('../middleware/multer-file');

const PostsControllers = require("../controllers/posts");

const router = express.Router();



// able to pass multiple args before (req, res, next)
// single -> expects single file -> multer will try to extract single file from req
// then try to find it in image property in req.body
router.post(
  "",
  checkAuth,
  extractFile,
  PostsControllers.createPost
);

// patch updates resource w/ new values - patch would work here too
// put does a whole new object.
router.put(
  "/:post_id",
  checkAuth,
  extractFile,
  PostsControllers.savePost
);

router.get("", PostsControllers.getPosts);

// get an individual post to return in the post.service to then handle in post-create.component
router.get("/:post_id", PostsControllers.getPost);

// id_of_post is being passed from the front
// params gives us access to all encoded parameters
router.delete("/:post_id", checkAuth, PostsControllers.deletePost);

module.exports = router;
