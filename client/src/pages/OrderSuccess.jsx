import { Link, useSearchParams } from 'react-router-dom';

export default function OrderSuccess() {
  const [params] = useSearchParams();
  const id = params.get('id');

  return (
    <div className="container" style={{ padding: '60px 24px' }}>
      <div className="form-card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 44, marginBottom: 10 }}>✅</div>
        <h2>Order placed!</h2>
        {id && <p style={{ color: 'var(--ledger-soft)', margin: '10px 0 20px' }}>Order #{id}</p>}
        <p style={{ fontSize: 14, color: 'var(--ledger-soft)', marginBottom: 24 }}>
          We'll start packing your order right away. You can track its status from your account.
        </p>
        <Link to="/shop" className="btn btn-outline btn-block" style={{ marginBottom: 10 }}>Continue shopping</Link>
        <Link to="/account" className="btn btn-primary btn-block">View my orders</Link>
      </div>
    </div>
  );
}
