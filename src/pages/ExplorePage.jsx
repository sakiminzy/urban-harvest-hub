import { useMemo, useState } from 'react';
import BookingForm from '../components/BookingForm';
import CategorySelector from '../components/CategorySelector';
import ItemCard from '../components/ItemCard';
import { useAppContext } from '../context/AppContext';

export default function ExplorePage() {
  const { categories, items, loading, location } = useAppContext();
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeKind, setActiveKind] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const visibleItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchesKind = activeKind === 'all' || item.kind === activeKind;
      const query = searchTerm.trim().toLowerCase();
      const matchesSearch =
        query === '' ||
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query);

      return matchesCategory && matchesKind && matchesSearch;
    });
  }, [activeCategory, activeKind, items, searchTerm]);

  const detailItem = visibleItems.find((item) => item.id === selectedItem?.id) ?? visibleItems[0] ?? null;

  return (
    <div className="page-stack">
      <CategorySelector categories={categories} value={activeCategory} onChange={setActiveCategory} />

      <section className="panel controls-panel" aria-label="Search and filter controls">
        <div className="section-heading">
          <p className="eyebrow">Search and filter</p>
          <h2>Find content by keyword, category, or content type</h2>
        </div>
        <div className="controls-grid">
          <label>
            Search the hub
            <input
              type="search"
              value={searchTerm}
              placeholder="Search by title, description, or location"
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>
          <label>
            Filter by type
            <select value={activeKind} onChange={(event) => setActiveKind(event.target.value)}>
              <option value="all">All types</option>
              <option value="product">Products</option>
              <option value="event">Events</option>
              <option value="workshop">Workshops</option>
            </select>
          </label>
          <div className="status-tile">
            <strong>{visibleItems.length}</strong>
            <span>matching results</span>
          </div>
          <div className="status-tile">
            <strong>{location ? 'On' : 'Off'}</strong>
            <span>geolocation mode</span>
          </div>
        </div>
      </section>

      <section className="explore-layout" aria-label="Filtered listings and details">
        <div className="panel">
          <div className="section-heading">
            <p className="eyebrow">Detail list</p>
            <h2>{activeCategory === 'all' ? 'All eco-friendly listings' : 'Category results'}</h2>
          </div>
          {loading ? <p>Loading live content...</p> : null}
          <div className="card-list">
            {visibleItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                selected={detailItem?.id === item.id}
                onSelect={setSelectedItem}
              />
            ))}
          </div>
        </div>

        {detailItem ? (
          <div className="detail-stack">
            <section className="panel detail-panel" aria-labelledby="detail-heading">
              <img className="detail-image" src={detailItem.image} alt="" />
              <div className="section-heading">
                <p className="eyebrow">Selected item</p>
                <h2 id="detail-heading">{detailItem.name}</h2>
              </div>
              <div className="detail-meta" aria-label="Listing details">
                <span className="tag">{detailItem.kind}</span>
                <span className="tag">{detailItem.category}</span>
                <span className="tag">{detailItem.price}</span>
              </div>
              <p>{detailItem.longDescription}</p>
              <dl className="info-grid">
                <div>
                  <dt>Availability</dt>
                  <dd>{detailItem.availability}</dd>
                </div>
                <div>
                  <dt>Audience</dt>
                  <dd>{detailItem.audience}</dd>
                </div>
                <div>
                  <dt>Schedule</dt>
                  <dd>{detailItem.schedule}</dd>
                </div>
                <div>
                  <dt>Location</dt>
                  <dd>{detailItem.location}</dd>
                </div>
              </dl>
            </section>
            <BookingForm item={detailItem} />
          </div>
        ) : (
          <section className="panel">
            <h2>No items found</h2>
            <p>Try another category or search term to view available products, events, or workshops.</p>
          </section>
        )}
      </section>
    </div>
  );
}
