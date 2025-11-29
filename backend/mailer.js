// backend/mailer.js
require('dotenv').config();
const nodemailer = require('nodemailer');
 
let transporter = null;
 
// Only configure transporter if credentials are provided in .env
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // IMPORTANT: This must be a Google App Password
    },
  });
 
  // Verify the connection on startup
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Email transporter verification failed:', error.message);
    } else {
      console.log('✅ Email transporter is ready to send mail.');
    }
  });
} else {
  console.warn('⚠️ EMAIL_USER or EMAIL_PASS not set. Email functionality will be disabled.');
}
 
/**
 * Sends an email using the configured transporter.
 * @returns {Promise<import("nodemailer/lib/smtp-transport").SentMessageInfo>}
 */
const sendEmail = (mailOptions) => {
  if (!transporter) {
    return Promise.reject(new Error('Email transporter is not configured.'));
  }
  return transporter.sendMail(mailOptions);
};
 
module.exports = { sendEmail, transporter };
