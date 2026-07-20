import { useEffect, useMemo, useState } from 'react';
import { Api, formatEUR, getToken } from '../api.js';
import { useToast } from '../context/ToastContext.jsx';

const STATUSES = ['placed', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];
const PAGE_SIZE = 20;

export default function AdminOrders() {
  const toast = useToast();
  const [allOrders, setAllOrders] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    Api.adminOrders().then((r) => setAllOrders(r.orders)).catch((err) => setError(err.message));
  }, []);

  const filtered = useMemo(() => {
    if (!allOrders) return [];
    const q = search.trim().toLowerCase();
    return allOrders.filter((o) => {
      if (status && o.status !== status) return false;
      if (from && new Date(o.createdAt) < new Date(from)) return false;
      if (to && new Date(o.createdAt) > new Date(to + 'T23:59:59')) return false;
      if (q && !(o.customer.name.toLowerCase().includes(q) || o.customer.phone.includes(q))) return false;
      return true;
    });
  }, [allOrders, status, from, to, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageOrders = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function resetPage() { setPage(1); }

  async function updateStatus(orderId, newStatus) {
    try {
      await Api.adminUpdateOrderStatus(orderId, newStatus);
      setAllOrders((prev) => prev.map((o) => (String(o.id) === String(orderId) ? { ...o, status: newStatus } : o)));
      toast(`Order #${orderId} marked ${newStatus}`);
    } catch (err) {
      toast(err.message, true);
    }
  }

  function clearFilters() {
    setStatus(''); setFrom(''); setTo(''); setSearch(''); setPage(1);
  }

  async function exportCsv() {
    setExporting(true);
    try {
      const res = await fetch('/api/admin/orders/export', { headers: { Authorization: `Bearer ${getToken()}` } });
      if (!res.ok) throw new Error('Export failed — try again.');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vara-traders-orders-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast('Orders exported successfully');
    } catch (err) {
      toast(err.message, true);
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 6 }}>
        <h2>Orders</h2>
        <button className="btn btn-outline btn-sm" onClick={exportCsv} disabled={exporting}>
          {exporting ? 'Exporting…' : '⬇ Export to Excel (CSV)'}
        </button>
      </div>
      <p style={{ color: 'var(--ledger-soft)', marginBottom: 16 }}>Update fulfilment status as orders move through packing and delivery.</p>

      <div className="filters-bar">
        <div className="form-group">
          <label>Status</label>
          <select value={status} onChange={(e) => { setStatus(e.target.value); resetPage(); }}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>From date</label>
          <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); resetPage(); }} />
        </div>
        <div className="form-group">
          <label>To date</label>
          <input type="date" value={to} onChange={(e) => { setTo(e.target.value); resetPage(); }} />
        </div>
        <div className="form-group">
          <label>Search customer</label>
          <input type="text" placeholder="Name or phone" value={search} onChange={(e) => { setSearch(e.target.value); resetPage(); }} />
        </div>
        <button className="btn btn-sm btn-outline" onClick={clearFilters}>Clear filters</button>
      </div>

      {error ? (
        <div className="alert alert-error">{error}</div>
      ) : !allOrders ? (
        <div className="spinner" />
      ) : (
        <>
          <table className="admin-table">
            <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead>
            <tbody>
              {pageOrders.length === 0 ? (
                <tr><td colSpan={6}>No orders match these filters.</td></tr>
              ) : (
                pageOrders.map((o) => (
                  <tr key={o.id}>
                    <td>#{o.id}<br /><span style={{ color: 'var(--ledger-soft)', fontSize: 11.5 }}>{new Date(o.createdAt).toLocaleDateString('en-IE')}</span></td>
                    <td>{o.customer.name}<br /><span style={{ color: 'var(--ledger-soft)' }}>{o.customer.phone}</span></td>
                    <td>{o.items.map((i) => `${i.productName} (${i.variantLabel}) ×${i.qty}`).join(', ')}</td>
                    <td>{formatEUR(o.total)}</td>
                    <td>{o.paymentMethod === 'cod' ? 'COD' : 'Online'}</td>
                    <td>
                      <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)}>
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="pagination">
            <button disabled={currentPage <= 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
            <span>Page {currentPage} of {totalPages} ({filtered.length} order{filtered.length === 1 ? '' : 's'})</span>
            <button disabled={currentPage >= totalPages} onClick={() => setPage((p) => p + 1)}>Next →</button>
          </div>
        </>
      )}
    </>
  );
}
