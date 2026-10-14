// server/src/middleware/verifyToken.js
const admin = require('../firebase');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const match = authHeader.match(/^Bearer (.+)$/);
  if (!match) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }
  const idToken = match[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    // Expect a custom claim "role"
    req.user = { uid: decoded.uid, role: decoded.role || decoded.claims?.role || 'student' };
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(401).json({ error: 'Invalid ID token' });
  }
};
