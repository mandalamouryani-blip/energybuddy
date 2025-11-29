// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { db, auth } = require("./src/config/firebase");
const { sendEmail } = require("./mailer"); // Mailer module for SendGrid

const app = express();

// ----------------- CORS FIX FOR NETLIFY -----------------
app.use(
  cors({
    origin: [
      "https://energizeme-ai.netlify.app", // your Netlify domain
      "http://localhost:3000", // local dev
      "http://127.0.0.1:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);



// ---------------------------------------------------------

app.use(express.json());

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

// ----------------- Routes -----------------

// health
app.get("/", (req, res) => res.send("EnergyReminder backend running"));

// Register: POST /api/register
app.post("/api/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email & password required" });

    let userRecord;
    try {
      userRecord = await auth.createUser({ email, password });
    } catch (error) {
      if (error.code === "auth/email-already-exists") {
        userRecord = await auth.getUserByEmail(email);
      } else {
        throw error;
      }
    }

    await db.collection("users").doc(userRecord.uid).set(
      {
        email: userRecord.email,
        createdAt: new Date().toISOString(),
      },
      { merge: true }
    );

    const token = jwt.sign({ id: userRecord.uid, email }, JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({ ok: true, userId: userRecord.uid, token });
  } catch (err) {
    console.error("Register error", err.code, err.message);
    if (err.code === "auth/email-already-exists") {
      return res.status(409).json({ error: "Email already registered" });
    }
    res.status(500).json({ error: "Server error during registration" });
  }
});

// Firebase login: POST /api/firebase-login { token }
app.post("/api/firebase-login", async (req, res) => {
  try {
    const { token: idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: "Firebase ID token required" });
    }

    const decodedToken = await auth.verifyIdToken(idToken);
    const { uid, email } = decodedToken;

    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      await db.collection("users").doc(uid).set({
        email,
        createdAt: new Date().toISOString(),
      });
    }

    const token = jwt.sign({ id: uid, email }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ ok: true, userId: uid, token });
  } catch (err) {
    console.error("Firebase login error", err.code, err.message);
    if (err.code && err.code.startsWith("auth/")) {
      return res
        .status(401)
        .json({ error: "Invalid Firebase token", details: err.message });
    }
    res.status(500).json({ error: "Server error during login" });
  }
});

// POST /send-reminder
app.post("/send-reminder", async (req, res) => {
  try {
    const { email, subject = "EnergyBuddy Reminder", message } = req.body;
    if (!email || !message)
      return res.status(400).json({ error: "email & message required" });
 
    // The mailOptions object is now simplified for the SendGrid `sendEmail` function
    const mailOptions = {
      to: email,
      subject,
      text: message,
      html: message.replace(/\n/g, "<br>"),
    };
 
    // The `sendEmail` function from mailer.js will throw on failure, which is caught below.
    await sendEmail(mailOptions);
    console.log(
      `📩 Reminder email queued for sending to ${email}`
    );
    res.json({ ok: true, message: "Email sent successfully." });
  } catch (err) {
    console.error("❌ Send reminder error:", err.message);
    res
      .status(500)
      .json({ error: "Failed to send reminder", details: err.message });
  }
});

// ----------------- Start -----------------
app.listen(PORT, () => {
  console.log(`Server listening on PORT ${PORT}`);
});
