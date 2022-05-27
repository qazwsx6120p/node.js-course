// npm i express
// 原始版本
// NODEJS原始模組
// http為內建創建server的模組
const http = require('http');
const server = http.createServer((request, response) => {
  //當你的 server 接收到 request 的時候要做甚麼事情
  response.statusCod(200);
  response.setHeader('Cintent-Type', 'text/html;charset=UTF-8');
  response.end('hello server');
});
//接收server，聽3001 port
server.listen(3001, () => {
  console.log('Server running at port 3001');
});