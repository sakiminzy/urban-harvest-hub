import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const BookingContext = createContext(null);
const STORAGE_KEY = 'urban-harvest-hub-bookings';

export function BookingProvider({ children }) {
  const [bookings, setBookings] = useState(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  }, [bookings]);

  const value = useMemo(
    () => ({
      bookings,
      addBooking(entry) {
        setBookings((current) => [
          {
            ...entry,
            id: `${entry.itemId}-${Date.now()}`,
            createdAt: new Date().toISOString(),
          },
          ...current,
        ]);
      },
    }),
    [bookings],
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBookings() {
  const context = useContext(BookingContext);

  if (!context) {
    throw new Error('useBookings must be used within a BookingProvider');
  }

  return context;
}
