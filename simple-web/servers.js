//npm i express
// 原始版本
// NODEJS原始模組
const http = require('http');
const server = http.createServer((req, res) => {
  res.statusCod = 200;
  res.setHeader('Cintent-Type', 'text/html;charset=UTF-8');
  res.end('hello server');
});
server.listen(3001, () => {
  console.log('Server running at port 3001');
});