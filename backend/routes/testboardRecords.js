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
    }
});

router.post('/most-recent-fail', async (req, res) => {
  try {
    const { sns,startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: 'Missing required query parameters: startDate, endDate' });
    }
    if (!Array.isArray(sns) || sns.length === 0) {
      return res
        .status(400)
        .json({ error: 'Missing or invalid sns array in request body' });
    }

    const query = `
      SELECT DISTINCT ON (sn)
        sn,
        failure_reasons AS error_code,
        history_station_start_time AS fail_time
      FROM testboard_master_log
      WHERE sn = ANY($1)
        AND history_station_start_time >= $2
        AND history_station_end_time <= $3
        AND history_station_passing_status = 'Fail'
      ORDER BY
        sn,
        history_station_start_time DESC;
    `;

    const params = [sns, startDate, endDate];
    const result = await pool.query(query, params);
    return res.json(result.rows);
  } catch (error) {
    console.error('most-recent-fail error:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.post('/pass-check', async (req, res) => {
  try {
    const { sns,startDate, endDate,passCheck } = req.body;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: 'Missing required query parameters: startDate, endDate' });
    }
    if (!Array.isArray(sns) || sns.length === 0) {
      return res
        .status(400)
        .json({ error: 'Missing or invalid sns array in request body' });
    }
    if(!passCheck){
      return res.status(400).json({error: ' Missing require query parameters: passCheck'});
    }

    const query = `
      SELECT DISTINCT ON (sn)
        sn,
        history_station_start_time AS pass_time
      FROM testboard_master_log
      WHERE sn = ANY($1)
        AND history_station_start_time >= $2
        AND history_station_end_time <= $3
        AND history_station_passing_status = 'Pass'
        AND workstation_name = ANY($4)
      ORDER BY
        sn,
        history_station_start_time DESC;
    `;

    const params = [sns, startDate, endDate, passCheck];
    const result = await pool.query(query, params);
    return res.json(result.rows);
  } catch (error) {
    console.error('pass-check:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.post('/sn-check', async (req, res) => {
  try {
    const { sns,startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: 'Missing required query parameters: startDate, endDate' });
    }
    if (!Array.isArray(sns) || sns.length === 0) {
      return res
        .status(400)
        .json({ error: 'Missing or invalid sns array in request body' });
    }

    const query = `
      SELECT DISTINCT ON (sn)
        sn,
        history_station_start_time AS pass_time
      FROM testboard_master_log
      WHERE sn = ANY($1)
        AND history_station_start_time >= $2
        AND history_station_end_time <= $3
      ORDER BY
        sn,
        history_station_start_time DESC;
    `;

    const params = [sns, startDate, endDate];
    const result = await pool.query(query, params);
    return res.json(result.rows);
  } catch (error) {
    console.error('sn-check:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.post('/by-error', async (req, res) => {
  try {
    const { checkArray,startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: 'Missing required query parameters: startDate, endDate' });
    }
    if (!Array.isArray(checkArray) || checkArray.length === 0) {
      return res
        .status(400)
        .json({ error: 'Missing or invalid error code array in request body' });
    }

    const query = `
      SELECT 
        sn,
        pn,
        failure_reasons as error_code
      FROM testboard_master_log
      WHERE failure_reasons = ANY($1)
        AND history_station_start_time >= $2
        AND history_station_end_time <= $3
      ORDER BY
        failure_reasons,
        pn,
        history_station_start_time DESC;
    `;

    const params = [checkArray, startDate, endDate];
    const result = await pool.query(query, params);
    return res.json(result.rows);
  } catch (error) {
    console.error('by-error:', error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router; 