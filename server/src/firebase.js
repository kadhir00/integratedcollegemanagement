// server/src/firebase.js
// Initializes Firebase Admin SDK.
// In Cloud Run the default credentials are used; locally we read env vars.

const admin = require('firebase-admin');

if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
  // Local development – use service account credentials from env vars.
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Private key may contain escaped newlines.
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
} else {
  // Cloud Run / production – use the default service account.
  admin.initializeApp();
}

module.exports = admin;
