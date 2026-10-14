// server/src/middleware/requireRole.js
module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user && req.user.role;
    if (!userRole) {
      return res.status(403).json({ error: 'No role found' });
    }
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
