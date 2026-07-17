// src/services/mailer.js
// Sends order confirmation emails via Gmail (using an App Password).
// If GMAIL_USER / GMAIL_APP_PASSWORD aren't set in .env yet, emails are
// skipped silently (logged to console) so the rest of the site still works.

const nodemailer = require('nodemailer');

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

let transporter = null;
if (GMAIL_USER && GMAIL_APP_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
  });
}

function formatEUR(amount) {
  return `€${Number(amount).toFixed(2)}`;
}

function orderConfirmationHtml(order) {
  const itemsHtml = order.items.map((i) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #eee;">${i.productName} (${i.variantLabel}) × ${i.qty}</td>
      <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">${formatEUR(i.lineTotal)}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#1F2E22;">
      <h2 style="color:#1F2E22;">Thanks for your order, ${order.customer.name}!</h2>
      <p>We've received your order and will start packing it shortly.</p>
      <p style="font-family:monospace;color:#3A4D3D;">Order #${order.id}</p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0;">
        ${itemsHtml}
      </table>
      <table style="width:100%;font-size:14px;">
        <tr><td>Subtotal</td><td style="text-align:right;">${formatEUR(order.subtotal)}</td></tr>
        <tr><td>Delivery</td><td style="text-align:right;">${order.deliveryFee === 0 ? 'FREE' : formatEUR(order.deliveryFee)}</td></tr>
        <tr style="font-weight:bold;font-size:16px;"><td style="padding-top:8px;">Total</td><td style="text-align:right;padding-top:8px;">${formatEUR(order.total)}</td></tr>
      </table>
      <p style="margin-top:24px;"><strong>Delivering to:</strong><br/>
      ${order.customer.address}<br/>
      ${order.customer.city}, ${order.customer.county || ''} ${order.customer.eircode || ''}</p>
      <p><strong>Payment method:</strong> ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online'}</p>
      <p style="margin-top:32px;color:#3A4D3D;font-size:13px;">— Vara Traders Indian Groceries</p>
    </div>
  `;
}

async function sendOrderConfirmation(order) {
  if (!transporter) {
    console.log(`[mailer] Skipped email for order #${order.id} — GMAIL_USER/GMAIL_APP_PASSWORD not set in .env yet.`);
    return { sent: false, reason: 'not_configured' };
  }
  if (!order.customer.email) {
    console.log(`[mailer] Skipped email for order #${order.id} — no email address on this order.`);
    return { sent: false, reason: 'no_email' };
  }

  try {
    await transporter.sendMail({
      from: `"Vara Traders" <${GMAIL_USER}>`,
      to: order.customer.email,
      subject: `Order confirmed — #${order.id} (Vara Traders)`,
      html: orderConfirmationHtml(order),
    });
    console.log(`[mailer] Sent confirmation email for order #${order.id} to ${order.customer.email}`);
    return { sent: true };
  } catch (err) {
    console.error(`[mailer] Failed to send email for order #${order.id}:`, err.message);
    return { sent: false, reason: 'send_error' };
  }
}

module.exports = { sendOrderConfirmation };