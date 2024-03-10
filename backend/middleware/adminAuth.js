// adminAuth.js

const authorizeAdmin = (req, res, next) => {
  // Check if the user is an admin
  if (req.admin && req.admin.role === 'admin') {
    // User is an admin, grant access
    next();
  } else {
    // User is not authorized, return an error response
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

module.exports = authorizeAdmin;
