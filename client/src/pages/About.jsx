import { Link } from 'react-router-dom';

export default function About() {
  return (
    <>
      <div className="page-head container">
        <h2>About Vara Traders</h2>
      </div>
      <div className="container" style={{ maxWidth: 720, paddingBottom: 60 }}>
        <p style={{ fontSize: 16, lineHeight: 1.7, marginBottom: 18 }}>
          Vara Traders has been sourcing rice, dals, spices and everyday staples the way a trader learns to — by hand, by weight, and by relationship with the mills and farms behind every sack. What started as a local grocery counter is now an online store serving the Indian community in Ireland, but the standard hasn't changed: every batch is checked before it's packed for your kitchen.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.7, marginBottom: 18 }}>
          We stock everything from aged basmati and sona masuri to hand-blended masalas, cold-pressed oils, and traditional pickles — sized for a single household or a full month's stock-up, at prices that stay fair whether you buy 1kg or 10kg.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.7 }}>
          Questions about an order, a product, or bulk pricing for your shop or restaurant? <Link to="/contact" style={{ color: 'var(--peacock)', fontWeight: 700 }}>Get in touch</Link> — we reply the same day.
        </p>
      </div>
    </>
  );
}
