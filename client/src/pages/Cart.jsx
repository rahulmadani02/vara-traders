import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Api, formatEUR, productImageSrc } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Cart() {
  const { items, setQty, remove } = useCart();
  const toast = useToast();
  const [summary, setSummary] = useState(null);
  const [summaryError, setSummaryError] = useState(null);

  useEffect(() => {
    if (!items.length) { setSummary(null); return; }
    let cancelled = false;
    setSummaryError(null);
    Api.priceCart(items.map((i) => ({ productId: i.productId, variantId: i.variantId, qty: i.qty, name: i.name })))
      .then((r) => { if (!cancelled) setSummary(r); })
      .catch((err) => { if (!cancelled) setSummaryError(err.message); });
    return () => { cancelled = true; };
  }, [items]);

  if (!items.length) {
    return (
      <>
        <div className="page-head container"><h2>Your cart</h2></div>
        <div className="container">
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <h3>Your cart is empty</h3>
            <p>Add some rice, dal or spices to get started.</p>
            <Link to="/shop" className="btn btn-primary" style={{ marginTop: 14 }}>Browse groceries</Link>
          </div>
        </div>
      </>
    );
  }

  const hasIssues = summary?.issues && summary.issues.length > 0;

  return (
    <>
      <div className="page-head container"><h2>Your cart</h2></div>
      <div className="container">
        <div className="cart-layout">
          <div>
            <div>
              {items.map((i) => {
                const src = productImageSrc(i);
                return (
                  <div className="cart-line" key={`${i.productId}-${i.variantId}`}>
                    <div className="thumb-sm">{src ? <img src={src} alt={i.name} /> : i.variantLabel}</div>
                    <div>
                      <h4>{i.name}</h4>
                      <div className="variant-label">{i.variantLabel} · {formatEUR(i.price)} each</div>
                      <button type="button" className="remove-link" onClick={() => { remove(i.productId, i.variantId); toast('Removed from cart'); }}>Remove</button>
                    </div>
                    <div className="qty-stepper">
                      <button type="button" onClick={() => setQty(i.productId, i.variantId, i.qty - 1)}>−</button>
                      <span>{i.qty}</span>
                      <button type="button" onClick={() => setQty(i.productId, i.variantId, i.qty + 1)}>+</button>
                    </div>
                    <div className="line-price">{formatEUR(i.price * i.qty)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="summary-card">
            <h4 style={{ marginBottom: 14 }}>Order summary</h4>
            {summaryError ? (
              <div className="alert alert-error">Could not verify cart: {summaryError}</div>
            ) : !summary ? (
              <div className="spinner" />
            ) : (
              <>
                {hasIssues && <div className="alert alert-error">{summary.issues.join(' ')}</div>}
                <div className="summary-row"><span>Subtotal</span><span>{formatEUR(summary.subtotal)}</span></div>
                <div className="summary-row"><span>Delivery</span><span>{summary.deliveryFee === 0 ? 'FREE' : formatEUR(summary.deliveryFee)}</span></div>
                <div className="summary-row total"><span>Total</span><span>{formatEUR(summary.total)}</span></div>
              </>
            )}
            {!hasIssues && summary && (
              <Link to="/checkout" className="btn btn-primary btn-block" style={{ marginTop: 14 }}>Proceed to checkout</Link>
            )}
            <div className="form-note">Prices are confirmed at checkout in case stock has changed.</div>
          </div>
        </div>
      </div>
    </>
  );
}
