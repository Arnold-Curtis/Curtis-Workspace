const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes

// Contacts
app.post('/api/contacts', (req, res) => {
  const { name, email, message, timestamp } = req.body;
  const sql = 'INSERT INTO contacts (name, email, message, timestamp) VALUES (?, ?, ?, ?)';
  const params = [name, email, message, timestamp || new Date().toISOString()];

  db.run(sql, params, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'Contact form submitted successfully',
      data: { id: this.lastID, ...req.body },
      id: this.lastID
    });
  });
});

app.get('/api/contacts', (req, res) => {
  const sql = 'SELECT * FROM contacts ORDER BY timestamp DESC';
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Bookings
app.post('/api/bookings', (req, res) => {
  const { name, email, phone, date, time, topic, message, timestamp } = req.body;
  const sql = 'INSERT INTO bookings (name, email, phone, date, time, topic, message, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  const params = [name, email, phone, date, time, topic, message, timestamp || new Date().toISOString()];

  db.run(sql, params, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'Booking submitted successfully',
      data: { id: this.lastID, ...req.body },
      id: this.lastID
    });
  });
});

app.get('/api/bookings', (req, res) => {
    const sql = 'SELECT * FROM bookings ORDER BY timestamp DESC';
    db.all(sql, [], (err, rows) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json(rows);
    });
  });

// Update Booking Status
app.put('/api/bookings/:id', (req, res) => {
    const { status } = req.body;
    const sql = 'UPDATE bookings SET status = ? WHERE id = ?';
    const params = [status, req.params.id];

    db.run(sql, params, function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: 'Booking status updated', changes: this.changes });
    });
});

// Delete Booking
app.delete('/api/bookings/:id', (req, res) => {
    const sql = 'DELETE FROM bookings WHERE id = ?';
    db.run(sql, req.params.id, function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: 'Booking deleted', changes: this.changes });
    });
});

// Guestbook
app.post('/api/guestbook', (req, res) => {
  const { name, role, message, timestamp } = req.body;
  const sql = 'INSERT INTO guestbook_entries (name, role, message, timestamp) VALUES (?, ?, ?, ?)';
  const params = [name, role, message, timestamp || new Date().toISOString()];

  db.run(sql, params, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'Guestbook entry submitted successfully',
      data: { id: this.lastID, ...req.body },
      id: this.lastID
    });
  });
});

// Public view - approved only
app.get('/api/guestbook', (req, res) => {
  const sql = "SELECT * FROM guestbook_entries WHERE status = 'approved' ORDER BY timestamp DESC";
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Admin view - all entries
app.get('/api/admin/guestbook', (req, res) => {
  const sql = 'SELECT * FROM guestbook_entries ORDER BY timestamp DESC';
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Approve/Reject entries
app.put('/api/admin/guestbook/:id', (req, res) => {
  const { status } = req.body;
  const sql = 'UPDATE guestbook_entries SET status = ? WHERE id = ?';
  const params = [status, req.params.id];

  db.run(sql, params, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'Guestbook entry updated',
      changes: this.changes
    });
  });
});

// Delete Guestbook Entry
app.delete('/api/admin/guestbook/:id', (req, res) => {
    const sql = 'DELETE FROM guestbook_entries WHERE id = ?';
    db.run(sql, req.params.id, function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: 'Guestbook entry deleted', changes: this.changes });
    });
});

// Clear All Contacts
app.delete('/api/admin/contacts', (req, res) => {
  const sql = 'DELETE FROM contacts';
  db.run(sql, [], function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ message: 'All contacts deleted', changes: this.changes });
  });
});

// Clear All Bookings
app.delete('/api/admin/bookings', (req, res) => {
  const sql = 'DELETE FROM bookings';
  db.run(sql, [], function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ message: 'All bookings deleted', changes: this.changes });
  });
});

// Clear All Guestbook Entries
app.delete('/api/admin/guestbook', (req, res) => {
  const sql = 'DELETE FROM guestbook_entries';
  db.run(sql, [], function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ message: 'All guestbook entries deleted', changes: this.changes });
  });
});


// Serve React build in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the build directory
  app.use(express.static(path.join(__dirname, 'build')));

  // Handle client-side routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
