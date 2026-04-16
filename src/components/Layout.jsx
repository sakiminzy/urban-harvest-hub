import { NavLink, Outlet } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const links = [
  { to: '/', label: 'Home' },
  { to: '/explore', label: 'Explore' },
  { to: '/bookings', label: 'Bookings' },
  { to: '/studio', label: 'Studio' },
];

export default function Layout() {
  const {
    enableNotifications,
    installAvailable,
    isOffline,
    notificationsEnabled,
    requestInstall,
    requestLocation,
    theme,
    toggleTheme,
    triggerDemoNotification,
  } = useAppContext();

  return (
    <div className="shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="site-header">
        <div>
          <p className="eyebrow">Urban Harvest Hub</p>
          <h1>Eco-friendly city living, one practical step at a time.</h1>
          <p className="header-status">{isOffline ? 'Offline mode active' : 'Connected to live hub data'}</p>
        </div>
        <div className="header-actions">
          <nav aria-label="Primary" className="site-nav">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="utility-row">
            <button type="button" className="utility-button" onClick={toggleTheme}>
              {theme === 'light' ? 'Dark mode' : 'Light mode'}
            </button>
            <button type="button" className="utility-button" onClick={requestLocation}>
              Use location
            </button>
            <button
              type="button"
              className="utility-button"
              onClick={enableNotifications}
              disabled={notificationsEnabled}
            >
              {notificationsEnabled ? 'Updates enabled' : 'Enable updates'}
            </button>
            <button type="button" className="utility-button" onClick={triggerDemoNotification}>
              Send test push
            </button>
            {installAvailable ? (
              <button type="button" className="utility-button primary-utility" onClick={requestInstall}>
                Install app
              </button>
            ) : null}
          </div>
        </div>
      </header>
      <main id="main-content">
        <Outlet />
      </main>
    </div>
  );
}
