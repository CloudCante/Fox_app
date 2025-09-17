const express = require('express');
const cors = require('cors'); 
const { pool } = require('./db.js');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    console.error('Stack trace:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise);
    console.error('Reason:', reason);
});

app.use(cors()); 
app.use(express.json()); 

console.log('🚀 Starting Fox Quality Dashboard Backend Server...');
console.log('�� Loading route modules...');

const functionalTestingRouter = require('./routes/functionalTestingRecords');
app.use('/api/functional-testing', functionalTestingRouter);
console.log('✅ Loaded functional testing routes');

const packingRouter = require('./routes/packingRoutes');
app.use('/api/packing', packingRouter);
console.log('✅ Loaded packing routes');

const sortRecordRouter = require('./routes/sortRecord');
app.use('/api/sort-record', sortRecordRouter);
console.log('✅ Loaded sort record routes');

const tpyRouter = require('./routes/tpyRoutes');
app.use('/api/tpy', tpyRouter);
console.log('✅ Loaded TPY routes');

const snfnRouter = require('./routes/snfnRecords');
app.use('/api/snfn', snfnRouter);
console.log('✅ Loaded SNFN routes');

const stationHourlySummaryRouter = require('./routes/stationHourlySummary');
app.use('/api/station-hourly-summary', stationHourlySummaryRouter);
console.log('✅ Loaded station hourly summary routes');

const pchartRouter = require('./routes/pChart');
app.use('/api/pchart', pchartRouter);
console.log('✅ Loaded P-chart routes');

const workstationRouter = require('./routes/workstationRoutes');
app.use('/api/workstationRoutes', workstationRouter);
console.log('✅ Loaded workstation routes');

const testboardRouter = require('./routes/testboardRecords');
app.use('/api/testboardRecords', testboardRouter);
console.log('✅ Loaded testboard routes');

try {
    const uploadHandlerRouter = require('./routes/uploadHandler');
    app.use('/api/upload', uploadHandlerRouter);
    console.log('✅ Loaded upload handler routes');
} catch (error) {
    console.log('⚠️  Upload handler routes not available:', error.message);
}

console.log('�� Testing database connection...');
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
    } else {
        console.log('✅ Database connected successfully at:', res.rows[0].now);
    }
});

const PORT = process.env.PORT || 5000;

console.log('🌐 Starting server on all interfaces...');
const server = app.listen(PORT, '10.23.8.215', () => {
    console.log('🎉 Server is running!');
    console.log(`📍 Local: http://localhost:${PORT}`);
    console.log(`📍 Network: http://10.23.8.215:${PORT}`);
    console.log(`📍 All interfaces: http://0.0.0.0:${PORT}`);
    console.log('📡 Ready to accept connections from the network');
});

module.exports = {pool};