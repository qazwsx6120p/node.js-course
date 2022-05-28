// npm i express
// 導入 express 這個模組
const express = require('express');
// 利用 epxress 來建立一個 express application
const app = express();

const path = require('path');

// 使用第三方開發的中間件 cors
// 為串接react跟後端資料庫的中間套件
const cors = require('cors');
app.use(cors());

const mysql = require('mysql2/promise');
require('dotenv').config();
// 這裡不會像爬蟲那樣，只建立一個連線 (mysql.createConnection)
// 但是，也不會幫每一個 request 都分別建立連線
// ----> connection pool
let pool = mysql //mysql.createPool() 建立連線池，從連線池中獲取連線
  .createPool({
    //process.env設置環境變數
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    // 為了 pool 新增的參數
    connectionLimit: 10,
  });

// client - server
// client send request -------> server
//                     <------- response
// request-response cycle
// client: browser, postman, nodejs,...

// express 是一個由 middleware (中間件) 組成的世界
// request --> middleware1 --> middleware2 --> .... --> response
// 中間件的「順序」很重要!!
// Express 是按照你安排的順序去執行誰是 next 的
// middleware 中有兩種結果：
// 1. next: 往下一個中間件去
// 2. response: 結束這次的旅程 (req-res cycle)

// express 處理靜態資料
// 靜態資料: html, css 檔案, javascript 檔案, 圖片, 影音檔...
// express 少數內建的中間件 static
// 方法1: 不要指定網址
app.use(express.static(path.join(__dirname, 'assets')));
// http://localhost:3001/images/test1.jpg
// 方法2: 指定網址 aaa
app.use('/aaa', express.static(path.join(__dirname, 'public')));
// http://localhost:3001/aaa/images/callback-hell.png

// 一般中間件
app.use((request, response, next) => {
  console.log('我是一個沒有用的中間件 AAAA');
  next();

  // 兩個都有，那會發生什麼事？
  // 情況 1:
  // next();
  // response.send('我是中間件');

  // 情況 2:
  // response.send('我是中間件');
  // next();
});

app.use((request, response, next) => {
  console.log('我是一個沒有用的中間件 BBBB');
  next();
  // return
});

// HTTP request
// method: get, post, put, delete, ...
// 路由中間件
app.get('/', (request, response, next) => {
  console.log(pool);
  console.log('首頁CCC');
  // 送回 response，結束了 request-response cycle
  response.send('首頁');
  // return
});

app.get('/about', (request, response, next) => {
  console.log('about');
  response.send('About Me');
});

app.get('/error', (req, res, next) => {
  // 發生錯誤，你丟一個錯誤出來
  // throw new Error('測試測試');
  // 或是你的 next 裡有任何參數
  next('我是正確的');
  // --> 都會跳去錯誤處理中間件
});

// RESTful API
// 取得 stocks 的列表
app.get('/stocks', async (req, res, next) => {
  console.log('我是股票列表');
  //從資料庫裡撈資料
  let [data, fields] = await pool.execute('SELECT * FROM stocks');
  //因為是客戶端的請求，所以是res，並用json格式回傳
  res.json(data);
});

// 取得某個股票 id 的資料
//:stockId為變數  <---記得加:
app.get('/stocks/:stockId', async (req, res, next) => {

  // 取得網址上的參數 req.params
  // 利用req.params.取得網站變數 此方法取得網址上的參數
  console.log('get stocks by id', req.params);

  //pool.execute(SQL語法)從路由池裡執行SQL語法
  let [data, fields] = await pool.execute(

    //從stocks資料庫中取得 id為網址get的股票id
    'SELECT * FROM stocks WHERE id = ' + req.params.stockId
  );

  console.log('query stock by id:', data);
  // 空資料(查不到資料)有兩種處理方式：
  // 1. 200OK 就回 []
  // 2. 回覆 404
  if (data.length === 0) {
    // 這裡是 404 範例
    res.status(404).json(data);
  } else {
    res.json(data);
  }
});

// 這個中間件在所有路由的後面
// 會到這裡，表示前面所有的路由中間件都沒有比到符合的網址
// => 404
app.use((req, res, next) => {
  console.log('所有路由的後面 ==> 404', req.path);
  res.status(404).send('Not Found');
});

// 5xx
// 錯誤處理中間件: 通常也會放在所有中間件的最後
// 超級特殊的中間件
// 有點接近 try-catch 的 catch
app.use((err, req, res, next) => {
  console.error('來自四個參數的錯誤處理中間件', req.path, err);
  res.status(500).send('Server Error: 請洽系統管理員');
});

app.listen(3001, () => {
  console.log('Server start at 3001');
});
