//npm i express
//導入express 模組
const express = require('express');
//利用express 來建立一個express application
const app = express();

//HTTP request
//method: get, post, put, delete,...
//request請求
//response回復

// 第一個參數是網址
app.get('/', (request, response, next) => {
  console.log('首頁');
  response.send('首頁');
});

app.get('/about', (request, response, next) => {
  response.send('About Me');
});

app.listen(3008, () => {
  console.log('Server start at 3007');
});
