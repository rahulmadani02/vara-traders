import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

// rahul: placeholder number (same one shown in the topbar/footer),
// formatted for wa.me — swap for the real WhatsApp business number/link
// when Vara Traders has one
const WHATSAPP_LINK = 'https://wa.me/35312345678';

export default function Header() {
  const { user, isAdmin, isLoggedIn, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const [bump, setBump] = useState(false);
  const firstRender = useRef(true);

  // rahul: bump the cart icon whenever the item count changes, skipping
  // the very first render so it doesn't animate on page load
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    setBump(true);
    const t = setTimeout(() => setBump(false), 450);
    return () => clearTimeout(t);
  }, [count]);

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <>
      <div className="topbar">
        <div className="container">
          <span>📞 +353 1 234 5678 &nbsp;|&nbsp; Free delivery on orders above €49</span>
          <span><Link to="/account">Track order</Link> &nbsp;|&nbsp; <Link to="/contact">Help</Link></span>
        </div>
      </div>

      <header className="site-header">
        {/* rahul: main bar — logo, search, account/cart. Light background,
            no nav clutter — that lives in the category-bar below */}
        <div className="container header-row">
          <Link to="/" className="brand">
            <img src="/images/logo.png" alt="Amruth Groceries logo" className="brand-mark" />
            <span className="brand-text">
              <h1>Amruth</h1>
              <span>Groceries</span>
            </span>
          </Link>

          <SearchBar />

          <div className="header-actions">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="icon-link whatsapp-btn"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.38 5.07L2 22l5.07-1.38C8.55 21.5 10.24 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm5.2 14.2c-.22.62-1.3 1.18-1.8 1.24-.46.06-1.03.08-1.66-.1-.38-.11-.87-.28-1.5-.55-2.63-1.14-4.35-3.8-4.48-3.98-.13-.18-1.07-1.42-1.07-2.7 0-1.28.67-1.9.9-2.16.23-.26.5-.32.67-.32.17 0 .34 0 .48.01.16.01.36-.06.57.43.22.5.74 1.72.8 1.84.06.13.1.28.02.46-.08.18-.13.28-.25.44-.13.15-.27.34-.38.46-.13.13-.26.27-.11.53.15.26.66 1.09 1.42 1.76.98.87 1.8 1.14 2.06 1.27.26.13.41.11.56-.07.16-.18.68-.79.86-1.06.18-.26.36-.22.6-.13.25.09 1.56.74 1.83.87.26.13.44.19.5.3.06.11.06.62-.16 1.24z" />
              </svg>
              <span className="label">Join WhatsApp</span>
            </a>
            {isLoggedIn && user ? (
              <>
                <Link to="/account" className="icon-link">👤 {user.name.split(' ')[0]}</Link>
                {isAdmin && <Link to="/admin/dashboard" className="icon-link">🛠 Admin</Link>}
                <button type="button" className="icon-link" onClick={handleLogout}>Log out</button>
              </>
            ) : (
              <Link to="/login" className="icon-link">👤 Log in</Link>
            )}
            <Link to="/cart" className={`icon-link cart-pill ${bump ? 'cart-bump' : ''}`}>
              🛒 Cart <span className="cart-count" style={{ display: count > 0 ? 'flex' : 'none' }}>{count}</span>
            </Link>
          </div>
        </div>

        {/* rahul: category-bar — desi-grocery-style always-visible category
            navigation, a bold colored strip under the main header instead
            of hiding categories behind a hover dropdown */}
        <div className="category-bar">
          <div className="container">
            <nav className="main-nav">
              <NavLink to="/" end>Home</NavLink>
              <NavLink to="/shop" end>Shop</NavLink>
              <Link to="/shop?category=rice">Rice</Link>
              <Link to="/shop?category=dals-pulses">Dals &amp; Pulses</Link>
              <Link to="/shop?category=nuts-seeds">Nuts &amp; Seeds</Link>
              <NavLink to="/about">About</NavLink>
              <NavLink to="/contact">Contact</NavLink>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
