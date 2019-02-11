const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

exports.createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10).then(hash => {
    const user = new User({
      email: req.body.email,
      password: hash // needs to be encrypted, not just received from req.body.password, so it goes through bcrypt is encrypted
    });
    user
      .save()
      .then(result => {
        res.status(201).json({
          message: "User Created!",
          result: result
        });
      })
      .catch(err => {
        res.status(500).json({
          message: `Email already exists in DB`
        });
      });
  });
};

exports.login = (req, res, next) => {
  let fetchedUser;
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(401).json({
          message: "Auth failed. No user found"
        });
      }
      fetchedUser = user;
      return bcrypt.compare(req.body.password, user.password); //this will return a promise of true/false
    })
    .then(result => {
      if (!result) {
        // if false(doesn't match)
        return res.status(401).json({
          message: "Password auth failed"
        });
      }
      const token = jwt.sign(
        { email: fetchedUser.email, userId: fetchedUser._id }, // creates new token w/ desired input data ie: email & user ID
        process.env.JWT_KEY, // this is required & used to validate hashes
        { expiresIn: "1h" } // duration of how long the token will last
      );
      res.status(200).json({
        token: token,
        expiresIn: 3600,
        userId: fetchedUser._id, // take from fetchedUser & not token to avoid performance issues decoding
        message: `Signup Success! with token: ${token}`
      });
    })
    .catch(err => {
      return res.status(401).json({
        message: `Password auth failed for unknown reasons: ${err}`
      });
    });
};


