import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  createBooking,
  getAppData,
  saveEvent,
  saveItem,
  saveSubscription,
  sendTestNotification,
} from '../lib/api';

const AppContext = createContext(null);
const STORAGE_KEYS = {
  items: 'urban-harvest-items-cache',
  bookings: 'urban-harvest-bookings-cache',
  theme: 'urban-harvest-theme',
};

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);

  return Uint8Array.from(rawData, (character) => character.charCodeAt(0));
}

function getStoredTheme() {
  const storedTheme = window.localStorage.getItem(STORAGE_KEYS.theme);
  if (storedTheme) {
    return storedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function AppProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem(STORAGE_KEYS.items) || '[]');
    } catch {
      return [];
    }
  });
  const [bookings, setBookings] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem(STORAGE_KEYS.bookings) || '[]');
    } catch {
      return [];
    }
  });
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState(getStoredTheme);
  const [isOffline, setIsOffline] = useState(!window.navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(Notification.permission === 'granted');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(STORAGE_KEYS.theme, theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.items, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.bookings, JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    function handleOnline() {
      setIsOffline(false);
    }

    function handleOffline() {
      setIsOffline(true);
    }

    function handleBeforeInstallPrompt(event) {
      event.preventDefault();
      setInstallPrompt(event);
    }

    function handleInstalled() {
      setInstallPrompt(null);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  async function refreshData() {
    setLoading(true);
    setError('');

    try {
      const data = await getAppData();
      setHealth(data.health);
      setCategories(data.categories);
      setItems(data.items);
      setBookings(data.bookings);
    } catch (refreshError) {
      setError(`${refreshError.message} Showing cached content where available.`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshData();
  }, []);

  async function submitBooking(payload) {
    const booking = await createBooking(payload);
    setBookings((current) => [booking, ...current]);
    return booking;
  }

  async function submitListing(payload, selectedId) {
    const writer = payload.kind === 'event' || payload.kind === 'workshop' ? saveEvent : saveItem;
    const saved = await writer(payload, selectedId);
    setItems((current) => [saved, ...current.filter((item) => item.id !== saved.id)]);
    return saved;
  }

  function toggleTheme() {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  }

  async function requestInstall() {
    if (!installPrompt) {
      return false;
    }

    await installPrompt.prompt();
    const result = await installPrompt.userChoice;
    setInstallPrompt(null);
    return result.outcome === 'accepted';
  }

  function requestLocation() {
    setLocationError('');

    if (!('geolocation' in navigator)) {
      setLocationError('Geolocation is not supported in this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        setLocationError('Location access was denied. You can still browse manually.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  }

  async function enableNotifications() {
    if (!health?.vapidPublicKey) {
      throw new Error('Server notification key is not available yet.');
    }

    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      throw new Error('Notifications are not supported in this browser.');
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission was not granted.');
    }

    const registration = await navigator.serviceWorker.ready;

    if (!('PushManager' in window)) {
      await registration.showNotification('Urban Harvest Hub', {
        body: 'Notifications are enabled for this device.',
        icon: '/icon-192.svg',
      });
      setNotificationsEnabled(true);
      return;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(health.vapidPublicKey),
    });

    await saveSubscription(subscription.toJSON());
    setNotificationsEnabled(true);
    await sendTestNotification({
      title: 'Urban Harvest Hub connected',
      body: 'You will now receive updates about new events and products.',
      url: '/explore',
    });
  }

  async function triggerDemoNotification() {
    await sendTestNotification({
      title: 'Community update',
      body: 'A fresh sustainability listing is ready to view.',
      url: '/explore',
    });
  }

  const value = useMemo(
    () => ({
      bookings,
      categories,
      enableNotifications,
      error,
      health,
      installAvailable: Boolean(installPrompt),
      isOffline,
      items,
      loading,
      location,
      locationError,
      notificationsEnabled,
      refreshData,
      requestInstall,
      requestLocation,
      submitBooking,
      submitListing,
      theme,
      toggleTheme,
      triggerDemoNotification,
    }),
    [
      bookings,
      categories,
      error,
      health,
      installPrompt,
      isOffline,
      items,
      loading,
      location,
      locationError,
      notificationsEnabled,
      theme,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppContext must be used inside AppProvider.');
  }

  return context;
}
