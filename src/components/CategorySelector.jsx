export default function CategorySelector({ categories, value, onChange }) {
  return (
    <section className="panel" aria-labelledby="category-heading">
      <div className="section-heading">
        <p className="eyebrow">Master view</p>
        <h2 id="category-heading">Browse by category</h2>
      </div>
      <div className="chip-row" role="tablist" aria-label="Categories">
        <button
          type="button"
          role="tab"
          aria-selected={value === 'all'}
          className={`chip${value === 'all' ? ' selected' : ''}`}
          onClick={() => onChange('all')}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            role="tab"
            aria-selected={value === category.id}
            className={`chip${value === category.id ? ' selected' : ''}`}
            onClick={() => onChange(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>
    </section>
  );
}
