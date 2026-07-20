import { Link } from 'react-router-dom';

export default function Returns() {
  return (
    <>
      <div className="page-head container">
        <h2>Returns &amp; Refunds Policy</h2>
        <p>Last updated: 9 July 2026</p>
      </div>
      <div className="container" style={{ maxWidth: 760, paddingBottom: 60, lineHeight: 1.7, fontSize: 15.5 }}>
        <p style={{ marginBottom: 20 }}>We want you to be happy with every order. Because we sell food products, our returns policy works a little differently from non-food retailers — here's exactly how it works.</p>

        <h3 style={{ fontSize: 19, margin: '28px 0 10px' }}>1. Damaged, incorrect, or faulty items</h3>
        <p style={{ marginBottom: 20 }}>If your order arrives damaged, spoiled, incorrect, or otherwise faulty, contact us within <strong>48 hours of delivery</strong> at <a href="mailto:orders@varatraders.ie" style={{ color: 'var(--peacock)' }}>orders@varatraders.ie</a> with your order number and a photo of the issue. We will offer a replacement or a full refund for the affected item(s), at no cost to you.</p>

        <h3 style={{ fontSize: 19, margin: '28px 0 10px' }}>2. Change of mind</h3>
        <p style={{ marginBottom: 20 }}>Because our products are food items, we're unable to accept returns for change of mind once an order has been delivered, in line with standard EU consumer protection exemptions for perishable and hygiene-sensitive goods. If you have any concern before your order is dispatched, contact us as soon as possible and we'll do our best to help — including cancelling the order if it hasn't shipped yet.</p>

        <h3 style={{ fontSize: 19, margin: '28px 0 10px' }}>3. Order cancellations before dispatch</h3>
        <p style={{ marginBottom: 20 }}>If you need to cancel or change an order, contact us immediately at <a href="mailto:orders@varatraders.ie" style={{ color: 'var(--peacock)' }}>orders@varatraders.ie</a>. If your order hasn't been packed yet, we can usually cancel or adjust it free of charge. Once an order has been packed or dispatched, it can no longer be cancelled.</p>

        <h3 style={{ fontSize: 19, margin: '28px 0 10px' }}>4. Refunds</h3>
        <p style={{ marginBottom: 20 }}>Approved refunds are issued to your original payment method within 5–10 business days. For Cash on Delivery orders that are cancelled before dispatch, no charge will have been made, so no refund is needed.</p>

        <h3 style={{ fontSize: 19, margin: '28px 0 10px' }}>5. Missing items</h3>
        <p style={{ marginBottom: 20 }}>If an item from your order is missing on delivery, let us know within 48 hours and we'll send the missing item or refund it — whichever you prefer.</p>

        <h3 style={{ fontSize: 19, margin: '28px 0 10px' }}>6. Contact us</h3>
        <p>For any return, refund, or order issue, reach us at <a href="mailto:orders@varatraders.ie" style={{ color: 'var(--peacock)' }}>orders@varatraders.ie</a> or <Link to="/contact" style={{ color: 'var(--peacock)' }}>through our contact page</Link>. We aim to respond within 24 hours.</p>
      </div>
    </>
  );
}
