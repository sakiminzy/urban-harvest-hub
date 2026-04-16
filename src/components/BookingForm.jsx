import { useState } from 'react';
import { useAppContext } from '../context/AppContext';

const initialForm = {
  name: '',
  email: '',
  guests: '1',
};

export default function BookingForm({ item }) {
  const { submitBooking } = useAppContext();
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      await submitBooking({
        itemId: item.id,
        itemName: item.name,
        kind: item.kind,
        ...form,
        guests: Number(form.guests),
      });
      setSubmitted(true);
      setForm(initialForm);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="panel" aria-labelledby="booking-heading">
      <div className="section-heading">
        <p className="eyebrow">Action</p>
        <h2 id="booking-heading">{item.kind === 'product' ? 'Reserve this product' : 'Register now'}</h2>
      </div>
      <form className="booking-form" onSubmit={handleSubmit}>
        <label>
          Full name
          <input
            required
            type="text"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
        </label>
        <label>
          Email
          <input
            required
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
        </label>
        <label>
          {item.kind === 'product' ? 'Quantity' : 'Places'}
          <input
            required
            min="1"
            max="8"
            type="number"
            value={form.guests}
            onChange={(event) => setForm((current) => ({ ...current, guests: event.target.value }))}
          />
        </label>
        <button className="primary-button" type="submit" disabled={saving}>
          {saving ? 'Saving...' : item.kind === 'product' ? 'Book product' : 'Register booking'}
        </button>
        {submitted ? (
          <p className="success-message" role="status">
            Your booking was saved to the Urban Harvest Hub database.
          </p>
        ) : null}
        {error ? (
          <p className="error-message" role="alert">
            {error}
          </p>
        ) : null}
      </form>
    </section>
  );
}
