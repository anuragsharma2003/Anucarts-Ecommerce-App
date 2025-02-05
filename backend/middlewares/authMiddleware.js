const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key'; // Use same secret key as in login

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Extract token from Authorization header

  if (!token) {
    return res.status(401).json({ message: 'Token is required' });
  }

  // Verify the token with the same JWT_SECRET
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Attach userId and sellerId to the request object if available
    if (decoded.userId) {
      req.userId = decoded.userId; // For user-related routes
    } else if (decoded.sellerId) {
      req.sellerId = decoded.sellerId; // For seller-related routes
    } else {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    next();
  });
};

module.exports = verifyToken;