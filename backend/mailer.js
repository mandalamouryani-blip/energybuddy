// backend/mailer.js
require("dotenv").config();

const sgMail = require("@sendgrid/mail");

// Load SendGrid API key from your Render env
if (!process.env.myEmailKey) {
  console.warn("⚠️ SendGrid API key (myEmailKey) missing. Email disabled.");
}

sgMail.setApiKey(process.env.myEmailKey);

/**
 * Sends an email using SendGrid Web API.
 * @param {Object} mailOptions - Email details
 * @param {string} mailOptions.to - Recipient
 * @param {string} mailOptions.from - Verified sender email
 * @param {string} mailOptions.subject - Email subject
 * @param {string} mailOptions.text - Email plain text
 * @param {string} [mailOptions.html] - Optional HTML version
 */
const sendEmail = async (mailOptions) => {
  try {
    if (!process.env.myEmailKey) {
      throw new Error("SendGrid API key not configured.");
    }

    await sgMail.send(mailOptions);
    console.log("📨 Email sent successfully.");
    return true;
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    throw error;
  }
};

module.exports = { sendEmail };
