const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

/**
 * Reusable email sending utility
 */
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const mailOptions = {
      from: process.env.MAIL_FROM || process.env.MAIL_USER,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 [EmailService] Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ [EmailService] Error sending email to ${to}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Specific templates
 */
const templates = {
  orderSuccess: (order, customerName) => ({
    subject: `Order Confirmed - #${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: #4CAF50;">Thank you for your order, ${customerName}!</h2>
        <p>Your order <strong>#${order.orderNumber}</strong> has been confirmed and is being processed.</p>
        <hr/>
        <h3>Order Summary:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f8f8f8;">
              <th style="padding: 10px; text-align: left;">Item</th>
              <th style="padding: 10px; text-align: right;">Qty</th>
              <th style="padding: 10px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.quantity}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.subtotal}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="margin-top: 20px; text-align: right;">
          <p><strong>Total: ₹${order.pricing.total}</strong></p>
        </div>
        <p style="margin-top: 30px;">You can track your order status on our platform.</p>
        <p>Best regards,<br/><strong>AgriMarket Team</strong></p>
      </div>
    `
  }),

  productDelivered: (order, farmerName, items) => ({
    subject: `Product Delivered - Order #${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: #2196F3;">Great news, Farmer ${farmerName}!</h2>
        <p>Your products from order <strong>#${order.orderNumber}</strong> have been successfully delivered to the customer.</p>
        <hr/>
        <h3>Delivered Items:</h3>
        <ul>
          ${items.map(item => `
            <li>${item.name} (x${item.quantity}) - ₹${item.subtotal}</li>
          `).join('')}
        </ul>
        <p style="margin-top: 20px;">The payment for these items will be processed as per your settlement cycle.</p>
        <p>Keep growing!<br/><strong>AgriMarket Team</strong></p>
      </div>
    `
  })
};

module.exports = { sendEmail, templates };
