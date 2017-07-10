const mysql = require('mysql');
const pool = mysql.createPool({
    connectionLimit: 20,
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    'charset': "utf8mb4",
    'collation': 'utf8mb4_bin'
});

module.exports = pool;