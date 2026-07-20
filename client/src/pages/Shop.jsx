import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Api } from '../api.js';
import ProductCard from '../components/ProductCard.jsx';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || '';
  const activeSearch = searchParams.get('search') || '';

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState(null);
  const [sort, setSort] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    Api.getCategories().then((r) => setCategories(r.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    setProducts(null);
    const query = {};
    if (activeCategory) query.category = activeCategory;
    if (activeSearch) query.search = activeSearch;
    if (sort) query.sort = sort;
    Api.getProducts(query)
      .then((r) => setProducts(r.products))
      .catch(() => setProducts([]));
  }, [activeCategory, activeSearch, sort]);

  function selectCategory(id) {
    const next = new URLSearchParams(searchParams);
    if (id) next.set('category', id); else next.delete('category');
    next.delete('search');
    setSearchParams(next);
  }

  const currentCat = categories.find((c) => c.id === activeCategory);
  const filtered = products ? (inStockOnly ? products.filter((p) => p.inStock) : products) : null;

  let title = 'All groceries';
  let subtitle = 'Everything from the godown, priced fairly at every size.';
  if (currentCat) {
    title = currentCat.name;
    subtitle = currentCat.description || '';
  } else if (activeSearch) {
    title = `Search: "${activeSearch}"`;
    subtitle = 'Results matching your search.';
  }

  return (
    <>
      <div className="container breadcrumb">
        <Link to="/">Home</Link> / <span>{currentCat ? currentCat.name : 'Shop'}</span>
      </div>

      <div className="page-head container">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>

      <div className="container section" style={{ paddingTop: 20 }}>
        <div className="shop-layout">
          <aside className="filter-panel">
            <h5>Categories</h5>
            <ul className="filter-list">
              <li><a href="#" className={!activeCategory ? 'active' : ''} onClick={(e) => { e.preventDefault(); selectCategory(''); }}>All products</a></li>
              {categories.map((c) => (
                <li key={c.id}>
                  <a href="#" className={activeCategory === c.id ? 'active' : ''} onClick={(e) => { e.preventDefault(); selectCategory(c.id); }}>
                    {c.name} <span>({c.productCount})</span>
                  </a>
                </li>
              ))}
            </ul>
            <h5>Availability</h5>
            <ul className="filter-list">
              <li><label><input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} /> In stock only</label></li>
            </ul>
          </aside>

          <div>
            <div className="toolbar">
              <span style={{ fontSize: 13.5, color: 'var(--ledger-soft)' }}>
                {filtered ? `${filtered.length} product${filtered.length === 1 ? '' : 's'}` : ''}
              </span>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="">Sort: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name: A–Z</option>
              </select>
            </div>
            <div className="product-grid">
              {filtered === null ? (
                <div className="spinner" />
              ) : filtered.length === 0 ? (
                <div className="empty-state"><h3>No products found</h3><p>Try a different search or category.</p></div>
              ) : (
                filtered.map((p) => <ProductCard key={p.id} product={p} />)
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
