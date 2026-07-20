import { useEffect, useState } from 'react';
import { Api, formatEUR } from '../api.js';
import { useToast } from '../context/ToastContext.jsx';

function emptyVariant() { return { label: '', price: '', stock: '' }; }

export default function AdminProducts() {
  const toast = useToast();
  const [products, setProducts] = useState(null);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [modalProduct, setModalProduct] = useState(undefined); // undefined = closed, null = new, object = edit

  async function load() {
    try {
      const [{ products: p }, catRes] = await Promise.all([Api.adminProducts(), Api.getCategories()]);
      setProducts(p);
      setCategories(catRes.categories);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { load(); }, []);

  async function deleteProduct(id) {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    try {
      await Api.adminDeleteProduct(id);
      toast('Product deleted');
      load();
    } catch (err) {
      toast(err.message, true);
    }
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <h2>Products</h2>
        <button className="btn btn-primary" onClick={() => setModalProduct(null)}>+ Add product</button>
      </div>
      <p style={{ color: 'var(--ledger-soft)', marginBottom: 12 }}>Manage your catalog — prices, stock and variants.</p>

      {error ? (
        <div className="alert alert-error">{error}</div>
      ) : !products ? (
        <div className="spinner" />
      ) : (
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Category</th><th>Variants</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {products.length === 0 ? (
              <tr><td colSpan={5}>No products yet.</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong><br /><span style={{ color: 'var(--ledger-soft)' }}>{p.brand || ''}</span></td>
                  <td>{p.category}</td>
                  <td>{p.variants.map((v) => `${v.label}: ${formatEUR(v.price)} (${v.stock} in stock)`).join(', ')}</td>
                  <td>{p.active === false ? <span className="status-badge status-cancelled">Inactive</span> : <span className="status-badge status-delivered">Active</span>}</td>
                  <td>
                    <button className="btn btn-sm btn-outline" onClick={() => setModalProduct(p)}>Edit</button>{' '}
                    <button className="btn btn-sm btn-danger" onClick={() => deleteProduct(p.id)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {modalProduct !== undefined && (
        <ProductModal
          product={modalProduct}
          categories={categories}
          onClose={() => setModalProduct(undefined)}
          onSaved={() => { setModalProduct(undefined); load(); }}
        />
      )}
    </>
  );
}

function ProductModal({ product, categories, onClose, onSaved }) {
  const isEdit = !!product;
  const toast = useToast();
  const [name, setName] = useState(product?.name || '');
  const [category, setCategory] = useState(product?.category || categories[0]?.id || '');
  const [brand, setBrand] = useState(product ? (product.brand || '') : 'Vara Traders');
  const [description, setDescription] = useState(product?.description || '');
  const [variants, setVariants] = useState(product ? product.variants.map((v) => ({ ...v })) : [emptyVariant()]);
  const [active, setActive] = useState(product ? product.active !== false : true);
  const [alert, setAlert] = useState(null);
  const [saving, setSaving] = useState(false);

  function updateVariant(i, field, value) {
    setVariants((rows) => rows.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  }
  function removeVariant(i) {
    setVariants((rows) => (rows.length > 1 ? rows.filter((_, idx) => idx !== i) : rows));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const variantsPayload = variants
      .map((v) => ({ label: v.label.trim(), price: Number(v.price), stock: Number(v.stock) }))
      .filter((v) => v.label);

    if (!variantsPayload.length) {
      setAlert('Add at least one size/variant.');
      return;
    }

    const payload = { name: name.trim(), category, brand: brand.trim(), description: description.trim(), variants: variantsPayload };
    if (isEdit) payload.active = active;

    setSaving(true);
    try {
      if (isEdit) await Api.adminUpdateProduct(product.id, payload);
      else await Api.adminCreateProduct(payload);
      toast(isEdit ? 'Product updated' : 'Product added');
      onSaved();
    } catch (err) {
      setAlert(err.message);
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box">
        <h3 style={{ marginBottom: 16 }}>{isEdit ? 'Edit product' : 'Add product'}</h3>
        {alert && <div className="alert alert-error">{alert}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Name</label><input type="text" required value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select required value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Brand</label><input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} /></div>
          </div>
          <div className="form-group"><label>Description</label><textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div className="form-group">
            <label>Variants (size / price / stock)</label>
            <div>
              {variants.map((v, i) => (
                <div className="variant-row" key={i}>
                  <input type="text" placeholder="Label (e.g. 1 kg)" value={v.label} onChange={(e) => updateVariant(i, 'label', e.target.value)} />
                  <input type="number" placeholder="Price €" value={v.price} min="0" step="0.01" onChange={(e) => updateVariant(i, 'price', e.target.value)} />
                  <input type="number" placeholder="Stock" value={v.stock} min="0" onChange={(e) => updateVariant(i, 'stock', e.target.value)} />
                  <button type="button" className="btn btn-sm btn-danger" onClick={() => removeVariant(i)}>×</button>
                </div>
              ))}
            </div>
            <button type="button" className="btn btn-sm btn-outline" onClick={() => setVariants((rows) => [...rows, emptyVariant()])}>+ Add size</button>
          </div>
          {isEdit && (
            <div className="form-group"><label><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Active (visible in shop)</label></div>
          )}
          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
