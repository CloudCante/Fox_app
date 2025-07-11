const express = require('express');
const router = express.Router();
const { pool } = require('../db.js');

// Get testboard station performance for a date range and model
router.get('/station-performance', async (req, res) => {
    try {
        const { startDate, endDate, model } = req.query;
        if (!startDate || !endDate || !model) {
            return res.status(400).json({ error: 'Missing required query parameters: startDate, endDate, model' });
        }
        let query = `
            SELECT
                workstation_name,
                pass,
                fail,
                failurerate
            FROM testboard_station_performance_daily
            WHERE end_date >= $1 AND end_date <= $2 AND model = $3
            ORDER BY workstation_name
        `;
        let params = [startDate, endDate, model];
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching testboard station performance:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;