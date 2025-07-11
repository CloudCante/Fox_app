const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Get testboard master log structure and sample data
router.get('/testboard_master_log', async (req, res) => {
    try {
        // First get column information
        const columnQuery = `
            SELECT 
                column_name,
                data_type,
                character_maximum_length,
                is_nullable
            FROM information_schema.columns
            WHERE table_name = 'testboard_master_log'
            ORDER BY ordinal_position;
        `;
        const columnResult = await pool.query(columnQuery);

        // Then get 3 rows of sample data
        const dataQuery = `
            SELECT *
            FROM testboard_master_log
            ORDER BY history_station_start_time DESC
            LIMIT 3;
        `;
        const dataResult = await pool.query(dataQuery);

        res.json({
            columns: columnResult.rows,
            sampleData: dataResult.rows
        });
    } catch (err) {
        console.error('Error fetching testboard data:', err);
        res.status(500).json({ error: 'Failed to fetch testboard data' });
    }
});

// Get workstation master log structure and sample data
router.get('/workstation_master_log', async (req, res) => {
    try {
        // First get column information
        const columnQuery = `
            SELECT 
                column_name,
                data_type,
                character_maximum_length,
                is_nullable
            FROM information_schema.columns
            WHERE table_name = 'workstation_master_log'
            ORDER BY ordinal_position;
        `;
        const columnResult = await pool.query(columnQuery);

        // Then get 3 rows of sample data
        const dataQuery = `
            SELECT *
            FROM workstation_master_log
            ORDER BY created_at DESC
            LIMIT 3;
        `;
        const dataResult = await pool.query(dataQuery);

        res.json({
            columns: columnResult.rows,
            sampleData: dataResult.rows
        });
    } catch (err) {
        console.error('Error fetching workstation data:', err);
        res.status(500).json({ error: 'Failed to fetch workstation data' });
    }
});

module.exports = router; 