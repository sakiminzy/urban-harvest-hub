import { Link } from 'react-router-dom';

export default function ItemCard({ item, selected, onSelect }) {
  return (
    <article className={`card${selected ? ' selected' : ''}`}>
      <button
        type="button"
        className="card-button"
        onClick={() => onSelect(item)}
        aria-pressed={selected}
      >
        <img className="card-image" src={item.image} alt="" />
        <div className="card-copy">
          <div className="card-meta">
            <span className="tag">{item.kind}</span>
            <span>{item.price}</span>
          </div>
          <h3>{item.name}</h3>
          <p>{item.description}</p>
          <p className="muted">{item.availability}</p>
          <p className="muted">{item.location}</p>
        </div>
      </button>
      <Link className="text-link" to={`/items/${item.id}`}>
        View details
      </Link>
    </article>
  );
}
