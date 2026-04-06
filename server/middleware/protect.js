const jwt = require('jsonwebtoken')

// This function runs BEFORE any protected route
// It checks: "is this user actually logged in?"
const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]  // get token from header

  if (!token) {
    return res.status(401).json({ message: 'No token, access denied' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded  // attach user info to the request
    next()              // move on to the actual route
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' })
  }
}

module.exports = protect