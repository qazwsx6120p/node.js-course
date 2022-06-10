
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
const cors = require('cors');
app.use(cors());

// ==============================================

// 連結.env
// 保護帳號密碼不被上傳至github
require('dotenv').config();

// -------------------------------------------------------------------------


// ===path join 教學 2.join示範.js===

// express 處理靜態資料
// 靜態資料: html, css 檔案, javascript 檔案, 圖片, 影音檔...
// express 少數內建的中間件 static
// 方法1: 不要指定網址
// assets 為資料夾
app.use(express.static(path.join(__dirname, 'assets'))); 
// 示範網址 http://localhost:3001/statuc.html <--開啟statuc.html
// 示範網址 http://localhost:3001/images/test1.jpg <--開啟 images/test1.jpg

// 方法2: 指定網址 aaa
app.use('/aaa', express.static(path.join(__dirname, 'public')));
// 示範網址 http://localhost:3001/aaa/images/callback-hell.png

// __dirname
// 總是回傳被執行 js 檔所在資料夾的絕對路徑

// 在 Node 中使用相對路徑進行檔案讀取是很危險的, 
// 建議一律都透過絕對路徑的方式來處理
// === path.join(__dirname, 'assets') ===


// -------------------------------------------------------------------------

// express 是一個由 middleware (中間件) 組成的世界
// request --> middleware1 --> middleware2 --> .... --> response
// 中間件的「順序」很重要!!
// Express 是按照你安排的順序去執行誰是 next 的
// middleware 中有兩種結果：
// 1. next: 往下一個中間件去
// 2. response: 結束這次的旅程 (req-res cycle)

app.use((request, response, next) => {
  console.log('我是一個沒有用的中間件 AAAA');
  next(); //<--沒有response客戶端next跳到下一個  ↓ ↓ ↓
});

app.use((request, response, next) => {
  console.log('我是一個沒有用的中間件 BBBB');
  next(); //<--沒有response客戶端next又跳到下一個  ↓ ↓ ↓
  // return
});

// 順序執行
// 印出"我是一個沒有用的中間件 AAAA" next()-> 印出"我是一個沒有用的中間件 BBBB"
// next()-> response.send('首頁')

// 建立網址並發出請求 http://localhost:3001/
app.get('/', (request, response, next) => {
  console.log('首頁CCC');
  // 送回 response，結束了 request-response cycle
  // 回復客戶端顯示首頁
  response.send('首頁'); //<-- 在這回復
});

// 建立網址並發出請求 http://localhost:3001/about
app.get('/about', (request, response, next) => {
  console.log('about');
  // 回復客戶端顯示About Me
  response.send('About Me');
});

app.get('/error', (req, res, next) => {
  // 發生錯誤，你丟一個錯誤出來
  // throw new Error('測試測試'); <-- 丟出一個錯誤
  // 或是你的 next 裡有任何參數
  next('我是正確的');
  // --> 都會跳去錯誤處理中間件 5xx
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
