import { useEffect, useState } from 'react';
import { Api, formatEUR } from '../api.js';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Api.adminStats().then(setStats).catch((err) => setError(err.message));
  }, []);

  return (
    <>
      <h2 style={{ marginBottom: 6 }}>Dashboard</h2>
      <p style={{ color: 'var(--ledger-soft)', marginBottom: 28 }}>Overview of orders, revenue and stock.</p>

      {error ? (
        <div className="alert alert-error">{error}</div>
      ) : !stats ? (
        <div className="spinner" />
      ) : (
        <>
          <div className="stat-grid">
            <div className="stat-card"><div className="num">{stats.totalOrders}</div><div className="label">Total orders</div></div>
            <div className="stat-card"><div className="num">{formatEUR(stats.totalRevenue)}</div><div className="label">Revenue (COD + paid)</div></div>
            <div className="stat-card"><div className="num">{stats.totalProducts}</div><div className="label">Products</div></div>
            <div className="stat-card"><div className="num">{stats.totalCustomers}</div><div className="label">Customers</div></div>
          </div>

          {stats.lowStockCount > 0 && (
            <div className="alert alert-error" style={{ maxWidth: 640 }}>
              ⚠️ {stats.lowStockCount} product(s) low on stock — check the Products page.
            </div>
          )}

          <h3 style={{ margin: '24px 0 12px', fontSize: 18 }}>Recent orders</h3>
          <table className="admin-table">
            <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Placed</th></tr></thead>
            <tbody>
              {stats.recentOrders.length === 0 ? (
                <tr><td colSpan={6}>No orders yet.</td></tr>
              ) : (
                stats.recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td>#{o.id}</td>
                    <td>{o.customer.name}</td>
                    <td>{o.items.length} item(s)</td>
                    <td>{formatEUR(o.total)}</td>
                    <td><span className={`status-badge status-${o.status}`}>{o.status}</span></td>
                    <td>{new Date(o.createdAt).toLocaleDateString('en-IE')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </>
      )}
    </>
  );
}
