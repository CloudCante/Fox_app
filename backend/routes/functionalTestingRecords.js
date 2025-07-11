const express = require('express');
const router = express.Router();
const { pool } = require('../db.js');

// Get station performance for a specific date
router.get('/station-performance', async (req, res) => {
    console.log('station-performance hit', req.query); // Debug log
    try {
        const { date, model } = req.query;
        
        if (!date) {
            return res.status(400).json({ error: 'Date parameter is required' });
        }
        
        let query = `
            SELECT 
                workstation_name,
                total_parts,
                passed_parts,
                failed_parts,
                throughput_yield
            FROM daily_tpy_metrics 
            WHERE date_id = $1
        `;
        
        let params = [date];
        
        if (model) {
            query += ` AND model = $2`;
            params.push(model);
        }
        
        query += ` ORDER BY throughput_yield DESC`;
        
        const result = await pool.query(query, params);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching station performance:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;