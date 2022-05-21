// read stock no from mysql database

// mysql2 是一個第三方套件
// npm i mysql2
// 引用進來
const mysql = require('mysql2/promise'); //使用npm裡的 mysql2套件 <-- 需下載
// const dotenv = require('dotenv');
// dotenv.config();
// 幫我們去把 .env 裡的變數讀進來

//連結.env指令
require('dotenv').config();

(async () => {
  const connection = await mysql.createConnection({
    //createConnection() 方法用來與MySQL 伺服器互動
    //process.env.資料庫、使用者等資料
    host: process.env.DB_HOST,
    port: process.env.DB_PORT, //接口
    user: process.env.DB_USER, //使用者名稱
    password: process.env.DB_PASSWORD, //使用者密碼
    database: process.env.DB_NAME, //資料庫名稱
  });
  //execute()用來執行SQL語法的方法
  let [data, fields] = await connection.execute('SELECT * FROM stocks');
  console.log(data); //data是陣列資料

  let mapResult = data.map((stock, index) => {
    console.log(stock.id);
  });
  console.log(mapResult);
  // results [
  //     [],
  //     []
  // ]
  //let data = results[0];
  //let fields = results[1];

  connection.end();
})();
