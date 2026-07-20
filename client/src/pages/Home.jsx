import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Api, PRODUCT_IMAGES_AVAILABLE, productImageSrc } from '../api.js';
import ProductCard from '../components/ProductCard.jsx';
import CategoryTile from '../components/CategoryTile.jsx';

const POSTERS = [
  { file: 'poster-offer', label: 'Exclusive offer for Athlone & Limerick — 5% off on bills above €50' },
  { file: 'poster-delivery', label: 'Amruth Groceries Delivery Service' },
  { file: 'poster-student', label: 'Student Special — 10% off with valid Student ID' },
  { file: 'poster-whatsapp', label: 'Join our WhatsApp Community' },
  { file: 'poster-instagram', label: 'Follow us on Instagram' },
];

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState(null);
  const heroTimer = useRef(null);

  useEffect(() => {
    Api.getCategories().then((r) => setCategories(r.categories)).catch(() => {});
    Api.getProducts().then((r) => setProducts(r.products)).catch(() => {});
  }, []);

  useEffect(() => {
    heroTimer.current = setInterval(() => {
      setHeroIndex((i) => (i + 1) % POSTERS.length);
    }, 4500);
    return () => clearInterval(heroTimer.current);
  }, []);

  async function selectCategory(cat) {
    if (activeCategory === cat.id) {
      setActiveCategory(null);
      setCategoryProducts(null);
      return;
    }
    setActiveCategory(cat.id);
    setCategoryProducts(null);
    try {
      const { products: catProducts } = await Api.getProducts({ category: cat.id });
      setCategoryProducts(catProducts);
    } catch {
      setCategoryProducts([]);
    }
  }

  const withPhotos = products.filter((p) => PRODUCT_IMAGES_AVAILABLE.has(p.image));
  const marquee = [...withPhotos, ...withPhotos];
  const onOffer = products.filter((p) => p.onSale).slice(0, 8);
  const popular = products.filter((p) => !p.onSale).slice(0, 8);

  // rahul: home page only — "Dals & Pulses" reads as "Lentils" here; every
  // other page (shop sidebar, header nav, footer, product labels) keeps
  // the original "Dals & Pulses" wording
  const homeCategories = categories.map((c) => (c.id === 'dals-pulses' ? { ...c, name: 'Lentils' } : c));
  const activeCategoryObj = homeCategories.find((c) => c.id === activeCategory);

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <div className="eyebrow">Est. trading house · Direct from the godown</div>
            <h2>The daily <em>staples</em> your kitchen actually runs on.</h2>
            <p className="lede">Aged basmati, stone-milled atta, cold-pressed oils and hand-blended masalas — sourced the way a trader would pick them for his own family, weighed and packed to order.</p>
            <div className="hero-ctas">
              <Link to="/shop" className="btn btn-primary">Shop all groceries</Link>
              <Link to="/shop?category=rice" className="btn btn-outline">Browse rice →</Link>
            </div>
          </div>
          <div className="hero-banner">
            {POSTERS.map((p, i) => (
              <div key={p.file} className={`hero-banner-slide ${i === heroIndex ? 'is-active' : ''}`} style={{ backgroundImage: `url('/images/${p.file}.jpg')` }}>
                <img src={`/images/${p.file}.jpg`} alt={p.label} loading="lazy" />
              </div>
            ))}
            <div className="hero-banner-dots">
              {POSTERS.map((p, i) => (
                <button key={p.file} type="button" className={`hero-banner-dot ${i === heroIndex ? 'is-active' : ''}`} aria-label={`Show poster ${i + 1}`} onClick={() => setHeroIndex(i)} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {marquee.length > 0 && (
        <div className="marquee-section">
          <div className="marquee-track">
            {marquee.map((p, i) => (
              <Link key={`${p.id}-${i}`} to={`/product/${p.slug}`} className="marquee-item" title={p.name}>
                <img src={productImageSrc(p)} alt={p.name} loading="lazy" />
              </Link>
            ))}
          </div>
        </div>
      )}

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h3>Shop by category</h3>
          </div>
          <div className="category-rail">
            {homeCategories.map((c) => (
              <CategoryTile key={c.id} category={c} active={activeCategory === c.id} onClick={() => selectCategory(c)} />
            ))}
          </div>

          {activeCategory && (
            <div style={{ marginTop: 32 }}>
              <div className="section-head">
                <h3>{activeCategoryObj?.name || 'Category'}</h3>
                <a href="#" className="see-all" onClick={(e) => { e.preventDefault(); setActiveCategory(null); setCategoryProducts(null); }}>Close ✕</a>
              </div>
              <div className="product-grid">
                {categoryProducts === null ? (
                  <div className="spinner" />
                ) : categoryProducts.length ? (
                  categoryProducts.map((p) => <ProductCard key={p.id} product={p} />)
                ) : (
                  <p>No products in this category yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <div>
              <h3>Today's offers</h3>
              <p className="section-subtitle">Don't miss out best deals — grab them before they're gone.</p>
            </div>
            <Link to="/shop" className="see-all">See all products →</Link>
          </div>
          <div className="product-grid">
            {!products.length ? <div className="spinner" /> : onOffer.length ? onOffer.map((p) => <ProductCard key={p.id} product={p} />) : <p>No offers right now — check back soon.</p>}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <h3>Popular products</h3>
            <Link to="/shop" className="see-all">See all products →</Link>
          </div>
          <div className="product-grid">
            {!products.length ? <div className="spinner" /> : popular.length ? popular.map((p) => <ProductCard key={p.id} product={p} />) : <p>No products yet — check back soon.</p>}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <h3>Why choose Vara Traders</h3>
          </div>
          <div className="why-us-grid">
            <div className="why-us-card">
              <div className="icon">⚖️</div>
              <h4>Weighed fresh, every time</h4>
              <p>Every order is packed the day it ships — never left sitting in a warehouse.</p>
            </div>
            <div className="why-us-card">
              <div className="icon">🌾</div>
              <h4>Trader-sourced quality</h4>
              <p>We buy the way we'd buy for our own kitchen — checked before it's packed for yours.</p>
            </div>
            <div className="why-us-card">
              <div className="icon">📦</div>
              <h4>Bulk-friendly pricing</h4>
              <p>From 500g to 10kg, priced fairly at every size — no penalty for buying small.</p>
            </div>
            <div className="why-us-card">
              <div className="icon">🚚</div>
              <h4>Reliable delivery in Ireland</h4>
              <p>Free delivery on orders above €50, with Cash on Delivery or online payment.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="trust-strip">
        <div className="container">
          <div className="trust-item"><strong>Weighed fresh</strong>Every order packed the day it ships</div>
          <div className="trust-item"><strong>Bulk friendly</strong>1kg to 25kg — priced fairly at any size</div>
          <div className="trust-item"><strong>COD available</strong>Pay online or at your doorstep</div>
          <div className="trust-item"><strong>Trader-checked</strong>Every sack and tin inspected before packing</div>
        </div>
      </div>
    </>
  );
}
