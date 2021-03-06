

// mysql2 是一個第三方套件
// npm i mysql2
// 引用進來
const mysql = require('mysql2/promise'); //使用npm裡的 mysql2套件 <-- 需下載
const axios = require('axios');
// const dotenv = require('dotenv');
// dotenv.config();
// 幫我們去把 .env 裡的變數讀進來

//連結.env檔案
//幫我們去把這裡面的變數讀進來
require('dotenv').config();

(async () => {
  const connection = await mysql.createConnection({
    //createConnection() 方法用來與MySQL 伺服器互動
    //process.env.資料庫、使用者等資料
    host: process.env.DB_HOST,
    port: process.env.DB_PORT, //接口
    user: process.env.DB_USER, //使用者名
    password: process.env.DB_PASSWORD, //使用者密碼
    database: process.env.DB_NAME, //資料庫名稱
  });
  //execute()用來執行SQL語法的方法
  let [data, fields] = await connection.execute('SELECT * FROM stocks');
  console.log(data); //data是陣列資料

  //用map將data數據轉成新的陣列
  let mapResult = data.map(async (stock) => {
    let response = await axios.get(
      'https://www.twse.com.tw/exchangeReport/STOCK_DAY',
      {
        params: {
          // 設定 query string
          response: 'json',
          date: '20220301',
          stockNo: stock.id,
        },
      }
    );
    //async裡面return的回傳值都是promise(pending)
    return response.data;
  });

  //mapResult會回傳一個promise的陣列，所以下方要用await去接
  //[ Promise { <pending> }, Promise { <pending> }, Promise { <pending> } ]
  console.log(mapResult);

  // Promise.all() <-- Promise.all方法會將陣列中的值並行運算執行
  let prixeResult = await Promise.all(mapResult);
  console.log(prixeResult);
  // console.log(mapResult);

  connection.end();
})();
