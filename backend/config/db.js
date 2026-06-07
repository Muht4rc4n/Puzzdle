const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL Connection Pool Setup
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'puzzdle',
    password: process.env.DB_PASSWORD || 'your_password_here',
    port: process.env.DB_PORT || 5432,
});

pool.on('connect', () => {
    console.log('⚡ PostgreSQL veritabanına başarıyla bağlanıldı.');
});

pool.on('error', (err) => {
    console.error('❌ PostgreSQL Havuz Hatası:', err);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};
