import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import webpush from 'web-push';
import { all, get, initialiseDatabase, run } from './db.js';

const app = express();
const port = Number(process.env.PORT || 3001);
const distDirectory = path.resolve('dist');

const vapidKeys = {
  publicKey:
    process.env.VAPID_PUBLIC_KEY ||
    'BKO1_T_EQzF39ultSVfodYjpYPsliHMjhpk0fzKVgzsrlQIqGG-5o4_0wzSPYx2lNsnWNm1Kkb4h_SqOI1ub9oA',
  privateKey: process.env.VAPID_PRIVATE_KEY || '-r9rhgf8YFrwodY5303fCPnHqCUWuyCR8UUF121D97g',
};

webpush.setVapidDetails('mailto:urbanharvesthub@example.com', vapidKeys.publicKey, vapidKeys.privateKey);

app.use(express.json({ limit: '1mb' }));

function createSlug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
}

function serialiseItem(row) {
  return {
    ...row,
    featured: Boolean(row.featured),
  };
}

function buildFilters(query, eventOnly = false) {
  const clauses = [];
  const params = [];

  if (eventOnly) {
    clauses.push(`kind IN ('event', 'workshop')`);
  }

  if (query.category && query.category !== 'all') {
    clauses.push('category = ?');
    params.push(query.category);
  }

  if (query.kind && query.kind !== 'all') {
    clauses.push('kind = ?');
    params.push(query.kind);
  }

  if (query.search) {
    clauses.push('(name LIKE ? OR description LIKE ? OR location LIKE ?)');
    params.push(`%${query.search}%`, `%${query.search}%`, `%${query.search}%`);
  }

  return {
    whereClause: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '',
    params,
  };
}

function validateItemPayload(payload, eventOnly = false) {
  const requiredFields = [
    'name',
    'category',
    'description',
    'longDescription',
    'availability',
    'price',
    'audience',
    'schedule',
    'location',
    'latitude',
    'longitude',
    'accent',
    'image',
  ];
  const missingFields = requiredFields.filter((field) => payload[field] === undefined || payload[field] === '');

  if (missingFields.length > 0) {
    return {
      valid: false,
      message: `Missing required fields: ${missingFields.join(', ')}`,
    };
  }

  const allowedKinds = eventOnly ? ['event', 'workshop'] : ['product', 'event', 'workshop'];
  if (!allowedKinds.includes(payload.kind)) {
    return {
      valid: false,
      message: `Kind must be one of: ${allowedKinds.join(', ')}`,
    };
  }

  if (Number.isNaN(Number(payload.latitude)) || Number.isNaN(Number(payload.longitude))) {
    return {
      valid: false,
      message: 'Latitude and longitude must be valid numbers.',
    };
  }

  return { valid: true };
}

function validateBookingPayload(payload) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!payload.itemId || !payload.itemName || !payload.kind || !payload.name || !payload.email) {
    return { valid: false, message: 'Booking requires item, name, and email details.' };
  }

  if (!emailPattern.test(payload.email)) {
    return { valid: false, message: 'Please provide a valid email address.' };
  }

  const guests = Number(payload.guests);
  if (!Number.isInteger(guests) || guests < 1 || guests > 8) {
    return { valid: false, message: 'Guests must be an integer between 1 and 8.' };
  }

  return { valid: true };
}

async function sendPushUpdate(payload) {
  const subscriptions = await all('SELECT id, subscription FROM subscriptions');

  await Promise.all(
    subscriptions.map(async (entry) => {
      try {
        await webpush.sendNotification(JSON.parse(entry.subscription), JSON.stringify(payload));
      } catch (error) {
        if (error.statusCode === 404 || error.statusCode === 410) {
          await run('DELETE FROM subscriptions WHERE id = ?', [entry.id]);
        } else {
          console.error('Push delivery failed:', error.message);
        }
      }
    }),
  );
}

async function createItemRecord(payload) {
  const id = payload.id || createSlug(payload.name);
  const updatedAt = new Date().toISOString();

  await run(
    `
      INSERT INTO items (
        id, name, kind, category, description, longDescription, availability, price,
        audience, schedule, location, latitude, longitude, accent, featured, image, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      payload.name,
      payload.kind,
      payload.category,
      payload.description,
      payload.longDescription,
      payload.availability,
      payload.price,
      payload.audience,
      payload.schedule,
      payload.location,
      Number(payload.latitude),
      Number(payload.longitude),
      payload.accent,
      payload.featured ? 1 : 0,
      payload.image,
      updatedAt,
    ],
  );

  return get('SELECT * FROM items WHERE id = ?', [id]);
}

async function updateItemRecord(itemId, payload) {
  const updatedAt = new Date().toISOString();

  await run(
    `
      UPDATE items
      SET name = ?, kind = ?, category = ?, description = ?, longDescription = ?, availability = ?,
          price = ?, audience = ?, schedule = ?, location = ?, latitude = ?, longitude = ?,
          accent = ?, featured = ?, image = ?, updatedAt = ?
      WHERE id = ?
    `,
    [
      payload.name,
      payload.kind,
      payload.category,
      payload.description,
      payload.longDescription,
      payload.availability,
      payload.price,
      payload.audience,
      payload.schedule,
      payload.location,
      Number(payload.latitude),
      Number(payload.longitude),
      payload.accent,
      payload.featured ? 1 : 0,
      payload.image,
      updatedAt,
      itemId,
    ],
  );

  return get('SELECT * FROM items WHERE id = ?', [itemId]);
}

app.get('/api/health', async (_request, response, next) => {
  try {
    const itemCount = await get('SELECT COUNT(*) AS count FROM items');
    const bookingCount = await get('SELECT COUNT(*) AS count FROM bookings');

    response.json({
      ok: true,
      itemCount: itemCount.count,
      bookingCount: bookingCount.count,
      vapidPublicKey: vapidKeys.publicKey,
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/categories', async (_request, response, next) => {
  try {
    response.json(await all('SELECT * FROM categories ORDER BY label ASC'));
  } catch (error) {
    next(error);
  }
});

app.get('/api/items', async (request, response, next) => {
  try {
    const { whereClause, params } = buildFilters(request.query);
    const rows = await all(
      `SELECT * FROM items ${whereClause} ORDER BY featured DESC, updatedAt DESC, name ASC`,
      params,
    );
    response.json(rows.map(serialiseItem));
  } catch (error) {
    next(error);
  }
});

app.get('/api/items/:id', async (request, response, next) => {
  try {
    const item = await get('SELECT * FROM items WHERE id = ?', [request.params.id]);

    if (!item) {
      response.status(404).json({ message: 'Item not found.' });
      return;
    }

    response.json(serialiseItem(item));
  } catch (error) {
    next(error);
  }
});

app.post('/api/items', async (request, response, next) => {
  try {
    const validation = validateItemPayload(request.body);
    if (!validation.valid) {
      response.status(400).json({ message: validation.message });
      return;
    }

    const createdItem = await createItemRecord(request.body);
    await sendPushUpdate({
      title: 'New Urban Harvest update',
      body: `${createdItem.name} is now available in the hub.`,
      url: `/items/${createdItem.id}`,
    });
    response.status(201).json(serialiseItem(createdItem));
  } catch (error) {
    if (String(error.message).includes('UNIQUE')) {
      response.status(409).json({ message: 'An item with that id already exists.' });
      return;
    }

    next(error);
  }
});

app.put('/api/items/:id', async (request, response, next) => {
  try {
    const validation = validateItemPayload(request.body);
    if (!validation.valid) {
      response.status(400).json({ message: validation.message });
      return;
    }

    const existing = await get('SELECT id FROM items WHERE id = ?', [request.params.id]);
    if (!existing) {
      response.status(404).json({ message: 'Item not found.' });
      return;
    }

    const updatedItem = await updateItemRecord(request.params.id, request.body);
    await sendPushUpdate({
      title: 'Urban Harvest listing updated',
      body: `${updatedItem.name} has fresh details for the community.`,
      url: `/items/${updatedItem.id}`,
    });
    response.json(serialiseItem(updatedItem));
  } catch (error) {
    next(error);
  }
});

app.get('/api/events', async (request, response, next) => {
  try {
    const { whereClause, params } = buildFilters(request.query, true);
    const rows = await all(
      `SELECT * FROM items ${whereClause} ORDER BY updatedAt DESC, name ASC`,
      params,
    );
    response.json(rows.map(serialiseItem));
  } catch (error) {
    next(error);
  }
});

app.post('/api/events', async (request, response, next) => {
  try {
    const payload = {
      ...request.body,
      kind: request.body.kind || 'event',
    };
    const validation = validateItemPayload(payload, true);

    if (!validation.valid) {
      response.status(400).json({ message: validation.message });
      return;
    }

    const createdItem = await createItemRecord(payload);
    await sendPushUpdate({
      title: 'New community event added',
      body: `${createdItem.name} is ready for registrations.`,
      url: `/items/${createdItem.id}`,
    });
    response.status(201).json(serialiseItem(createdItem));
  } catch (error) {
    if (String(error.message).includes('UNIQUE')) {
      response.status(409).json({ message: 'An item with that id already exists.' });
      return;
    }

    next(error);
  }
});

app.put('/api/events/:id', async (request, response, next) => {
  try {
    const payload = {
      ...request.body,
      kind: request.body.kind || 'event',
    };
    const validation = validateItemPayload(payload, true);

    if (!validation.valid) {
      response.status(400).json({ message: validation.message });
      return;
    }

    const existing = await get('SELECT id FROM items WHERE id = ?', [request.params.id]);
    if (!existing) {
      response.status(404).json({ message: 'Event not found.' });
      return;
    }

    const updatedItem = await updateItemRecord(request.params.id, payload);
    await sendPushUpdate({
      title: 'Event update published',
      body: `${updatedItem.name} now has updated details.`,
      url: `/items/${updatedItem.id}`,
    });
    response.json(serialiseItem(updatedItem));
  } catch (error) {
    next(error);
  }
});

app.get('/api/bookings', async (_request, response, next) => {
  try {
    response.json(await all('SELECT * FROM bookings ORDER BY createdAt DESC'));
  } catch (error) {
    next(error);
  }
});

app.post('/api/bookings', async (request, response, next) => {
  try {
    const validation = validateBookingPayload(request.body);
    if (!validation.valid) {
      response.status(400).json({ message: validation.message });
      return;
    }

    const createdAt = new Date().toISOString();
    const result = await run(
      `
        INSERT INTO bookings (itemId, itemName, kind, name, email, guests, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        request.body.itemId,
        request.body.itemName,
        request.body.kind,
        request.body.name,
        request.body.email,
        Number(request.body.guests),
        createdAt,
      ],
    );

    const booking = await get('SELECT * FROM bookings WHERE id = ?', [result.lastID]);
    response.status(201).json(booking);
  } catch (error) {
    next(error);
  }
});

app.post('/api/subscriptions', async (request, response, next) => {
  try {
    if (!request.body?.endpoint) {
      response.status(400).json({ message: 'Push subscription endpoint is required.' });
      return;
    }

    await run(
      `
        INSERT INTO subscriptions (endpoint, subscription, createdAt)
        VALUES (?, ?, ?)
        ON CONFLICT(endpoint) DO UPDATE SET subscription = excluded.subscription, createdAt = excluded.createdAt
      `,
      [request.body.endpoint, JSON.stringify(request.body), new Date().toISOString()],
    );

    response.status(201).json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.post('/api/notifications/test', async (request, response, next) => {
  try {
    await sendPushUpdate({
      title: request.body?.title || 'Urban Harvest Hub',
      body: request.body?.body || 'Fresh events and products are ready to explore.',
      url: request.body?.url || '/explore',
    });

    response.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ message: 'Something went wrong on the server.' });
});

if (fs.existsSync(distDirectory)) {
  app.use(express.static(distDirectory));
  app.get(/^(?!\/api).*/, (_request, response) => {
    response.sendFile(path.join(distDirectory, 'index.html'));
  });
}

initialiseDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Urban Harvest Hub server running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialise database:', error);
    process.exit(1);
  });
