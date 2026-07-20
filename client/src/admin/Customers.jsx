import { useEffect, useMemo, useState } from 'react';
import { Api } from '../api.js';

export default function Customers() {
  const [customers, setCustomers] = useState(null);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    Api.adminCustomers()
      .then((r) => setCustomers([...r.customers].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))))
      .catch((err) => setError(err.message));
  }, []);

  const filtered = useMemo(() => {
    if (!customers) return [];
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q))
    );
  }, [customers, query]);

  return (
    <>
      <h2 style={{ marginBottom: 6 }}>Customers</h2>
      <p style={{ color: 'var(--ledger-soft)', marginBottom: 12 }}>
        {customers ? `${customers.length} registered customer${customers.length === 1 ? '' : 's'}` : ''}
      </p>
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search by name, email or phone…"
          style={{ width: '100%', maxWidth: 360, border: '1.5px solid var(--ledger)', borderRadius: 'var(--radius)', padding: '9px 12px', fontSize: 14 }}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {error ? (
        <div className="alert alert-error">{error}</div>
      ) : !customers ? (
        <div className="spinner" />
      ) : (
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Joined</th></tr></thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={4}>No customers match your search.</td></tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.email ? c.email : <span style={{ color: 'var(--ledger-soft)' }}>—</span>}</td>
                  <td>{c.phone ? c.phone : <span style={{ color: 'var(--ledger-soft)' }}>—</span>}</td>
                  <td>{new Date(c.createdAt).toLocaleDateString('en-IE')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </>
  );
}
