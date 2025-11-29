const admin = require("firebase-admin");

// Read service account credentials from environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = {
  db: admin.firestore(),
  auth: admin.auth(),
  storage: admin.storage(),
};
