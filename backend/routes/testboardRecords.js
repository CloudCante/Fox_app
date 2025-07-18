const express = require('express');
const router = express.Router();
const { pool } = require('../db.js');

router.get('/hulk-smash', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                sn,
                pn,
                model,
                workstation_name,
                history_station_start_time,
                history_station_end_time,
                history_station_passing_status,
                operator
            FROM testboard_master_log
            LIMIT 3;`
        );
        
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 