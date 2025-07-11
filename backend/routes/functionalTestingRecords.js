const express = require('express');
const router = express.Router();
const { pool } = require('../db.js');

// Get testboard station performance for a date range and model, aggregated by workstation
router.get('/station-performance', async (req, res) => {
    try {
        const { startDate, endDate, model } = req.query;
        if (!startDate || !endDate || !model) {
            return res.status(400).json({ error: 'Missing required query parameters: startDate, endDate, model' });
        }
        let query = `
            SELECT
                workstation_name,
                SUM(pass) AS pass,
                SUM(fail) AS fail,
                CASE WHEN SUM(pass) + SUM(fail) = 0 THEN 0
                     ELSE ROUND(SUM(fail)::numeric / (SUM(pass) + SUM(fail)), 3)
                END AS failurerate
            FROM testboard_station_performance_daily
            WHERE end_date >= $1 AND end_date <= $2 AND model = $3
            GROUP BY workstation_name
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