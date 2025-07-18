const express = require('express');
const router = express.Router();
const { pool } = require('../db.js');

router.get('/daily', async (req, res) => {
    try {
        const { startDate, endDate, model } = req.query;
        
        let query = `
            SELECT 
                date_id,
                model,
                workstation_name,
                total_parts,
                passed_parts,
                failed_parts,
                throughput_yield,
                week_id,
                week_start,
                week_end,
                total_starters
            FROM daily_tpy_metrics 
            WHERE date_id >= $1 AND date_id <= $2
        `;
        
        let params = [startDate, endDate];
        
        if (model) {
            query += ` AND model = $3`;
            params.push(model);
        }
        
        query += ` ORDER BY date_id DESC, model, workstation_name`;
        
        const result = await pool.query(query, params);
        
        const groupedData = {};
        result.rows.forEach(row => {
            const dateStr = row.date_id.toISOString().split('T')[0];
            if (!groupedData[dateStr]) {
                groupedData[dateStr] = {
                    date: dateStr,
                    weekId: row.week_id,
                    weekStart: row.week_start,
                    weekEnd: row.week_end,
                    totalStarters: row.total_starters,
                    stations: {}
                };
            }
            
            if (!groupedData[dateStr].stations[row.model]) {
                groupedData[dateStr].stations[row.model] = {};
            }
            
            groupedData[dateStr].stations[row.model][row.workstation_name] = {
                totalParts: row.total_parts,
                passedParts: row.passed_parts,
                failedParts: row.failed_parts,
                throughputYield: row.throughput_yield
            };
        });
        
        res.json(Object.values(groupedData));
    } catch (error) {
    }
});

router.get('/daily', async (req, res) => {
    try {
        const { startDate, endDate, model } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Missing required query parameters: startDate, endDate' });
        }
        let query = `
            SELECT 
                date_id,
                model,
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
    }
});


router.get('/weekly', async (req, res) => {
    try {
        const { startWeek, endWeek } = req.query;
        
        const query = `
            SELECT 
                week_id,
                week_start,
                week_end,
                weekly_first_pass_yield_traditional_first_pass_yield,
                weekly_first_pass_yield_completed_only_first_pass_yield,
                weekly_tpy_hardcoded_sxm4_tpy,
                weekly_tpy_dynamic_sxm4_tpy,
                weekly_tpy_hardcoded_sxm5_tpy,
                weekly_tpy_dynamic_sxm5_tpy,
                weekly_first_pass_yield_breakdown_parts_completed,
                weekly_first_pass_yield_breakdown_parts_failed,
                weekly_first_pass_yield_breakdown_parts_stuck_in_limbo,
                weekly_first_pass_yield_breakdown_total_parts,
                total_stations,
                best_station_name,
                best_station_yield,
                worst_station_name,
                worst_station_yield,
                created_at
            FROM weekly_tpy_metrics 
            WHERE week_id >= $1 AND week_id <= $2
            ORDER BY week_id DESC
        `;
        
        const result = await pool.query(query, [startWeek, endWeek]);
        
        const transformedData = result.rows.map(row => ({
            weekId: row.week_id,
            weekStart: row.week_start,
            weekEnd: row.week_end,
            traditionalFPY: row.weekly_first_pass_yield_traditional_first_pass_yield,
            completedOnlyFPY: row.weekly_first_pass_yield_completed_only_first_pass_yield,
            sxm4HardcodedTPY: row.weekly_tpy_hardcoded_sxm4_tpy,
            sxm4DynamicTPY: row.weekly_tpy_dynamic_sxm4_tpy,
            sxm5HardcodedTPY: row.weekly_tpy_hardcoded_sxm5_tpy,
            sxm5DynamicTPY: row.weekly_tpy_dynamic_sxm5_tpy,
            breakdown: {
                partsCompleted: row.weekly_first_pass_yield_breakdown_parts_completed,
                partsFailed: row.weekly_first_pass_yield_breakdown_parts_failed,
                partsStuckInLimbo: row.weekly_first_pass_yield_breakdown_parts_stuck_in_limbo,
                totalParts: row.weekly_first_pass_yield_breakdown_total_parts
            },
            summary: {
                totalStations: row.total_stations,
                bestStation: row.best_station_name,
                bestStationYield: row.best_station_yield,
                worstStation: row.worst_station_name,
                worstStationYield: row.worst_station_yield
            },
            createdAt: row.created_at
        }));
        
        res.json(transformedData);
    } catch (error) {
        console.error('Error fetching weekly TPY metrics:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/summary', async (req, res) => {
    try {
        const dailyQuery = `
            SELECT 
                COUNT(*) as total_records,
                MAX(date_id) as latest_date,
                COUNT(DISTINCT model) as models_count,
                COUNT(DISTINCT workstation_name) as stations_count
            FROM daily_tpy_metrics
        `;
        
        const dailyResult = await pool.query(dailyQuery);
        const dailySummary = dailyResult.rows[0];
        
        const weeklyQuery = `
            SELECT 
                COUNT(*) as total_records,
                MAX(week_id) as latest_week,
                AVG(weekly_tpy_hardcoded_sxm4_tpy) as avg_sxm4_hardcoded,
                AVG(weekly_tpy_hardcoded_sxm5_tpy) as avg_sxm5_hardcoded
            FROM weekly_tpy_metrics
        `;
        
        const weeklyResult = await pool.query(weeklyQuery);
        const weeklySummary = weeklyResult.rows[0];
        
        const recentQuery = `
            SELECT 
                date_id,
                model,
                AVG(throughput_yield) as avg_yield
            FROM daily_tpy_metrics 
            WHERE date_id >= CURRENT_DATE - INTERVAL '7 days'
            GROUP BY date_id, model
            ORDER BY date_id DESC
            LIMIT 10
        `;
        
        const recentResult = await pool.query(recentQuery);
        
        res.json({
            daily: {
                totalRecords: parseInt(dailySummary.total_records),
                latestDate: dailySummary.latest_date,
                modelsCount: parseInt(dailySummary.models_count),
                stationsCount: parseInt(dailySummary.stations_count)
            },
            weekly: {
                totalRecords: parseInt(weeklySummary.total_records),
                latestWeek: weeklySummary.latest_week,
                avgSXM4Hardcoded: parseFloat(weeklySummary.avg_sxm4_hardcoded || 0),
                avgSXM5Hardcoded: parseFloat(weeklySummary.avg_sxm5_hardcoded || 0)
            },
            recent: recentResult.rows
        });
    } catch (error) {
        console.error('Error fetching TPY summary:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/station-performance', async (req, res) => {
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