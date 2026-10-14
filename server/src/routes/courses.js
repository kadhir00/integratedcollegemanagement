// server/src/routes/courses.js
// Admin routes for course management and enrollments
const express = require('express');
const router = express.Router();
const admin = require('../firebase');
const db = admin.firestore();
const requireRole = require('../middleware/requireRole');
const Joi = require('joi');

// All routes require admin role
router.use(requireRole('admin'));

// Validation schema for course creation/edit
const courseSchema = Joi.object({
  code: Joi.string().required(), // e.g., CS101
  name: Joi.string().required(),
  department: Joi.string().optional(),
  semester: Joi.number().integer().optional()
});

// GET /api/courses – list with enrollment counts
router.get('/', async (req, res, next) => {
  try {
    const snapshot = await db.collection('courses').get();
    const courses = [];
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const enrollSnap = await db.collection('enrollments')
        .where('courseId', '==', doc.id).get();
      data.id = doc.id;
      data.enrollmentCount = enrollSnap.size;
      courses.push(data);
    }
    res.json(courses);
  } catch (err) {
    next(err);
  }
});

// GET /api/courses/:id – details with roster (student IDs)
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('courses').doc(id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Course not found' });
    const course = doc.data();
    const enrollSnap = await db.collection('enrollments')
      .where('courseId', '==', id).get();
    const roster = [];
    for (const e of enrollSnap.docs) {
      const { studentId } = e.data();
      const stuDoc = await db.collection('users').doc(studentId).get();
      if (stuDoc.exists) roster.push({ id: studentId, ...stuDoc.data() });
    }
    course.id = id;
    course.roster = roster;
    res.json(course);
  } catch (err) {
    next(err);
  }
});

// POST /api/courses – create course
router.post('/', async (req, res, next) => {
  try {
    const { error, value } = courseSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const docRef = await db.collection('courses').add(value);
    res.status(201).json({ id: docRef.id, ...value });
  } catch (err) {
    next(err);
  }
});

// PUT /api/courses/:id – edit course
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = courseSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    await db.collection('courses').doc(id).set(value, { merge: true });
    res.json({ id, ...value });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/courses/:id – delete course and related enrollments
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    // Delete enrollments for this course
    const enrollSnap = await db.collection('enrollments').where('courseId', '==', id).get();
    const batch = db.batch();
    enrollSnap.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    // Delete course doc
    await db.collection('courses').doc(id).delete();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/courses/:id/enroll – enroll a student (id in body)
router.post('/:id/enroll', async (req, res, next) => {
  try {
    const { id: courseId } = req.params;
    const { studentId } = req.body;
    if (!studentId) return res.status(400).json({ error: 'studentId required' });
    // Use deterministic doc ID to prevent duplicates
    const enrollId = `${courseId}_${studentId}`;
    const enrollRef = db.collection('enrollments').doc(enrollId);
    const existing = await enrollRef.get();
    if (existing.exists) return res.status(409).json({ error: 'Student already enrolled' });
    await enrollRef.set({ courseId, studentId, enrolledAt: admin.firestore.FieldValue.serverTimestamp() });
    res.status(201).json({ courseId, studentId });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/courses/:id/enroll/:studentId – remove enrollment
router.delete('/:id/enroll/:studentId', async (req, res, next) => {
  try {
    const { id: courseId, studentId } = req.params;
    const enrollId = `${courseId}_${studentId}`;
    await db.collection('enrollments').doc(enrollId).delete();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
