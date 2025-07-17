const express = require('express');
const router = express.Router();
const db = require('../db'); 

router.get('/', async (req, res) => {
  const { startDate, endDate } = req.query;
  let query = 'SELECT * FROM station_hourly_summary';
  let params = [];

  if (startDate && endDate) {
    query += ' WHERE date BETWEEN $1 AND $2';
    params = [startDate, endDate];
  } else if (startDate) {
    query += ' WHERE date = $1';
    params = [startDate];
  }

  query += ' ORDER BY date, hour, workstation_name';

  try {
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching station hourly summary:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;