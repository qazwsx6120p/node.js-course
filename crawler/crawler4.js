// read stock no from mysql database

// mysql2 是一個第三方套件
// npm i mysql2
// 引用進來
const mysql = require('mysql2/promise'); //使用npm裡的 mysql2套件

(async () => {
  const connection = await mysql.createConnection({ //createConnection() 方法用來與MySQL 伺服器互動
    host: 'localhost', 
    port: 3306,
    user: 'admin', //使用者名稱
    password: '', //使用者密碼
    database: 'node_js', //資料庫名稱
  });

  let [data, fields] = await connection.execute('SELECT * FROM stocks');
  console.log(data);

  // results [
  //     [],
  //     []
  // ]
  //let data = results[0];
  //let fields = results[1];

  connection.end();
})();