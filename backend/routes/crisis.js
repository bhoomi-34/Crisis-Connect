const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');

router.post('/create', authMiddleware, (req, res) => {
  const { type, severity, description, latitude, longitude, location_name, landmark } = req.body;
  const user_id = req.user.id;
  if (!type || !severity || !latitude || !longitude) {
    return res.status(400).json({ message: 'Type, severity and location are required' });
  }
  const sql = 'INSERT INTO crisis_requests (user_id, type, severity, description, latitude, longitude, location_name, landmark) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [user_id, type, severity, description, latitude, longitude, location_name, landmark], (err, result) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err.message });
    const crisisId = result.insertId;
    const fetchSql = `
      SELECT cr.*, u.name AS requester_name
      FROM crisis_requests cr
      JOIN users u ON cr.user_id = u.id
      WHERE cr.id = ?
    `;
    db.query(fetchSql, [crisisId], (err2, rows) => {
      if (!err2 && rows.length > 0) {
        const io = req.app.get('io');
        io.to('volunteers').emit('new_crisis', rows[0]);
      }
    });
    res.status(201).json({ message: 'Crisis request created', crisisId });
  });
});

router.get('/all', authMiddleware, (req, res) => {
  const sql = `
    SELECT cr.*, u.name AS requester_name, u.phone AS requester_phone
    FROM crisis_requests cr
    JOIN users u ON cr.user_id = u.id
    WHERE cr.status = 'open'
    ORDER BY cr.created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err.message });
    res.json(results);
  });
});

router.get('/nearby', authMiddleware, (req, res) => {
  const { lat, lng, radius = 5 } = req.query;
  if (!lat || !lng) return res.status(400).json({ message: 'Latitude and longitude required' });
  const sql = `
    SELECT cr.*, u.name AS requester_name,
      (6371 * ACOS(
        COS(RADIANS(?)) * COS(RADIANS(cr.latitude)) *
        COS(RADIANS(cr.longitude) - RADIANS(?)) +
        SIN(RADIANS(?)) * SIN(RADIANS(cr.latitude))
      )) AS distance_km
    FROM crisis_requests cr
    JOIN users u ON cr.user_id = u.id
    WHERE cr.status = 'open'
    HAVING distance_km <= ?
    ORDER BY distance_km ASC
  `;
  db.query(sql, [lat, lng, lat, radius], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err.message });
    res.json(results);
  });
});

router.patch('/status/:id', authMiddleware, (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  const sql = 'UPDATE crisis_requests SET status = ? WHERE id = ?';
  db.query(sql, [status, id], (err) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err.message });
    res.json({ message: 'Status updated successfully' });
  });
});

router.get('/stats', authMiddleware, (req, res) => {
  const sql = `
    SELECT
      COUNT(*) AS total,
      SUM(status = 'open') AS open,
      SUM(status = 'assigned') AS assigned,
      SUM(status = 'resolved') AS resolved,
      SUM(status = 'cancelled') AS cancelled,
      SUM(severity = 'critical') AS critical,
      SUM(severity = 'moderate') AS moderate,
      SUM(severity = 'low') AS low
    FROM crisis_requests
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    res.json(results[0]);
  });
});

router.get('/all-requests', authMiddleware, (req, res) => {
  const sql = `
    SELECT cr.*, u.name AS requester_name, u.phone AS requester_phone,
      (SELECT COUNT(*) FROM volunteer_responses vr WHERE vr.crisis_id = cr.id) AS volunteer_count
    FROM crisis_requests cr
    JOIN users u ON cr.user_id = u.id
    ORDER BY cr.created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    res.json(results);
  });
});

module.exports = router;