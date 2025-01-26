const mysql = require('mysql2')

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'Jhj20024101!',
    database: 'my_db_graduation'

})

//检查
pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to database:', err);
      return;
    }
    console.log('Connected to MySQL database');
    connection.release(); // 释放连接
  });


module.exports = pool