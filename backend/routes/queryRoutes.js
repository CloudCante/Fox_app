const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

<<<<<<< HEAD
/*#################################################
#    Query Routes - Read-Only Access             #
#    Uses dedicated fox_observer user             #
#    Provides SQL query interface for analysts   #
#    Version: v1 (October 2025)                   #
#################################################*/

=======
>>>>>>> feature/custom-sql
const observerPool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.SQL_PORTAL_USER,
    password: process.env.SQL_PORTAL_PASSWORD
});
 
router.post('/query-table', async (req, res) => {
    try {
<<<<<<< HEAD
        const { query } = req.body;
       
        const result = await pool.query(query, []);
=======
        const { que } = req.body;
       
        const result = await pool.query(que, []);
>>>>>>> feature/custom-sql
 
        return res.json(result.rows);
    } catch (error) {
        console.error('most-recent-fail error:', error);
        return res.status(500).json({ error: error.message });
    }
});
 
 
 
module.exports = router;