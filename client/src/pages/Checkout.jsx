import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Api, formatEUR } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Checkout() {
  const { items, clear } = useCart();
  const { user, isLoggedIn } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const formRef = useRef(null);
  const toastShown = useRef(false);

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    eircode: '',
    address: '',
    city: '',
    county: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [priced, setPriced] = useState(null);
  const [priceError, setPriceError] = useState(null);
  const [formAlert, setFormAlert] = useState(null);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (!isLoggedIn && !toastShown.current) {
      toastShown.current = true;
      toast('Tip: log in first to save this order to your account.', false);
    }
  }, [isLoggedIn, toast]);

  useEffect(() => {
    if (!items.length) return;
    Api.priceCart(items.map((i) => ({ productId: i.productId, variantId: i.variantId, qty: i.qty, name: i.name })))
      .then(setPriced)
      .catch((err) => setPriceError(err.message));
  }, [items]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function placeOrder(e) {
    e.preventDefault();
    if (!formRef.current.reportValidity()) return;

    setPlacing(true);
    setFormAlert(null);
    try {
      const { order } = await Api.placeOrder({
        items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, qty: i.qty, name: i.name })),
        customer: { ...form, eircode: form.eircode.toUpperCase() },
        paymentMethod,
      });
      clear();
      navigate(`/order-success?id=${order.id}`);
    } catch (err) {
      setFormAlert(err.message + (err.issues ? ' ' + err.issues.join(' ') : ''));
      setPlacing(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  if (!items.length) {
    return (
      <>
        <div className="page-head container"><h2>Checkout</h2></div>
        <div className="container">
          <div className="empty-state" style={{ gridColumn: '1/-1' }}>
            <h3>Your cart is empty</h3>
            <Link to="/shop" className="btn btn-primary">Browse groceries</Link>
          </div>
        </div>
      </>
    );
  }

  const hasIssues = priced?.issues && priced.issues.length > 0;

  return (
    <>
      <div className="page-head container"><h2>Checkout</h2></div>
      <div className="container">
        <div className="checkout-layout">
          <div>
            <div className="checkout-section">
              <h4>Delivery details</h4>
              {formAlert && <div className="alert alert-error">{formAlert}</div>}
              <form ref={formRef}>
                <div className="form-group">
                  <label htmlFor="name">Full name</label>
                  <input type="text" id="name" required value={form.name} onChange={(e) => update('name', e.target.value)} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Phone number</label>
                    <input type="tel" id="phone" required placeholder="e.g. 087 123 4567" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="checkout-email">Email <span style={{ fontWeight: 400, color: 'var(--ledger-soft)' }}>(for order confirmation)</span></label>
                    <input type="email" id="checkout-email" placeholder="you@example.com" value={form.email} onChange={(e) => update('email', e.target.value)} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="eircode">Eircode</label>
                    <input type="text" id="eircode" required placeholder="e.g. D02 AF30" style={{ textTransform: 'uppercase' }} value={form.eircode} onChange={(e) => update('eircode', e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="address">Address (house/apt no., street, area)</label>
                  <textarea id="address" rows={2} required value={form.address} onChange={(e) => update('address', e.target.value)} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">Town / City</label>
                    <input type="text" id="city" required value={form.city} onChange={(e) => update('city', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="county">County</label>
                    <input type="text" id="county" required placeholder="e.g. Dublin" value={form.county} onChange={(e) => update('county', e.target.value)} />
                  </div>
                </div>
              </form>
            </div>

            <div className="checkout-section">
              <h4>Payment method</h4>
              <div className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`} onClick={() => setPaymentMethod('cod')}>
                <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} /> Cash on Delivery
              </div>
              <div className={`payment-option ${paymentMethod === 'online' ? 'selected' : ''}`} onClick={() => setPaymentMethod('online')}>
                <input type="radio" name="payment" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} /> Pay online (UPI / Card / Netbanking)
              </div>
              <p style={{ fontSize: 12.5, color: 'var(--ledger-soft)', marginTop: 10 }}>
                Online payment requires a payment gateway (e.g. Razorpay) to be connected on the server. See README for setup — for now, orders are recorded with payment marked pending.
              </p>
            </div>
          </div>

          <div className="summary-card">
            <h4 style={{ marginBottom: 14 }}>Order summary</h4>
            <div>
              {items.map((i) => (
                <div className="summary-row" key={`${i.productId}-${i.variantId}`}>
                  <span>{i.name} ({i.variantLabel}) × {i.qty}</span><span>{formatEUR(i.price * i.qty)}</span>
                </div>
              ))}
            </div>
            {priceError ? (
              <div className="alert alert-error">{priceError}</div>
            ) : !priced ? (
              <div className="spinner" />
            ) : hasIssues ? (
              <div className="alert alert-error">{priced.issues.join(' ')}</div>
            ) : (
              <>
                <div className="summary-row"><span>Subtotal</span><span>{formatEUR(priced.subtotal)}</span></div>
                <div className="summary-row"><span>Delivery</span><span>{priced.deliveryFee === 0 ? 'FREE' : formatEUR(priced.deliveryFee)}</span></div>
                <div className="summary-row total"><span>Total</span><span>{formatEUR(priced.total)}</span></div>
              </>
            )}
            <button className="btn btn-primary btn-block" style={{ marginTop: 14 }} disabled={placing || hasIssues || !priced} onClick={placeOrder}>
              {placing ? 'Placing order…' : 'Place order'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
