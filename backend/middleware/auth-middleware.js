const jwt = require('jsonwebtoken');
const User = require('../models/user');
function validateToken(req, res, next) {
   
  const token = req.headers.authorization;
  if (!token) {
    return res.send({ message: 'Authentication failed.' });
  }
  try {
    const decodedToken = jwt.verify(token, process.env.TOKEN_KEY);
    req.clientIp = req.socket.remoteAddress.replace('::ffff:', '');
    //console.log(req.headers['user-agent']);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.log(error)
    return res.status(401).json({ message: 'Authentication failed. Invalid token.' });
  }
}

module.exports = validateToken;