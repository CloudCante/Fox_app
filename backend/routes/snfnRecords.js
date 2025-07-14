const express = require('express');
const router = express.Router();
const { pool } = require('../db.js');

// Get testboard station errorcodes
// Group by fixturen number and error codes
router.get('/station-errors', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate ) {
            return res.status(400).json({ error: 'Missing required query parameters: startDate, endDate' });
        }
        const query = `
            SELECT
                workstation_name,
                fixture_no,
                failure_code,
                COUNT(failure_code) as code_count,
                sn,
                MIN(pn) as pn,
                MIN(model) as model,
                (date_trunc('day', history_station_end_time) + interval '1 day - 1 microsecond') AS normalized_end_time

            FROM testboard_master_log
            WHERE history_station_passing_status = 'Fail'
              AND history_station_end_time BETWEEN $1 AND $2
            GROUP BY fixture_no, sn, failure_code, workstation_name, (date_trunc('day', history_station_end_time) + interval '1 day - 1 microsecond')
            ORDER BY workstation_name
        `;
        const params = [startDate, endDate];
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching testboard station performance:', error);
        res.status(500).json({ error: error.message });
    }
});



module.exports = router;