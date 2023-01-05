const mysql = require('mysql');

const pool = mysql.createPool({
  connectionLimit: process.env.CONNECTIONLIMIT,
  host: process.env.DBHOST,
  user: process.env.DBUSER,
  password: process.env.DBPASSWORD,
  database: process.env.DATABASE,
  acquireTimeout: Number(process.env.ACQRTIMEOUT), // in ms
});

pool.getConnection((err, conn) => {
  if (err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Koneksi database ditutup.');
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('Basis data memiliki terlalu banyak koneksi.');
    }
    if (err.code === 'ECONNREFUSED') {
      console.error('Koneksi database ditolak.');
    }
    console.error(err);
  }
  conn.query("SET sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));");
  if (conn) conn.release();
  return;
})

// pool.on('acquire', function (connection) {
//   console.log('Connection %d acquired', connection.threadId);
// });

// pool.on('connection', function (connection) {
//   console.log('Connection %d connect', connection.threadId);
// });

// pool.on('release', function (connection) {
//   console.log('Connection %d released', connection.threadId);
// });

module.exports = pool;