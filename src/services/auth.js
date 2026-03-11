/**
 * Auth Service
 * Handles authentication and authorization
 * 
 * Features:
 * - JWT token management
 * - User authentication
 * - Role-based access control (RBAC)
 * - Session management
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';

let isInitialized = false;

/**
 * Initialize auth service
 */
async function initialize() {
  // Any async initialization can go here
  // e.g., loading keys, validating config, etc.
  isInitialized = true;
  console.log('Auth service ready');
}

/**
 * Generate JWT token
 */
function generateToken(payload, options = {}) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: options.expiresIn || JWT_EXPIRY
  });
}

/**
 * Verify JWT token
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Middleware for protected routes
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  req.user = decoded;
  next();
}

/**
 * Check if user has required role
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

module.exports = {
  initialize,
  generateToken,
  verifyToken,
  authenticate,
  requireRole,
  isInitialized: () => isInitialized
};
