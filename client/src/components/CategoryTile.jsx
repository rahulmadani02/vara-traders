const CATEGORY_TILE_IMAGES = {
  rice: 'basmati-rice',
  'dals-pulses': 'rajma',
  'nuts-seeds': 'red-peanuts',
};

export default function CategoryTile({ category, active, onClick }) {
  const img = CATEGORY_TILE_IMAGES[category.id];
  return (
    <button type="button" className={`category-tile ${active ? 'active' : ''}`} onClick={onClick}>
      <span className="category-tile-image">
        {img ? <img src={`/images/${img}.jpg`} alt={category.name} loading="lazy" /> : null}
      </span>
      <span className="category-tile-name">{category.name}</span>
      <span className="category-tile-count">{category.productCount} items</span>
    </button>
  );
}
