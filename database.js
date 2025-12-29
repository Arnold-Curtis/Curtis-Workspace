const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database ' + dbPath + ': ' + err.message);
  } else {
    console.log('Connected to the SQLite database.');

    // Initialize tables
    db.serialize(() => {
      // Contacts table
      db.run(`CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        message TEXT,
        timestamp TEXT
      )`, (err) => {
        if (err) {
          console.error('Error creating contacts table:', err.message);
        } else {
            console.log('Contacts table ready');
        }
      });

      // Bookings table
      db.run(`CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        phone TEXT,
        date TEXT,
        time TEXT,
        topic TEXT,
        message TEXT,
        status TEXT DEFAULT 'Pending',
        timestamp TEXT
      )`, (err) => {
        if (err) {
          console.error('Error creating bookings table:', err.message);
        } else {
            console.log('Bookings table ready');
        }
      });

      // Guestbook entries table
      db.run(`CREATE TABLE IF NOT EXISTS guestbook_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        role TEXT,
        message TEXT,
        status TEXT DEFAULT 'pending',
        timestamp TEXT
      )`, (err) => {
        if (err) {
          console.error('Error creating guestbook_entries table:', err.message);
        } else {
            console.log('Guestbook entries table ready');
        }
      });
    });
  }
});

module.exports = db;
