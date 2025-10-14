const express = require('express');
const cors = require('cors'); 
const { pool } = require('./db.js');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

/*#################################################
#    Global Error Handling Setup               #
#    These handlers catch uncaught exceptions  #
#    and unhandled promise rejections to       #
#    prevent the server from crashing          #
#################################################*/

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    console.error('Stack trace:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise);
    console.error('Reason:', reason);
});

/*#################################################
#    Middleware Configuration                   #
#    CORS allows frontend to make requests     #
#    express.json() parses JSON request bodies #
#################################################*/
app.use(cors()); 
app.use(express.json()); 

/*#################################################
#    API Route Registration (v1)               #
#    All API endpoints are registered here     #
#    Each route file contains multiple         #
#    endpoints for a specific domain           #
#    Format: /api/v1/domain-name/endpoint      #
#    Version: v1 (October 2025)                #
#################################################*/
const functionalTestingRouter = require('./routes/functionalTestingRecords');
app.use('/api/v1/functional-testing', functionalTestingRouter);

const packingRouter = require('./routes/packingRoutes');
app.use('/api/v1/packing', packingRouter);

const sortRecordRouter = require('./routes/sortRecord');
app.use('/api/v1/sort-record', sortRecordRouter);

const tpyRouter = require('./routes/tpyRoutes');
app.use('/api/v1/tpy', tpyRouter);

const snfnRouter = require('./routes/snfnRecords');
app.use('/api/v1/snfn', snfnRouter);

const stationHourlySummaryRouter = require('./routes/stationHourlySummary');
app.use('/api/v1/station-hourly-summary', stationHourlySummaryRouter);

const pchartRouter = require('./routes/pChart');
app.use('/api/v1/pchart', pchartRouter);

const workstationRouter = require('./routes/workstationRoutes');
app.use('/api/v1/workstation-routes', workstationRouter);  // Renamed from workstationRoutes to workstation-routes

const testboardRouter = require('./routes/testboardRecords');
app.use('/api/v1/testboard-records', testboardRouter);  // Renamed from testboardRecords to testboard-records

const spcRouter = require('./routes/spcRoutes');
app.use('/api/v1/spc', spcRouter);

const sqlPortalRouter = require('./routes/sqlPortal');
app.use('/api/v1/sql-portal', sqlPortalRouter);

/*#################################################
#    Optional Route Registration                #
#    Upload handler is wrapped in try-catch    #
#    in case the file doesn't exist or has     #
#    errors - this prevents server startup     #
#    from failing due to missing dependencies  #
#################################################*/
try {
    const uploadHandlerRouter = require('./routes/uploadHandler');
    app.use('/api/v1/upload', uploadHandlerRouter);
} catch (error) {
}


/*#################################################
#    Server Startup and Database Connection     #
#    Server starts on PORT 5000 (or env var)   #
#    Database connection is tested on startup   #
#    to ensure everything is working properly   #
#################################################*/
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
});


pool.query('SELECT NOW()', (err, res) => {
});

module.exports = {pool};