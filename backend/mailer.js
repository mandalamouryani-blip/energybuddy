// backend/mailer.js
require("dotenv").config();
const sgMail = require("@sendgrid/mail");

// Load SendGrid key
if (!process.env.myEmailKey) {
  console.warn(
    "⚠️ SendGrid API key (myEmailKey) missing. Email functionality disabled."
  );
} else {
  sgMail.setApiKey(process.env.myEmailKey);
  console.log("📧 SendGrid mailer initialized.");
}

/**
 * Unified sendEmail function that mimics old Nodemailer usage.
 * Accepts:
 * {
 *   to: recipient email,
 *   from: verified sender,
 *   subject: subject text,
 *   text: text body,
 *   html?: html body
 * }
 */
const sendEmail = async (mailOptions) => {
  if (!process.env.myEmailKey) {
    throw new Error("SendGrid API key not configured.");
  }

  // Input normalization: make SendGrid's format compatible with old Nodemailer format
  const msg = {
    to: mailOptions.to,
    from: "23a51a05b2@gmail.com",
    subject: mailOptions.subject,
    text: mailOptions.text || "",
    html: mailOptions.html || undefined,
  };

  try {
    await sgMail.send(msg);
    console.log("📨 Email sent successfully.");
    return { success: true };
  } catch (error) {
    console.error(
      "❌ Email send error:",
      error.response?.body || error.message
    );
    throw error;
  }
};

module.exports = { sendEmail };
