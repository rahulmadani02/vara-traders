import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Api, formatEUR, productImageSrc } from '../api.js';

// rahul: live type-ahead search — shows a dropdown of matching products as
// the person types, same debounced-fetch behavior as the original site
export default function SearchBar({ className = '' }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const wrapRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  function handleChange(e) {
    const value = e.target.value;
    setQuery(value);
    clearTimeout(debounceRef.current);
    if (value.trim().length < 1) {
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const { products } = await Api.getProducts({ search: value.trim() });
        setResults(products);
        setOpen(true);
      } catch {
        setOpen(false);
      }
    }, 250);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setOpen(false);
    navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
  }

  const top = results ? results.slice(0, 6) : [];

  return (
    <div className={`search-form-wrap ${className}`} ref={wrapRef}>
      <form className="search-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="search"
          autoComplete="off"
          placeholder="Search rice, dal, spices…"
          value={query}
          onChange={handleChange}
          onFocus={() => { if (results && results.length) setOpen(true); }}
        />
        <button type="submit">Search</button>
      </form>

      <div className={`search-suggestions ${open ? 'open' : ''}`}>
        {results && results.length === 0 ? (
          <div className="search-suggestion-empty">No products match "{query}"</div>
        ) : (
          <>
            {top.map((p) => {
              const src = productImageSrc(p);
              return (
                <Link
                  key={p.id}
                  to={`/product/${p.slug}`}
                  className="search-suggestion-item"
                  onClick={() => setOpen(false)}
                >
                  <span className="thumb-sm">{src ? <img src={src} alt="" loading="lazy" /> : null}</span>
                  <span className="info">
                    <span className="name">{p.name}</span><br />
                    <span className="cat">{p.category.replace('-', ' ')}</span>
                  </span>
                  <span className="price">{formatEUR(p.onSale ? p.discountedMinPrice : p.minPrice)}</span>
                </Link>
              );
            })}
            {results && results.length > 0 && (
              <Link
                to={`/shop?search=${encodeURIComponent(query.trim())}`}
                className="search-suggestion-viewall"
                onClick={() => setOpen(false)}
              >
                See all {results.length} results →
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
}
