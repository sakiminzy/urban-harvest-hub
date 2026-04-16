import { useAppContext } from '../context/AppContext';

export default function BookingsPage() {
  const { bookings } = useAppContext();

  return (
    <section className="panel" aria-labelledby="bookings-heading">
      <div className="section-heading">
        <p className="eyebrow">Database-backed</p>
        <h2 id="bookings-heading">Your registrations and reservations</h2>
      </div>
      {bookings.length === 0 ? (
        <p>No bookings yet. Explore a listing and submit the form to save it in the SQLite database.</p>
      ) : (
        <div className="booking-list" role="list">
          {bookings.map((booking) => (
            <article key={booking.id} className="booking-card" role="listitem">
              <h3>{booking.itemName}</h3>
              <p>{booking.kind}</p>
              <p>
                {booking.name} | {booking.email}
              </p>
              <p>{booking.guests} place(s)</p>
              <p className="muted">{new Date(booking.createdAt).toLocaleString()}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
