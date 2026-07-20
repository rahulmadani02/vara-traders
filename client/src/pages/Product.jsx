import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Api, formatEUR, productImageSrc } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import ProductCard from '../components/ProductCard.jsx';

export default function Product() {
  const { slug } = useParams();
  const { add } = useCart();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [qty, setQty] = useState(1);
  const [related, setRelated] = useState(null);
  const [addPulse, setAddPulse] = useState(false);

  useEffect(() => {
    setProduct(null);
    setError(null);
    setRelated(null);
    setQty(1);
    Api.getProduct(slug)
      .then(({ product: p }) => {
        setProduct(p);
        setSelectedVariantId(p.variants.find((v) => v.stock > 0)?.id || p.variants[0].id);
        Api.getProducts({ category: p.category })
          .then(({ products }) => setRelated(products.filter((r) => r.id !== p.id).slice(0, 4)))
          .catch(() => setRelated([]));
      })
      .catch((err) => setError(err.message));
  }, [slug]);

  if (error) {
    return (
      <div className="container">
        <div className="empty-state"><h3>Product not found</h3><p>{error}</p><Link to="/shop" className="btn btn-primary">Back to shop</Link></div>
      </div>
    );
  }
  if (!product) {
    return <div className="container"><div className="spinner" /></div>;
  }

  const variant = product.variants.find((v) => v.id === selectedVariantId);
  const src = productImageSrc(product);

  function handleAddToCart() {
    add({
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      variantLabel: variant.label,
      price: variant.price,
      image: product.image,
      qty,
    });
    setAddPulse(true);
    setTimeout(() => setAddPulse(false), 650);
    toast(`Added ${qty} × ${product.name} (${variant.label}) to cart`);
  }

  return (
    <>
      <div className="container breadcrumb">
        <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> / <span>{product.name}</span>
      </div>

      <div className="container">
        <div className="product-detail">
          <div className="pd-image">
            {src ? <img src={src} alt={product.name} /> : product.name}
          </div>
          <div className="pd-info">
            <span className="cat-label">{product.category.replace('-', ' ')}</span>
            <h2>{product.name}</h2>
            <div className="brand">by {product.brand || 'Vara Traders'}</div>
            <p className="desc">{product.description || ''}</p>

            <div className="variant-select">
              {product.variants.map((v) => (
                <button
                  type="button"
                  key={v.id}
                  className={`variant-pill ${v.id === selectedVariantId ? 'selected' : ''} ${v.stock <= 0 ? 'disabled' : ''}`}
                  disabled={v.stock <= 0}
                  onClick={() => { setSelectedVariantId(v.id); setQty(1); }}
                >
                  {v.label}<br />{formatEUR(v.price)}
                </button>
              ))}
            </div>

            <div className="pd-price">{formatEUR(variant.price)}</div>
            <div className={`pd-stock ${variant.stock > 0 && variant.stock <= 5 ? 'low' : ''}`}>
              {variant.stock > 0 ? (variant.stock <= 5 ? `Only ${variant.stock} left in stock` : 'In stock') : 'Out of stock'}
            </div>

            <div className="qty-row">
              <div className="qty-stepper">
                <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                <span>{qty}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => {
                    if (qty < variant.stock) setQty((q) => q + 1);
                    else toast(`Only ${variant.stock} available`, true);
                  }}
                >+</button>
              </div>
              <button
                type="button"
                className={`btn btn-primary ${addPulse ? 'btn-add-success' : ''}`}
                disabled={variant.stock <= 0}
                onClick={handleAddToCart}
              >
                {variant.stock <= 0 ? 'Out of stock' : 'Add to cart'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head"><h3>You might also like</h3></div>
          <div className="product-grid">
            {related === null ? <div className="spinner" /> : related.length ? related.map((p) => <ProductCard key={p.id} product={p} />) : <p>No related products.</p>}
          </div>
        </div>
      </section>
    </>
  );
}
