// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { db, auth } = require('./src/config/firebase'); // Import Firebase config
const { sendEmail, transporter } = require('./mailer'); // Import our mailer module

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

// ----------------- Routes -----------------

// health
app.get('/', (req, res) => res.send('EnergyReminder backend running'));

// Register with Firebase Auth: POST /api/register   { email, password }
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email & password required' });

    // Get user from Firebase Auth. If they don't exist, create them.
    // This makes the endpoint idempotent for registration.
    let userRecord;
    try {
      userRecord = await auth.createUser({ email, password });
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        userRecord = await auth.getUserByEmail(email);
      } else {
        throw error; // Re-throw other errors
      }
    }

    // Create user document in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email: userRecord.email,
      createdAt: new Date().toISOString(),
    }, { merge: true }); // Use merge:true to avoid overwriting if doc already exists

    // Create a custom JWT for your application's session management
    const token = jwt.sign({ id: userRecord.uid, email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ ok: true, userId: userRecord.uid, token });
  } catch (err) {
    console.error('Register error', err.code, err.message);
    if (err.code === 'auth/email-already-exists') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login with Firebase ID Token: POST /api/firebase-login { token }
// The client should sign in using the Firebase SDK and send the resulting ID token here.
app.post('/api/firebase-login', async (req, res) => {
  try {
    const { token: idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: 'Firebase ID token required' });
    }

    // Verify the ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    const { uid, email } = decodedToken;

    // Check if user exists in Firestore (optional, but good practice)
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      // This case might happen if the Firestore doc was deleted but the Auth user wasn't.
      // We can create it here.
      await db.collection('users').doc(uid).set({ email, createdAt: new Date().toISOString() });
    }

    // Create a custom JWT for your application's session management
    const token = jwt.sign({ id: uid, email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ ok: true, userId: uid, token });
  } catch (err) {
    console.error('Firebase login error', err.code, err.message);
    if (err.code && err.code.startsWith('auth/')) {
      return res.status(401).json({ error: 'Invalid Firebase token', details: err.message });
    }
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Send reminder (matches energyAnalyzer.html fetch): POST /send-reminder
// Body: { email, subject, message }
app.post('/send-reminder', async (req, res) => {
  try {
    const { email, subject = 'EnergyBuddy Reminder', message } = req.body;
    if (!email || !message) return res.status(400).json({ error: 'email & message required' });

    if (!transporter) {
      return res.status(500).json({ error: 'Email transporter not configured on server' });
    }

    const mailOptions = {
      from: `"EnergyBuddy" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      text: message,
      html: message.replace(/\n/g, '<br>')
    };

    const info = await sendEmail(mailOptions);
    console.log(`📩 Reminder sent to ${email} — id: ${info.messageId || '(no-id)'}`);
    res.json({ ok: true, messageId: info.messageId || null });
  } catch (err) {
    console.error('❌ Send reminder error:', err.message);
    res.status(500).json({ error: 'Failed to send reminder', details: err.message });
  }
});

// ----------------- Start -----------------
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
