import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatEUR, productImageSrc } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function ProductCard({ product }) {
  const { add } = useCart();
  const toast = useToast();

  const inStockVariants = product.variants.filter((v) => v.stock > 0);
  const defaultVariant = inStockVariants[0] || product.variants[0];
  const [selectedVariantId, setSelectedVariantId] = useState(defaultVariant.id);
  const [justAdded, setJustAdded] = useState(false);

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId) || defaultVariant;
  const src = productImageSrc(product);

  // rahul: discount is a flat product-level percentage — apply it to
  // whichever variant is currently selected so the price shown always
  // matches the size picked in the dropdown, not just the cheapest one
  const discountedPrice = product.onSale
    ? Math.round(selectedVariant.price * (1 - product.discountPercent / 100) * 100) / 100
    : selectedVariant.price;

  function handleAdd(e) {
    e.preventDefault();
    add({
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      variantLabel: selectedVariant.label,
      price: selectedVariant.price,
      image: product.image,
      qty: 1,
    });
    toast(`Added ${product.name} (${selectedVariant.label}) to cart`);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 650);
  }

  return (
    <div className="product-card">
      <Link to={`/product/${product.slug}`} className="product-card-link">
        <div className="thumb">
          {product.onSale && <span className="sale-badge">-{product.discountPercent}%</span>}
          {src ? <img src={src} alt={product.name} loading="lazy" /> : <span className="thumb-fallback-text">{product.name}</span>}
          <span className="weight-badge">{selectedVariant.label}</span>
        </div>
        <div className="body">
          <span className="cat-label">{product.category.replace('-', ' ')}</span>
          <h4>{product.name}</h4>
          <div className="price-row">
            <span className="price">
              {product.onSale ? (
                <>
                  <span className="price-was">{formatEUR(selectedVariant.price)}</span>
                  {formatEUR(discountedPrice)}
                </>
              ) : (
                formatEUR(selectedVariant.price)
              )}
            </span>
            {!product.inStock && <span className="out-of-stock-tag">Out of stock</span>}
          </div>
        </div>
      </Link>

      {/* rahul: quick-add — pick a size and add to cart right from the grid,
          no need to open the product page */}
      {product.inStock && (
        <div className="product-card-add">
          <select
            className="qty-select"
            value={selectedVariantId}
            onChange={(e) => setSelectedVariantId(e.target.value)}
            aria-label={`Choose size for ${product.name}`}
          >
            {product.variants.map((v) => (
              <option key={v.id} value={v.id} disabled={v.stock <= 0}>
                {v.label}{v.stock <= 0 ? ' (out of stock)' : ''}
              </option>
            ))}
          </select>
          <button
            type="button"
            className={`btn btn-primary btn-sm add-btn ${justAdded ? 'btn-add-success' : ''}`}
            onClick={handleAdd}
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}
