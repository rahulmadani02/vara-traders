import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { Api, formatEUR, productImageSrc } from '../api.js';

// rahul: the "richer, animated" add-to-cart moment — instead of just a
// toast, a drawer slides in from the right showing the item just added
// plus a live-priced running total, with the whole cart underneath.
export default function MiniCartDrawer() {
  const { items, drawerOpen, closeDrawer, lastAdded, setQty, remove } = useCart();
  const [totals, setTotals] = useState(null);

  useEffect(() => {
    if (!drawerOpen || !items.length) {
      setTotals(null);
      return;
    }
    let cancelled = false;
    Api.priceCart(items.map((i) => ({ productId: i.productId, variantId: i.variantId, qty: i.qty, name: i.name })))
      .then((r) => { if (!cancelled) setTotals(r); })
      .catch(() => { if (!cancelled) setTotals(null); });
    return () => { cancelled = true; };
  }, [drawerOpen, items]);

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') closeDrawer(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [closeDrawer]);

  return (
    <>
      <div className={`cart-drawer-backdrop ${drawerOpen ? 'open' : ''}`} onClick={closeDrawer} />
      <aside className={`cart-drawer ${drawerOpen ? 'open' : ''}`} aria-hidden={!drawerOpen}>
        <div className="cart-drawer-head">
          <h3>Your cart</h3>
          <button type="button" className="cart-drawer-close" onClick={closeDrawer} aria-label="Close cart">✕</button>
        </div>

        {lastAdded && (
          <div className="cart-drawer-added" key={`${lastAdded.productId}-${lastAdded.variantId}-${Date.now()}`}>
            <span className="thumb-sm">
              {productImageSrc(lastAdded) ? <img src={productImageSrc(lastAdded)} alt="" /> : null}
            </span>
            <span className="label">
              <span className="check">✓ Added</span><br />
              {lastAdded.name} ({lastAdded.variantLabel})
            </span>
          </div>
        )}

        <div className="cart-drawer-body">
          {!items.length ? (
            <div className="cart-drawer-empty">Your cart is empty.</div>
          ) : (
            items.map((i) => (
              <div className="cart-drawer-line" key={`${i.productId}-${i.variantId}`}>
                <span className="thumb-sm">
                  {productImageSrc(i) ? <img src={productImageSrc(i)} alt="" /> : null}
                </span>
                <span className="info">
                  <h5>{i.name}</h5>
                  <span className="meta">{i.variantLabel} · {formatEUR(i.price)} each</span><br />
                  <span className="meta">
                    <button type="button" className="remove-link" onClick={() => remove(i.productId, i.variantId)}>Remove</button>
                  </span>
                </span>
                <div className="qty-stepper">
                  <button type="button" onClick={() => setQty(i.productId, i.variantId, i.qty - 1)}>−</button>
                  <span>{i.qty}</span>
                  <button type="button" onClick={() => setQty(i.productId, i.variantId, i.qty + 1)}>+</button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-drawer-foot">
            <div className="summary-row total">
              <span>Subtotal</span>
              <span>{totals ? formatEUR(totals.subtotal) : '…'}</span>
            </div>
            <Link to="/cart" className="btn btn-outline btn-block" style={{ marginTop: 10 }} onClick={closeDrawer}>
              View cart
            </Link>
            <Link to="/checkout" className="btn btn-primary btn-block" style={{ marginTop: 8 }} onClick={closeDrawer}>
              Checkout
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
