// server/scripts/seed.js
// Seed script to create initial users in Firebase Auth and Firestore.
// Idempotent: skips existing users based on email.

require('dotenv').config({ path: '../.env' }); // load env variables
const admin = require('../src/firebase');
const db = admin.firestore();

const SEED_PASSWORD = process.env.SEED_PASSWORD || 'defaultSeedPass123';

// Define users to create
const users = [
  { email: 'admin@example.com', name: 'Admin User', role: 'admin' },
  { email: 'faculty1@example.com', name: 'Faculty One', role: 'faculty' },
  { email: 'faculty2@example.com', name: 'Faculty Two', role: 'faculty' },
  { email: 'student1@example.com', name: 'Student One', role: 'student' },
  { email: 'student2@example.com', name: 'Student Two', role: 'student' },
  { email: 'student3@example.com', name: 'Student Three', role: 'student' },
  { email: 'student4@example.com', name: 'Student Four', role: 'student' },
  { email: 'student5@example.com', name: 'Student Five', role: 'student' },
];

async function createUserIfNotExists(user) {
  try {
    // Try to get existing user by email
    const existing = await admin.auth().getUserByEmail(user.email);
    console.log(`User ${user.email} already exists, UID: ${existing.uid}`);
    // Ensure Firestore doc exists (idempotent upsert)
    await db.collection('users').doc(existing.uid).set(
      { email: user.email, name: user.name, role: user.role },
      { merge: true }
    );
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      // Create new user with password and custom claim
      const newUser = await admin.auth().createUser({
        email: user.email,
        password: SEED_PASSWORD,
        displayName: user.name,
      });
      // Set custom claim for role
      await admin.auth().setCustomUserClaims(newUser.uid, { role: user.role });
      console.log(`Created user ${user.email} with UID ${newUser.uid}`);
      // Create Firestore document
      await db.collection('users').doc(newUser.uid).set({
        email: user.email,
        name: user.name,
        role: user.role,
      });
    } else {
      console.error(`Error checking user ${user.email}:`, err);
    }
  }
}

async function main() {
  for (const u of users) {
    await createUserIfNotExists(u);
  }
  console.log('Seeding completed.');
  process.exit(0);
}

main();
