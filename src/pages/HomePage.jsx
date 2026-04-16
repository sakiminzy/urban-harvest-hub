import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function calculateDistance(origin, target) {
  const earthRadiusKm = 6371;
  const deltaLatitude = toRadians(target.latitude - origin.latitude);
  const deltaLongitude = toRadians(target.longitude - origin.longitude);
  const latitudeOne = toRadians(origin.latitude);
  const latitudeTwo = toRadians(target.latitude);

  const a =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(latitudeOne) * Math.cos(latitudeTwo) * Math.sin(deltaLongitude / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function HomePage() {
  const { categories, health, items, loading, location, locationError } = useAppContext();

  const featuredItems = useMemo(() => items.filter((item) => item.featured).slice(0, 3), [items]);
  const nearestItem = useMemo(() => {
    if (!location || items.length === 0) {
      return null;
    }

    return [...items]
      .map((item) => ({
        ...item,
        distanceKm: calculateDistance(location, {
          latitude: Number(item.latitude),
          longitude: Number(item.longitude),
        }),
      }))
      .sort((first, second) => first.distanceKm - second.distanceKm)[0];
  }, [items, location]);

  return (
    <div className="page-stack">
      <section className="hero panel hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Full-stack PWA</p>
          <h2>Explore low-waste products, practical workshops, and community events online or offline.</h2>
          <p>
            Urban Harvest Hub now runs as a Progressive Web App with a live REST API, SQLite database,
            push notifications, install support, and offline caching for returning visitors.
          </p>
          <div className="action-row">
            <Link className="primary-button" to="/explore">
              Start exploring
            </Link>
            <Link className="secondary-button" to="/studio">
              Manage content
            </Link>
          </div>
        </div>
        <aside className="hero-summary" aria-label="Platform summary">
          <p>
            <strong>{loading ? '...' : items.length}</strong> live listings
          </p>
          <p>
            <strong>{categories.length}</strong> sustainability categories
          </p>
          <p>
            <strong>{health?.bookingCount ?? 0}</strong> saved bookings
          </p>
        </aside>
      </section>

      <section className="panel">
        <div className="section-heading">
          <p className="eyebrow">Platform capabilities</p>
          <h2>Built for mobile devices and community updates</h2>
        </div>
        <div className="feature-grid">
          {[
            'Offline-ready service worker caching',
            'Installable manifest with standalone app shell',
            'REST API plus SQLite persistence',
            'Push notifications and device permissions',
            'Geolocation-aware nearby suggestions',
            'Live create/update content workflow',
          ].map((feature) => (
            <article key={feature} className="feature-card">
              <h3>{feature}</h3>
              <p>Purpose-built to satisfy the Task 2 full-stack and PWA requirements.</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel spotlight-panel">
        <div className="section-heading">
          <p className="eyebrow">Featured now</p>
          <h2>Highlights from the live database</h2>
        </div>
        <div className="feature-grid">
          {featuredItems.map((item) => (
            <article key={item.id} className="feature-card">
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <p className="muted">{item.schedule}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <p className="eyebrow">Nearby</p>
          <h2>Use geolocation to find your closest sustainable option</h2>
        </div>
        {nearestItem ? (
          <div className="geo-card">
            <h3>{nearestItem.name}</h3>
            <p>{nearestItem.location}</p>
            <p className="muted">{nearestItem.distanceKm.toFixed(1)} km from your current location.</p>
            <Link className="text-link compact-link" to={`/items/${nearestItem.id}`}>
              View details
            </Link>
          </div>
        ) : (
          <p>
            {locationError || 'Tap "Use location" in the header to surface the closest event, workshop, or product.'}
          </p>
        )}
      </section>
    </div>
  );
}
