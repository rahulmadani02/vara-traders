import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Api, formatEUR } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

const STATUS_LABEL = {
  placed: 'Placed', confirmed: 'Confirmed', packed: 'Packed',
  shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled',
};

export default function Account() {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login?redirect=/account');
      return;
    }
    Api.myOrders()
      .then((r) => setOrders(r.orders))
      .catch((err) => setError(err.message));
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) return null;

  return (
    <>
      <div className="page-head container">
        <h2>My orders</h2>
        <p>Welcome back, {user?.name}.</p>
      </div>
      <div className="container" style={{ paddingBottom: 60 }}>
        {error ? (
          <div className="alert alert-error">{error}</div>
        ) : orders === null ? (
          <div className="spinner" />
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <h3>No orders yet</h3>
            <p>Once you place an order, it'll show up here.</p>
            <Link to="/shop" className="btn btn-primary" style={{ marginTop: 12 }}>Start shopping</Link>
          </div>
        ) : (
          orders.map((o) => (
            <div className="order-card" key={o.id}>
              <div className="order-head">
                <div>
                  <span className="order-id">Order #{o.id}</span><br />
                  <span style={{ fontSize: 12.5, color: 'var(--ledger-soft)' }}>{new Date(o.createdAt).toLocaleString('en-IE')}</span>
                </div>
                <span className={`status-badge status-${o.status}`}>{STATUS_LABEL[o.status] || o.status}</span>
              </div>
              <div className="order-items">
                {o.items.map((i) => `${i.productName} (${i.variantLabel}) × ${i.qty}`).join(', ')}
              </div>
              <div className="summary-row total" style={{ borderTop: '1px dashed var(--line)', marginTop: 10 }}>
                <span>Total ({o.paymentMethod === 'cod' ? 'COD' : 'Online'})</span><span>{formatEUR(o.total)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
