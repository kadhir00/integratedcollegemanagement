// server/src/routes/auth.js
const express = require('express');
const router = express.Router();
const admin = require('../firebase');
const verifyToken = require('../middleware/verifyToken');

// GET /api/auth/me – returns basic profile info
router.get('/me', verifyToken, async (req, res, next) => {
  try {
    const { uid, role } = req.user;
    // Fetch user document from Firestore for additional fields (name, email)
    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};
    const response = {
      uid,
      email: userData.email || null,
      name: userData.name || null,
      role: role || userData.role || null,
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
