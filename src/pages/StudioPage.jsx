import { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';

const emptyForm = {
  name: '',
  kind: 'event',
  category: 'food',
  description: '',
  longDescription: '',
  availability: '',
  price: '',
  audience: '',
  schedule: '',
  location: '',
  latitude: '-37.8136',
  longitude: '144.9631',
  accent: '#2f7a52',
  image: '',
  featured: false,
};

export default function StudioPage() {
  const { categories, items, submitListing } = useAppContext();
  const [selectedId, setSelectedId] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const defaultImage = useMemo(
    () =>
      `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">
          <rect width="800" height="500" rx="42" fill="${form.accent}" />
          <text x="56" y="240" fill="#f8f4ea" font-size="54" font-family="Verdana, sans-serif">${form.name || 'Urban Harvest Hub'}</text>
        </svg>
      `)}`,
    [form.accent, form.name],
  );

  function handleSelectChange(value) {
    setSelectedId(value);
    setStatus('');
    setError('');

    if (!value) {
      setForm(emptyForm);
      return;
    }

    const selectedItem = items.find((item) => item.id === value);
    if (!selectedItem) {
      return;
    }

    setForm({
      ...selectedItem,
      latitude: String(selectedItem.latitude),
      longitude: String(selectedItem.longitude),
      featured: Boolean(selectedItem.featured),
    });
  }

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setStatus('');
    setError('');

    try {
      const saved = await submitListing(
        {
          ...form,
          image: form.image || defaultImage,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
        },
        selectedId || undefined,
      );

      setSelectedId(saved.id);
      setStatus(selectedId ? 'Listing updated and synced with the API.' : 'New listing created and synced with the API.');
      handleSelectChange(saved.id);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-stack">
      <section className="panel">
        <div className="section-heading">
          <p className="eyebrow">Content studio</p>
          <h2>Create or update listings through the REST API</h2>
        </div>
        <p>
          This screen demonstrates the POST and PUT workflows required in Task 2. Saving a listing updates the
          SQLite database and can trigger push notifications for subscribed users.
        </p>
      </section>

      <section className="panel">
        <label>
          Edit an existing listing
          <select value={selectedId} onChange={(event) => handleSelectChange(event.target.value)}>
            <option value="">Create a new listing</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="panel" aria-labelledby="studio-form-heading">
        <div className="section-heading">
          <p className="eyebrow">REST form</p>
          <h2 id="studio-form-heading">{selectedId ? 'Update listing' : 'Create listing'}</h2>
        </div>
        <form className="studio-form" onSubmit={handleSubmit}>
          <label>
            Name
            <input required value={form.name} onChange={(event) => updateField('name', event.target.value)} />
          </label>
          <label>
            Type
            <select value={form.kind} onChange={(event) => updateField('kind', event.target.value)}>
              <option value="product">Product</option>
              <option value="event">Event</option>
              <option value="workshop">Workshop</option>
            </select>
          </label>
          <label>
            Category
            <select value={form.category} onChange={(event) => updateField('category', event.target.value)}>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Short description
            <input required value={form.description} onChange={(event) => updateField('description', event.target.value)} />
          </label>
          <label className="full-width">
            Long description
            <textarea
              required
              rows="4"
              value={form.longDescription}
              onChange={(event) => updateField('longDescription', event.target.value)}
            />
          </label>
          <label>
            Availability
            <input required value={form.availability} onChange={(event) => updateField('availability', event.target.value)} />
          </label>
          <label>
            Price
            <input required value={form.price} onChange={(event) => updateField('price', event.target.value)} />
          </label>
          <label>
            Audience
            <input required value={form.audience} onChange={(event) => updateField('audience', event.target.value)} />
          </label>
          <label>
            Schedule
            <input required value={form.schedule} onChange={(event) => updateField('schedule', event.target.value)} />
          </label>
          <label>
            Location
            <input required value={form.location} onChange={(event) => updateField('location', event.target.value)} />
          </label>
          <label>
            Latitude
            <input required value={form.latitude} onChange={(event) => updateField('latitude', event.target.value)} />
          </label>
          <label>
            Longitude
            <input required value={form.longitude} onChange={(event) => updateField('longitude', event.target.value)} />
          </label>
          <label>
            Accent color
            <input required value={form.accent} onChange={(event) => updateField('accent', event.target.value)} />
          </label>
          <label className="full-width">
            Image URL or data URI
            <textarea rows="3" value={form.image} onChange={(event) => updateField('image', event.target.value)} />
          </label>
          <label className="checkbox-label full-width">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(event) => updateField('featured', event.target.checked)}
            />
            Feature this listing on the homepage
          </label>
          <button className="primary-button" type="submit" disabled={saving}>
            {saving ? 'Saving...' : selectedId ? 'Update listing' : 'Create listing'}
          </button>
          {status ? (
            <p className="success-message" role="status">
              {status}
            </p>
          ) : null}
          {error ? (
            <p className="error-message" role="alert">
              {error}
            </p>
          ) : null}
        </form>
      </section>
    </div>
  );
}
