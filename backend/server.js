const express = require('express');
const cors = require('cors'); 
const { pool } = require('./db.js');
const dotenv = require('dotenv');

console.log('Starting server initialization...');

dotenv.config();
console.log('Environment config loaded');

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

console.log('Setting up middleware...');
app.use(cors()); 
app.use(express.json()); 
console.log('Middleware setup complete');

console.log('Loading routes...');
//Import routes
const functionalTestingRouter = require('./routes/functionalTestingRecords');
app.use('/api/functional-testing', functionalTestingRouter);
console.log('✓ Functional testing routes loaded');

const packingRouter = require('./routes/packingRoutes');
app.use('/api/packing', packingRouter);
console.log('✓ Packing routes loaded');

const sortRecordRouter = require('./routes/sortRecord');
app.use('/api/sort-record', sortRecordRouter);
console.log('✓ Sort record routes loaded');

const tpyRouter = require('./routes/tpyRoutes');
app.use('/api/tpy', tpyRouter);
console.log('✓ TPY routes loaded');

//Server setups and error handling            
app.get('/', (req, res) => {
    console.log('Root endpoint accessed');
    res.send('Quality Dashboard API is running');
});

// Add more detailed error handling
app.use((err, req, res, next) => { 
    console.error('❌ Error details:', {
        message: err.message,
        stack: err.stack,
        code: err.code,
        path: req.path,
        method: req.method,
        query: req.query,
        body: req.body
    });
    res.status(500).send('Something broke! Check server logs for details.');
});

const PORT = process.env.PORT || 5000;
console.log(`Attempting to start server on port ${PORT}...`);

const server = app.listen(PORT, () => {
    console.log(`✅ Server successfully running on port ${PORT}`);
});

// Add error handling for the server
server.on('error', (error) => {
    console.error('❌ Server error:', error);
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
    }
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ PostgreSQL connection test failed:', err);
        console.error('Database connection details:', {
            host: pool.options.host,
            port: pool.options.port,
            database: pool.options.database,
            user: pool.options.user
        });
    } else {
        console.log('✅ PostgreSQL connection test successful');
        console.log('Connected at:', res.rows[0].now);
    }
});

module.exports = {pool};