import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, color: 'var(--peacock)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Error 404</div>
      <h2 style={{ fontSize: 38, marginBottom: 14 }}>This shelf is empty.</h2>
      <p style={{ color: 'var(--ledger-soft)', fontSize: 16, maxWidth: 440, margin: '0 auto 30px' }}>
        We couldn't find the page you were looking for — it may have moved, or the link might be off. Let's get you back to the good stuff.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/" className="btn btn-primary">Back to homepage</Link>
        <Link to="/shop" className="btn btn-outline">Browse groceries</Link>
      </div>
    </div>
  );
}
