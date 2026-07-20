import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const CART_KEY = 'vt_cart'; // same key the old static site used

function readCart() {
  const raw = localStorage.getItem(CART_KEY);
  return raw ? JSON.parse(raw) : [];
}

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);
  // rahul: drawer + "just added" state power the animated mini-cart that
  // slides in whenever something is added, instead of a plain toast
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState(null);

  const persist = useCallback((next) => {
    localStorage.setItem(CART_KEY, JSON.stringify(next));
    setItems(next);
  }, []);

  const add = useCallback((item) => {
    setItems((prev) => {
      const next = [...prev];
      const existing = next.find((i) => i.productId === item.productId && i.variantId === item.variantId);
      if (existing) {
        existing.qty += item.qty;
      } else {
        next.push(item);
      }
      localStorage.setItem(CART_KEY, JSON.stringify(next));
      return next;
    });
    setLastAdded(item);
    setDrawerOpen(true);
  }, []);

  const setQty = useCallback((productId, variantId, qty) => {
    setItems((prev) => {
      let next;
      if (qty <= 0) {
        next = prev.filter((i) => !(i.productId === productId && i.variantId === variantId));
      } else {
        next = prev.map((i) => (i.productId === productId && i.variantId === variantId ? { ...i, qty } : i));
      }
      localStorage.setItem(CART_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const remove = useCallback((productId, variantId) => {
    setItems((prev) => {
      const next = prev.filter((i) => !(i.productId === productId && i.variantId === variantId));
      localStorage.setItem(CART_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clear = useCallback(() => persist([]), [persist]);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);

  const count = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);

  const value = useMemo(() => ({
    items, count, add, setQty, remove, clear,
    drawerOpen, openDrawer, closeDrawer, lastAdded,
  }), [items, count, add, setQty, remove, clear, drawerOpen, openDrawer, closeDrawer, lastAdded]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
