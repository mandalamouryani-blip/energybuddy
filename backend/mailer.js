// backend/mailer.js
require("dotenv").config();
const nodemailer = require("nodemailer");

let transporter = null;

// Only configure transporter if credentials exist
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Google App Password ONLY
    },
  });

  // Soft verification (Render-safe)
  transporter.verify((error, success) => {
    if (error) {
      console.warn(
        "⚠️ Mailer verification failed (common on Render, emails may still work):",
        error.message
      );
    } else {
      console.log("✅ Mailer ready.");
    }
  });
} else {
  console.warn(
    "⚠️ EMAIL_USER or EMAIL_PASS missing. Email functionality disabled."
  );
}

/**
 * Sends an email using transporter
 */
const sendEmail = (mailOptions) => {
  if (!transporter) {
    return Promise.reject(
      new Error("Email transporter is not configured properly.")
    );
  }
  return transporter.sendMail(mailOptions);
};

module.exports = { sendEmail, transporter };
