import fs from 'node:fs';
import path from 'node:path';
import sqlite3 from 'sqlite3';
import { categories, seedItems } from '../shared/seedData.js';

const dataDirectory = path.resolve('server', 'data');
const databasePath = path.join(dataDirectory, 'urban-harvest-hub.sqlite');

fs.mkdirSync(dataDirectory, { recursive: true });

const sqlite = sqlite3.verbose();
const db = new sqlite.Database(databasePath);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(error) {
      if (error) {
        reject(error);
        return;
      }

      resolve({
        lastID: this.lastID,
        changes: this.changes,
      });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(rows);
    });
  });
}

async function initialiseDatabase() {
  await run(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      summary TEXT NOT NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      kind TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      longDescription TEXT NOT NULL,
      availability TEXT NOT NULL,
      price TEXT NOT NULL,
      audience TEXT NOT NULL,
      schedule TEXT NOT NULL,
      location TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      accent TEXT NOT NULL,
      featured INTEGER NOT NULL DEFAULT 0,
      image TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      itemId TEXT NOT NULL,
      itemName TEXT NOT NULL,
      kind TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      guests INTEGER NOT NULL,
      createdAt TEXT NOT NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      endpoint TEXT NOT NULL UNIQUE,
      subscription TEXT NOT NULL,
      createdAt TEXT NOT NULL
    )
  `);

  const itemCount = await get('SELECT COUNT(*) AS count FROM items');

  if (itemCount.count === 0) {
    await Promise.all(
      categories.map((category) =>
        run('INSERT INTO categories (id, label, summary) VALUES (?, ?, ?)', [
          category.id,
          category.label,
          category.summary,
        ]),
      ),
    );

    await Promise.all(
      seedItems.map((item) =>
        run(
          `
            INSERT INTO items (
              id, name, kind, category, description, longDescription, availability, price,
              audience, schedule, location, latitude, longitude, accent, featured, image, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            item.id,
            item.name,
            item.kind,
            item.category,
            item.description,
            item.longDescription,
            item.availability,
            item.price,
            item.audience,
            item.schedule,
            item.location,
            item.latitude,
            item.longitude,
            item.accent,
            item.featured,
            item.image,
            new Date().toISOString(),
          ],
        ),
      ),
    );
  }
}

export { all, databasePath, db, get, initialiseDatabase, run };
