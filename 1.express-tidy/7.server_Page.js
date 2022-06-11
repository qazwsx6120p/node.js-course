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

// 取得某個股票 id 的資料
app.get('/stocks/:stockId', async (req, res, next) => {
  // 取得網址上的參數 req.params
  // req.params.stockId
  console.log('get stocks by id', req.params);

  // RESTful 風格之下，鼓勵把這種過濾參數用 query string 來傳遞
  // /stocks/:stockId?page=1
  // ============= 1. 取得目前在第幾頁，而且利用 || 這個特性來做預設值 =============
  // req.query = {}
  // 如果網址上沒有 page 這個 query string，那 req.query.page 會是 undefined
  // undefined 會是 false，所以 page 就被設定成 || 後面那個數字
  // https://developer.mozilla.org/zh-CN/docs/Glossary/Falsy
  let page = req.query.page || 1;
  console.log('current page', page);

  // ============= 2. 取得目前的總筆數 =============
  let [allResults, fields] = await pool.execute('SELECT * FROM stock_prices WHERE stock_id = ?', [req.params.stockId]);
  const total = allResults.length;
  console.log('total:', total);

  // ============= 3. 計算總共有幾頁=============
  // Math.ceil 1.1 => 2   1.05 -> 2
  const perPage = 5; // 每一頁有幾筆
  const lastPage = Math.ceil(total / perPage);
  console.log('lastPage:', lastPage);

  //  ============= 4. 計算 offset 是多少（計算要跳過幾筆）=============
  // 在第五頁，就是要跳過 4 * perPage
  let offset = (page - 1) * perPage;
  console.log('offset:', offset);

  // ============= 5. 取得這一頁的資料 select * from table limit ? offet ? =============
  let [pageResults] = await pool.execute('SELECT * FROM stock_prices WHERE stock_id = ? ORDER BY date DESC LIMIT ? OFFSET ?', [req.params.stockId, perPage, offset]);

  // test case:

  // 正面: 沒有page, page=1, page=2, page=12 (因為總共12頁)
  // 負面: page=-1, page=13, page=空白(page=1), page=a,...
  // 6. 回覆給前端
  res.json({
    // 用來儲存所有跟頁碼有關的資訊
    pagination: {
      total,
      lastPage,
      page,
    },
    // 真正的資料
    data: pageResults,
  });
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
