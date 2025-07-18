const express = require('express');
const cors = require('cors'); 
const { pool } = require('./db.js');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Add error event handlers for the process
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    console.error('Stack trace:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise);
    console.error('Reason:', reason);
});

app.use(cors()); 
app.use(express.json()); 

//Import routes
const functionalTestingRouter = require('./routes/functionalTestingRecords');
app.use('/api/functional-testing', functionalTestingRouter);

const packingRouter = require('./routes/packingRoutes');
app.use('/api/packing', packingRouter);

const sortRecordRouter = require('./routes/sortRecord');
app.use('/api/sort-record', sortRecordRouter);

const tpyRouter = require('./routes/tpyRoutes');
app.use('/api/tpy', tpyRouter);

const snfnRouter = require('./routes/snfnRecords');
app.use('/api/snfn', snfnRouter);

const stationHourlySummaryRouter = require('./routes/stationHourlySummary');
app.use('/api/station-hourly-summary', stationHourlySummaryRouter);

// Load test route with detailed logging
try {
    const uploadHandlerRouter = require('./routes/uploadHandler');
    app.use('/api/upload', uploadHandlerRouter);
} catch (error) {
    console.error('❌ Failed to load upload handler:', error);
}

//Server setups and error handling            
app.get('/', (req, res) => {
    res.send('Quality Dashboard API is running');
});

// Add more detailed error handling
app.use((err, req, res, next) => { 
    res.status(500).send('Something broke! Check server logs for details.');
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
});

// Add error handling for the server
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
    }
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
});

module.exports = {pool};