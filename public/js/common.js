// public/js/common.js

// NOTE: keeping the function name formatINR since it's already called
// everywhere — it now formats Euros. Rename later with VS Code's
// Find-and-Replace in Files if you'd like it to say formatPrice instead.
function formatINR(amount) {
  return `€${Number(amount).toFixed(2)}`;
}

function toast(message, isError = false) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.style.background = isError ? '#A8342A' : '#1F2E22';
  el.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Filenames we actually have real photos for (in /public/images/).
// Products whose `image` field isn't in this list fall back to the text
// placeholder — this list will grow as more photos come in.
const PRODUCT_IMAGES_AVAILABLE = new Set([
  'chana-dal', 'toor-dal', 'urad-dal', 'urad-gota', 'moong-dal',
  'masoor-dal', 'rajma', 'kala-chana', 'chana-big', 'moong-sabut',
  'red-peanuts', 'pink-peanuts', 'sona-masoori', 'matta-rice',
  'ponni-rice', 'ponni-idly-rice', 'kollam-rice', 'basmati-rice',
]);

function productImageTag(product) {
  if (product.image && PRODUCT_IMAGES_AVAILABLE.has(product.image)) {
    return `<img src="/images/${product.image}.jpg" alt="${escapeHtml(product.name)}" loading="lazy" />`;
  }
  return `<span class="thumb-fallback-text">${escapeHtml(product.name)}</span>`;
}

// Renders the auth-dependent bits of the header (account link + admin link).
function renderHeaderAuthState() {
  const accountSlot = document.getElementById('account-slot');
  if (!accountSlot) return;
  const user = Auth.getUser();
  if (user) {
    accountSlot.innerHTML = `
      <a href="/account.html" class="icon-link">👤 ${escapeHtml(user.name.split(' ')[0])}</a>
      ${user.role === 'admin' ? '<a href="/admin/dashboard.html" class="icon-link">🛠 Admin</a>' : ''}
      <a href="#" id="logout-link" class="icon-link">Log out</a>
    `;
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
      logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        Auth.logout();
      });
    }
  } else {
    accountSlot.innerHTML = `<a href="/login.html" class="icon-link">👤 Log in</a>`;
  }
}

// Builds the mobile hamburger button + slide-down nav panel automatically,
// so no page's HTML needs to be touched individually.
function initMobileNav() {
  const headerRow = document.querySelector('.header-row');
  if (!headerRow) return; // page has no site header (e.g. admin pages)

  const toggle = document.createElement('button');
  toggle.className = 'mobile-nav-toggle';
  toggle.setAttribute('aria-label', 'Menu');
  toggle.textContent = '☰';

  const headerActions = headerRow.querySelector('.header-actions');
  if (headerActions) {
    headerRow.insertBefore(toggle, headerActions);
  } else {
    headerRow.appendChild(toggle);
  }

  const panel = document.createElement('div');
  panel.className = 'mobile-nav-panel';
  panel.id = 'mobile-nav-panel';
  panel.innerHTML = `
    <a href="/index.html">Home</a>
    <a href="/shop.html">Shop</a>
    <a href="/about.html">About</a>
    <a href="/contact.html">Contact</a>
    <a href="/cart.html">Cart</a>
  `;
  headerRow.appendChild(panel);

  toggle.addEventListener('click', () => {
    panel.classList.toggle('open');
    toggle.textContent = panel.classList.contains('open') ? '✕' : '☰';
  });
}

// Live "type-ahead" search: shows a dropdown of matching products as the
// person types, without needing to press Enter or leave the page.
function initLiveSearch() {
  const forms = document.querySelectorAll('.search-form');
  forms.forEach((form) => {
    const input = form.querySelector('input[name="search"]');
    if (!input) return;

    input.setAttribute('autocomplete', 'off');

    // Attached directly to <body> with fixed positioning computed in JS —
    // this guarantees it renders on top of everything else on the page,
    // no matter what stacking/overflow context the search bar sits inside.
    const dropdown = document.createElement('div');
    dropdown.className = 'search-suggestions';
    dropdown.style.position = 'fixed';
    dropdown.style.zIndex = '99999';
    dropdown.style.display = 'none';
    document.body.appendChild(dropdown);

    function positionDropdown() {
      const rect = input.getBoundingClientRect();
      dropdown.style.left = rect.left + 'px';
      dropdown.style.top = rect.bottom + 6 + 'px';
      dropdown.style.width = rect.width + 'px';
    }

    let debounceTimer = null;
    let currentQuery = '';

    input.addEventListener('input', () => {
      const query = input.value.trim();
      clearTimeout(debounceTimer);
      if (query.length < 1) {
        dropdown.style.display = 'none';
        return;
      }
      debounceTimer = setTimeout(() => runSearch(query), 250);
    });

    window.addEventListener('resize', positionDropdown);
    window.addEventListener('scroll', positionDropdown, true);

    async function runSearch(query) {
      currentQuery = query;
      try {
        const { products } = await Api.getProducts({ search: query });
        if (currentQuery !== query) return;

        if (!products.length) {
          dropdown.innerHTML = `<div class="search-suggestion-empty">No products match "${escapeHtml(query)}"</div>`;
        } else {
          const top = products.slice(0, 6);
          dropdown.innerHTML = top.map((p) => `
            <a href="/product.html?slug=${p.slug}" class="search-suggestion-item">
              <span>
                <span class="name">${escapeHtml(p.name)}</span><br/>
                <span class="cat">${escapeHtml(p.category.replace('-', ' '))}</span>
              </span>
              <span class="price">${p.onSale ? formatINR(p.discountedMinPrice) : formatINR(p.minPrice)}</span>
            </a>
          `).join('') + `<a href="/shop.html?search=${encodeURIComponent(query)}" class="search-suggestion-viewall">See all ${products.length} results →</a>`;
        }
        positionDropdown();
        dropdown.style.display = 'block';
      } catch (err) {
        dropdown.style.display = 'none';
      }
    }

    document.addEventListener('click', (e) => {
      if (!form.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = 'none';
      }
    });
    input.addEventListener('focus', () => {
      if (input.value.trim().length >= 1 && dropdown.innerHTML) {
        positionDropdown();
        dropdown.style.display = 'block';
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderHeaderAuthState();
  initMobileNav();
  initLiveSearch();
});