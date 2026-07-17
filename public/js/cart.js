// public/js/cart.js
const Cart = {
  KEY: 'vt_cart', // array of { productId, variantId, name, variantLabel, price, image, qty }

  get() {
    const raw = localStorage.getItem(Cart.KEY);
    return raw ? JSON.parse(raw) : [];
  },

  save(items) {
    localStorage.setItem(Cart.KEY, JSON.stringify(items));
    Cart.updateBadge();
  },

  count() {
    return Cart.get().reduce((sum, i) => sum + i.qty, 0);
  },

  add(item) {
    const items = Cart.get();
    const existing = items.find((i) => i.productId === item.productId && i.variantId === item.variantId);
    if (existing) {
      existing.qty += item.qty;
    } else {
      items.push(item);
    }
    Cart.save(items);
  },

  setQty(productId, variantId, qty) {
    const items = Cart.get();
    const line = items.find((i) => i.productId === productId && i.variantId === variantId);
    if (!line) return;
    if (qty <= 0) {
      Cart.remove(productId, variantId);
      return;
    }
    line.qty = qty;
    Cart.save(items);
  },

  remove(productId, variantId) {
    const items = Cart.get().filter((i) => !(i.productId === productId && i.variantId === variantId));
    Cart.save(items);
  },

  clear() {
    Cart.save([]);
  },

  updateBadge() {
    document.querySelectorAll('.cart-count').forEach((el) => {
      const n = Cart.count();
      el.textContent = n;
      el.style.display = n > 0 ? 'flex' : 'none';
    });
  },
};

document.addEventListener('DOMContentLoaded', Cart.updateBadge);