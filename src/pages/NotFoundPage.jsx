import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="panel">
      <h2>Page not found</h2>
      <p>The page you requested does not exist in this Progressive Web App.</p>
      <Link className="text-link" to="/">
        Return home
      </Link>
    </section>
  );
}
