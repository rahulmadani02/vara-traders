import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h5>Vara Traders</h5>
            <p>A trusted Indian grocery trading house — rice, dals, spices, and everyday staples delivered to your door.</p>
          </div>
          <div>
            <h5>Shop</h5>
            <Link to="/shop?category=rice">Rice</Link>
            <Link to="/shop?category=dals-pulses">Dals &amp; Pulses</Link>
            <Link to="/shop?category=nuts-seeds">Nuts &amp; Seeds</Link>
            <Link to="/shop">All categories</Link>
          </div>
          <div>
            <h5>Help</h5>
            <Link to="/account">Track order</Link>
            <Link to="/contact">Contact us</Link>
            <Link to="/about">About us</Link>
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms">Terms &amp; Conditions</Link>
            <Link to="/returns">Returns &amp; Refunds</Link>
          </div>
          <div>
            <h5>Reach us</h5>
            <p>📞 +353 1 234 5678</p>
            <p>✉️ orders@varatraders.ie</p>
            <p>📍 Dublin, Ireland</p>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Vara Traders. All rights reserved.</span>
          <span>Weighed with care, since day one.</span>
        </div>
      </div>
    </footer>
  );
}
