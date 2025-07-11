const express = require('express');
const router = express.Router();
const { pool } = require('../db.js');

// Rewired: Get station performance for a date range (mimics tpyRoutes.js style)
router.get('/station-performance', async (req, res) => {
    try {
        const { startDate, endDate, model } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Missing required query parameters: startDate, endDate' });
        }
        let query = `
            SELECT 
                workstation_name,
                total_parts,
                passed_parts,
                failed_parts,
                throughput_yield
            FROM daily_tpy_metrics
            WHERE date_id >= $1 AND date_id <= $2
        `;
        let params = [startDate, endDate];
        if (model) {
            query += ' AND model = $3';
            params.push(model);
        }
        query += ' ORDER BY date_id, model, workstation_name';
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching station performance:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;