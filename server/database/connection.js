const mariadb=require('mariadb');
require('dotenv').config();

//create a connection pool
const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    connectionLimit: process.env.DB_CONN_LIMIT
});

module.exports=pool;