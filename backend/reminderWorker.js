// reminder.js
require('dotenv').config();
const twilio = require('twilio');
const { db } = require('./src/config/firebase'); // Use Firebase Admin SDK

// Twilio setup
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const FROM = process.env.TWILIO_PHONE;

// Function to send SMS reminders to all users
async function sendReminders() {
  try {
    const usersSnapshot = await db.collection('users').get();
    if (usersSnapshot.empty) {
      console.log('No users found to send reminders to.');
      return;
    }

    for (const doc of usersSnapshot.docs) {
      const user = doc.data();
      if (user.phone) {
        const phone = String(user.phone).startsWith('+') ? user.phone : `+91${user.phone}`;
        await client.messages.create({
          body: '⚡ EnergyBuddy Reminder: Please check your devices and save power!',
          from: FROM,
          to: phone,
        });
        console.log('✅ Reminder sent to', phone);
      }
    }
    console.log('All reminders sent successfully!');
  } catch (err) {
    console.error('❌ Error sending reminders:', err);
  } finally {
    process.exit(0);
  }
}

sendReminders();