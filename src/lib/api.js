const JSON_HEADERS = {
  'Content-Type': 'application/json',
};

async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: JSON_HEADERS,
    ...options,
    headers: {
      ...JSON_HEADERS,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let message = 'Request failed.';

    try {
      const payload = await response.json();
      message = payload.message || message;
    } catch {
      message = response.statusText || message;
    }

    throw new Error(message);
  }

  return response.json();
}

export function getAppData() {
  return Promise.all([
    request('/api/health'),
    request('/api/categories'),
    request('/api/items'),
    request('/api/bookings'),
  ]).then(([health, categories, items, bookings]) => ({
    health,
    categories,
    items,
    bookings,
  }));
}

export function createBooking(payload) {
  return request('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function saveItem(payload, itemId) {
  return request(itemId ? `/api/items/${itemId}` : '/api/items', {
    method: itemId ? 'PUT' : 'POST',
    body: JSON.stringify(payload),
  });
}

export function saveEvent(payload, itemId) {
  return request(itemId ? `/api/events/${itemId}` : '/api/events', {
    method: itemId ? 'PUT' : 'POST',
    body: JSON.stringify(payload),
  });
}

export function saveSubscription(payload) {
  return request('/api/subscriptions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function sendTestNotification(payload) {
  return request('/api/notifications/test', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
