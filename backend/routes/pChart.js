const express = require('express');
const router = express.Router();
const { pool } = require('../db.js');

router.get('/data', async (req, res) => {
    try {
        const {
            startDate,
            endDate,
            workstation,
            serviceFlow,
            pn,
            model
        } = req.query;

        let queryParams = [startDate, endDate];
        let paramCount = 2;

        let query = `
            SELECT 
                date,
                pn,
                model,
                workstation_name,
                service_flow,
                total_count,
                pass_count,
                fail_count
            FROM workstation_pchart_daily
            WHERE date BETWEEN $1 AND $2
        `;

        if (workstation) {
            paramCount++;
            query += ` AND workstation_name = $${paramCount}`;
            queryParams.push(workstation);
        }

        if (serviceFlow) {
            paramCount++;
            query += ` AND service_flow = $${paramCount}`;
            queryParams.push(serviceFlow);
        }

        if (pn) {
            paramCount++;
            query += ` AND pn = $${paramCount}`;
            queryParams.push(pn);
        }

        query += ' ORDER BY date ASC';

        const { rows } = await pool.query(query, queryParams);
        res.json(rows);

    } catch (error) {
        console.error('Error fetching P-Chart data:', error);
        res.status(500).json({ 
            error: 'Failed to fetch P-Chart data',
            details: error.message 
        });
    }
});

// Get available filter options
router.get('/filters', async (req, res) => {
    try {
        const filterQueries = {
            workstations: 'SELECT DISTINCT workstation_name FROM workstation_pchart_daily ORDER BY workstation_name',
            serviceFlows: 'SELECT DISTINCT service_flow FROM workstation_pchart_daily WHERE service_flow IS NOT NULL ORDER BY service_flow',
            partNumbers: 'SELECT DISTINCT pn FROM workstation_pchart_daily ORDER BY pn',
            models: 'SELECT DISTINCT model FROM workstation_pchart_daily WHERE model IS NOT NULL ORDER BY model'
        };

        const filters = {};
        for (const [key, query] of Object.entries(filterQueries)) {
            const { rows } = await pool.query(query);
            filters[key] = rows.map(row => Object.values(row)[0]);
        }

        res.json(filters);

    } catch (error) {
        console.error('Error fetching filter options:', error);
        res.status(500).json({ 
            error: 'Failed to fetch filter options',
            details: error.message 
        });
    }
});

module.exports = router;