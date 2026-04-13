// routes/notification.routes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');

let twilioClient;
try {
  const twilio = require('twilio');
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
} catch (e) {
  console.warn('Twilio not configured:', e.message);
}

// Send order confirmation SMS/WhatsApp
const sendOrderNotification = async ({ to, type, orderNumber, message }) => {
  if (!twilioClient) return;
  try {
    if (type === 'sms') {
      await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: `+91${to}`,
      });
    } else if (type === 'whatsapp') {
      await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: `whatsapp:+91${to}`,
      });
    }
  } catch (e) {
    console.error('Notification send failed:', e.message);
  }
};

// Test notification endpoint
router.post('/test', protect, authorize('admin'), async (req, res) => {
  try {
    const { phone, type, message } = req.body;
    await sendOrderNotification({ to: phone, type, message });
    res.json({ success: true, message: 'Notification sent.' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
module.exports.sendOrderNotification = sendOrderNotification;
