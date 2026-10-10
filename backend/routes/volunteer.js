const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');

router.post('/respond', authMiddleware, (req, res) => {
  const { crisis_id } = req.body;
  const volunteer_id = req.user.id;
  if (!crisis_id) return res.status(400).json({ message: 'Crisis ID is required' });
  const sql = 'INSERT INTO volunteer_responses (crisis_id, volunteer_id) VALUES (?, ?)';
  db.query(sql, [crisis_id, volunteer_id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err.message });
    const updateSql = 'UPDATE crisis_requests SET status = "assigned" WHERE id = ?';
    db.query(updateSql, [crisis_id], (err2) => {
      if (err2) return res.status(500).json({ message: 'Could not update crisis status' });
      res.status(201).json({ message: 'Response recorded', responseId: result.insertId });
    });
  });
});

router.get('/my-responses', authMiddleware, (req, res) => {
  const volunteer_id = req.user.id;
  const sql = `
    SELECT vr.*, cr.type, cr.severity, cr.description, cr.location_name, cr.status AS crisis_status
    FROM volunteer_responses vr
    JOIN crisis_requests cr ON vr.crisis_id = cr.id
    WHERE vr.volunteer_id = ?
    ORDER BY vr.responded_at DESC
  `;
  db.query(sql, [volunteer_id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err.message });
    res.json(results);
  });
});

router.patch('/availability', authMiddleware, (req, res) => {
  const { is_available } = req.body;
  const sql = 'UPDATE users SET is_available = ? WHERE id = ?';
  db.query(sql, [is_available, req.user.id], (err) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err.message });
    res.json({ message: 'Availability updated' });
  });
});

module.exports = router;