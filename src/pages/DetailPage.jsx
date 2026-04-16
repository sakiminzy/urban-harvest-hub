import { Link, useParams } from 'react-router-dom';
import BookingForm from '../components/BookingForm';
import { useAppContext } from '../context/AppContext';

export default function DetailPage() {
  const { id } = useParams();
  const { items } = useAppContext();
  const item = items.find((entry) => entry.id === id);

  if (!item) {
    return (
      <section className="panel">
        <h2>Listing not found</h2>
        <p>The item you selected is no longer available.</p>
        <Link className="text-link" to="/explore">
          Return to explore
        </Link>
      </section>
    );
  }

  return (
    <div className="page-stack">
      <section className="panel detail-page-panel" aria-labelledby="product-heading">
        <img className="detail-image" src={item.image} alt="" />
        <div className="section-heading">
          <p className="eyebrow">Route detail</p>
          <h2 id="product-heading">{item.name}</h2>
        </div>
        <p>{item.longDescription}</p>
        <dl className="info-grid">
          <div>
            <dt>Category</dt>
            <dd>{item.category}</dd>
          </div>
          <div>
            <dt>Type</dt>
            <dd>{item.kind}</dd>
          </div>
          <div>
            <dt>Price</dt>
            <dd>{item.price}</dd>
          </div>
          <div>
            <dt>Availability</dt>
            <dd>{item.availability}</dd>
          </div>
          <div>
            <dt>Audience</dt>
            <dd>{item.audience}</dd>
          </div>
          <div>
            <dt>Schedule</dt>
            <dd>{item.schedule}</dd>
          </div>
          <div>
            <dt>Location</dt>
            <dd>{item.location}</dd>
          </div>
        </dl>
        <Link className="text-link" to="/explore">
          Back to explore
        </Link>
      </section>
      <BookingForm item={item} />
    </div>
  );
}
