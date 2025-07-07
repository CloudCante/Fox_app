const express = require('express');
const router = express.Router();
const { pool } = require('../db.js'); 

router.get('/count', async (req, res) => {
    try {
        const result = await pool.query('SELECT COUNT(*) FROM gpu_test_records');
        res.json({
            message: 'PostgreSQL connection successful',
            recordCount: result.rows[0].count,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;