const { Pool } = require('pg');
const dotenv = require('dotenv');

console.log('Initializing database configuration...');

dotenv.config();

console.log('Creating database pool with config:', {
    host: '10.23.8.41',
    port: 5432,
    database: 'fox_db',
    user: 'gpu_user'
});

const pool = new Pool({
    host: '10.23.8.41',
    port: 5432,
    database: 'fox_db',
    user: 'gpu_user',
    password: '',
});

pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle client:', err);
});

pool.on('connect', () => {
    console.log('✅ New client connected to database');
});

module.exports = { pool };