// server/src/routes/users.js
// Admin routes for user management
const express = require('express');
const router = express.Router();
const admin = require('../firebase');
const db = admin.firestore();
const requireRole = require('../middleware/requireRole');
const Joi = require('joi');

// Middleware: only admin can access
router.use(requireRole('admin'));

// Helper: build Firestore query with filters
function applyFilters(query, params) {
  const { role, department, semester, search } = params;
  if (role) query = query.where('role', '==', role);
  if (department) query = query.where('department', '==', department);
  if (semester) query = query.where('semester', '==', Number(semester));
  // Firestore doesn't support case‑insensitive text search; we fetch and filter in code
  return query;
}

// GET /api/users – list with filters & pagination
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, department, semester, search } = req.query;
    let query = applyFilters(db.collection('users'), { role, department, semester, search });
    const snapshot = await query.get();
    let users = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      data.id = doc.id;
      users.push(data);
    });
    // In‑memory case‑insensitive search on name, rollNumber, facultyId, email
    if (search) {
      const term = search.toLowerCase();
      users = users.filter(u =>
        (u.name && u.name.toLowerCase().includes(term)) ||
        (u.rollNumber && u.rollNumber.toLowerCase().includes(term)) ||
        (u.facultyId && u.facultyId.toLowerCase().includes(term)) ||
        (u.email && u.email.toLowerCase().includes(term))
      );
    }
    const start = (page - 1) * limit;
    const paged = users.slice(start, start + Number(limit));
    res.json({ total: users.length, page: Number(page), limit: Number(limit), data: paged });
  } catch (err) {
    next(err);
  }
});

// Validation schema for user creation
const userSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().required(),
  role: Joi.string().valid('admin', 'faculty', 'student').required(),
  department: Joi.string().optional(),
  semester: Joi.number().integer().optional(),
  rollNumber: Joi.string().optional(), // for students
  facultyId: Joi.string().optional()   // for faculty
});

// POST /api/users – create Auth account + Firestore doc
router.post('/', async (req, res, next) => {
  try {
    const { error, value } = userSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const { email, name, role, department, semester, rollNumber, facultyId } = value;

    // Enforce unique rollNumber / facultyId
    if (rollNumber) {
      const dup = await db.collection('users').where('rollNumber', '==', rollNumber).get();
      if (!dup.empty) return res.status(409).json({ error: 'Roll number already exists' });
    }
    if (facultyId) {
      const dup = await db.collection('users').where('facultyId', '==', facultyId).get();
      if (!dup.empty) return res.status(409).json({ error: 'Faculty ID already exists' });
    }

    const password = process.env.SEED_PASSWORD || 'TempPass123!'; // fallback
    const created = await admin.auth().createUser({ email, password, displayName: name });
    await admin.auth().setCustomUserClaims(created.uid, { role });
    const userDoc = {
      email,
      name,
      role,
      department: department || null,
      semester: semester || null,
      rollNumber: rollNumber || null,
      facultyId: facultyId || null
    };
    await db.collection('users').doc(created.uid).set(userDoc);
    res.status(201).json({ uid: created.uid, ...userDoc });
  } catch (err) {
    next(err);
  }
});

// PUT /api/users/:id – update Firestore doc (role cannot be changed here)
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    // Disallow role change via this endpoint
    if (updates.role) delete updates.role;
    await db.collection('users').doc(id).set(updates, { merge: true });
    res.json({ id, ...updates });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/users/:id – remove Auth account and Firestore doc + enrollments
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    // Delete enrollments where this user is a student
    const enrollSnap = await db.collection('enrollments').where('studentId', '==', id).get();
    const batch = db.batch();
    enrollSnap.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    // Delete user doc
    await db.collection('users').doc(id).delete();
    // Delete Auth account
    await admin.auth().deleteUser(id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
