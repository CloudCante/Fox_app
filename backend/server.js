const express = require('express');
const cors = require('cors'); 
const {Pool} = require('pg'); 
const dotenv = require('dotenv');


dotenv.config();

const app = express();


app.use(cors()); 
app.use(express.json()); 

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'fox_db',
    user: process.env.DB_USER || 'gpu_user',
    password: process.env.DB_PASSWORD || '',
});


pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('PostgreSQL connection error:', err);
    } else {
        console.log('PostgreSQL connected successfully');
    }
});

//Import routes
const functionalTestingRouter = require('./routes/functionalTestingRecords');
app.use('/api/functional-testing', functionalTestingRouter);

const packingRouter = require('./routes/packingRoutes');
app.use('/api/packing', packingRouter);

const sortRecordRouter = require('./routes/sortRecord');
app.use('/api/sort-record', sortRecordRouter);

const tpyRouter = require('./routes/tpyRoutes');
app.use('/api/tpy', tpyRouter);

//Server setups and error handling            
app.get('/', (req, res) => {
    res.send('Quality Dashboard API is running');
});

app.use((err, req, res, next) => { 
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = {pool};