const jwt = require('jsonwebtoken');


module.exports = (req, res, next) => {
  try { // try to split, but it could fail b/c it isn't present
    const token = req.headers.authorization.split(" ")[1]; // split at white space, token will be at [1]
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    req.userData = { email: decodedToken.email, userId: decodedToken.userId } // adding new field "userData" to request so anyone else handling this request has access to userData
    next(); // execution will continue if verified
  } catch (error) {
    res.status(401).json({
      message: 'You aren\'t authenticated, you may not enter'
    })
  }
};
