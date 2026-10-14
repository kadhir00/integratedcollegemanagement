// server/src/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const admin = require('./firebase');
const verifyToken = require('./middleware/verifyToken');
const requireRole = require('./middleware/requireRole');
const errorHandler = require('./middleware/errorHandler');

const usersRouter = require('./routes/users');
const coursesRouter = require('./routes/courses');

// Admin routes – protected by requireRole('admin') inside route files
app.use('/api/users', usersRouter);
app.use('/api/courses', coursesRouter);


const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Health check
app.use('/api/health', healthRouter);

// Auth routes (protected by verifyToken for /me)
app.use('/api/auth', authRouter);

// Example protected route placeholder
// app.use('/api/protected', verifyToken, requireRole('admin'), (req, res) => {
//   res.json({ message: 'protected admin route' });
// });

// Centralized error handling (must be after all routes)
app.use(errorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
