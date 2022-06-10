// 引用express
// 設定一個app變數來使用 express
const express = require('express');
const app = express();

// ==============================================

// 內建套件無須 npm i
const path = require('path');

// ==============================================

// 只要跨來源，就會被**瀏覽器**阻擋 （事實上，請求還是發得出去，
// 只是瀏覽器沒有得到 Access-Control-Allow-Origin 許可，
// 會在最後一刻攔截資料，而不交給我們。）
// 但是開放的話要找後端開放 => cors 第三方開發的中間件
// 所以如果前端要跟後端要資料，要require('cors')
// 並讓app使用 app.use(cors())
const cors = require('cors');
app.use(cors());

// ==============================================

// 設定一個app變數來使用 mysql
const mysql = require('mysql2');

// ==============================================

// 連結.env
// 保護帳號密碼不被上傳至github
require('dotenv').config();

// -------------------------------------------------------------------------

// 這裡不會像爬蟲那樣，只建立一個連線 (mysql.createConnection)
// 但是也不會幫每一個 request 都分別建立連線
// 建立一個路由池 createPool
// 使用pool變數去接從資料庫來的資料

let pool = mysql
  .createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    // 為了 pool 新增的參數
    connectionLimit: 10,
    dateStrings: true,
  })
  .promise(); //<--使用promise版本

// -------------------------------------------------------------------------

// RESTful API
// 取得 stocks 的列表
// 網址使用/stocks
app.get('/stocks', async (req, res, next) => {
  // 展開陣列( 裡面會有兩個資料 data 跟 fields )
  // execute()用來執行SQL語法的方法
  // pool.execute('SELECT * FROM stocks')
  // 用sql語法
  let [data, fields] = await pool.execute('SELECT * FROM stocks');

  //回復json格式的data
  res.json(data);
});

// -------------------------------------------------------------------------

// 取得其中一個 id 的資料
// /stocks/:stockId  (:stockId) <--為變數
app.get('/stocks/:stockId', async (req, res, next) => {
  let [data, fields] = await pool.execute(
    // req.params( 獲取網址上的參數，因為是客戶端輸入的所以使用req )
    // req.params.stockId( 獲取網址上的stockId 參數 )
    // EX : http://localhost:3001/stocks/5 ( 就是獲取5 )
    // 將網址上的stockId參數，放入sql語法中讓sql篩選

    // 'SELECT * FROM stocks WHERE id = ' + req.params.stockId
    // 會被 SELECT * FROM stocks WHERE id = ' or 1 = 1 破解
    // EX : http://localhost:3001/stocks/2330 or 1 = 1

    // ====================認證方法=========================

    // 後端認證方法  WHERE id = ?' , [req.params.stockId]
    // 後方放一個陣列，並將 req.params.stockId (使用者輸入值) 放入
    'SELECT * FROM stocks WHERE id = ?',
    [req.params.stockId] //<--順序要對
  );
  console.log('get stocks by id', data);

  // 空資料(查不到資料時)有兩種處理方法
  // 1.回復空陣列 []
  // 2.回復404
  // 假如data陣列的長度是0(找不到資料)
  if (data.length === 0) {
    //這裡是404範例
    res.status(404).send('找不到資料');
  } else {
    //回復json格式的data
    res.json(data);
  }
});

// -------------------------------------------------------------------------

// 建立網址並發出請求 http://localhost:3001/
app.get('/', (request, response, next) => {
  console.log('首頁CCC');
  // 送回 response，結束了 request-response cycle
  // 回復客戶端顯示首頁
  response.send('首頁'); //<-- 在這回復
});

// -------------------------------------------------------------------------

// 這個中間件在所有路由的後面
// 會到這裡，代表客戶端打錯網址傳送給你 顯示Not Found
// => 404  <--客戶端的錯誤
app.use((req, res, next) => {
  console.log('所有路由的後面 ==> 404', req.path); //<--可以用console.log查看對方傳送甚麼網址
  // 回復404並傳送Not Found
  res.status(404).send('Not Found');
});

// -------------------------------------------------------------------------

// 5xx <--自己伺服器的錯誤
// 錯誤處理中間件: 通常也會放在所有中間件的最後
// 超級特殊的中間件，有四個參數
// 有點接近 try-catch 的 catch
app.use((err, req, res, next) => {
  // req.path, err <--記下錯誤的網址
  console.error('來自四個參數的錯誤處理中間件', req.path, err);
  // Server Error: 請洽系統管理員
  res.status(500).send('Server Error: 請洽系統管理員');
});

// -------------------------------------------------------------------------

// 使用這個port 3001 (通常會放到最後)
// 伺服器端為3001
// 網址localhost:3001
// 需先用 nodemon 1.server.js
app.listen(3001, () => {
  console.log('Server start at 3001');
});
