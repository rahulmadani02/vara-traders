import { Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import Product from './pages/Product.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderSuccess from './pages/OrderSuccess.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Account from './pages/Account.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';
import Terms from './pages/Terms.jsx';
import Returns from './pages/Returns.jsx';
import NotFound from './pages/NotFound.jsx';
import AdminLayout from './admin/AdminLayout.jsx';
import Dashboard from './admin/Dashboard.jsx';
import AdminProducts from './admin/Products.jsx';
import AdminOrders from './admin/Orders.jsx';
import Customers from './admin/Customers.jsx';

export default function App() {
  const location = useLocation();

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home key={location.key} />} />
        <Route path="/shop" element={<Shop key={location.key} />} />
        <Route path="/product/:slug" element={<Product key={location.key} />} />
        <Route path="/cart" element={<Cart key={location.key} />} />
        <Route path="/checkout" element={<Checkout key={location.key} />} />
        <Route path="/order-success" element={<OrderSuccess key={location.key} />} />
        <Route path="/login" element={<Login key={location.key} />} />
        <Route path="/register" element={<Register key={location.key} />} />
        <Route path="/account" element={<Account key={location.key} />} />
        <Route path="/about" element={<About key={location.key} />} />
        <Route path="/contact" element={<Contact key={location.key} />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy key={location.key} />} />
        <Route path="/terms" element={<Terms key={location.key} />} />
        <Route path="/returns" element={<Returns key={location.key} />} />
        <Route path="*" element={<NotFound key={location.key} />} />
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="customers" element={<Customers />} />
      </Route>
    </Routes>
  );
}
