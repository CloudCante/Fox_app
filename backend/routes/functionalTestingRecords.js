const express = require('express');
const router = express.Router();
const { pool } = require('../db.js');

router.get('/station-performance', async (req, res) => {
    try {
        const { model, startDate, endDate } = req.query;
        if (!model || !startDate || !endDate) {
            return res.status(400).json({ error: 'Missing required query parameters.' });
        }
        const result = await pool.query(
            `SELECT
                workstation_name AS station,
                SUM(pass) AS pass,
                SUM(fail) AS fail,
                SUM(total) AS total,
                ROUND(SUM(fail)::numeric / NULLIF(SUM(total), 0), 3) AS failurerate
            FROM testboard_station_performance_daily
            WHERE
                model = $1
                AND end_date >= $2
                AND end_date <= $3
            GROUP BY workstation_name
            ORDER BY fail DESC, total DESC;`,
            [model, startDate, endDate]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;