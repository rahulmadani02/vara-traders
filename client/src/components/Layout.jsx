import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import MiniCartDrawer from './MiniCartDrawer.jsx';

export default function Layout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <Header />
      <div className="page-fade">
        <Outlet />
      </div>
      <Footer />
      <MiniCartDrawer />
    </>
  );
}
