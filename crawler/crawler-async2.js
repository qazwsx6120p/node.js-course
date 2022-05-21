// npm i axios 要安裝第三方模組
const axios = require('axios');
const fs = require('fs/promises');



async function main() {
  //讀取stock檔案
  let num = await fs.readFile("stock.txt", "utf-8");
  axios
    .get('https://www.twse.com.tw/exchangeReport/STOCK_DAY', {
      params: {
        // 設定 query string
        response: 'json',
        date: '20220301',
        stockNo: num,
      },
    })
    .then((response) => {
      console.log(response.data);
    });
}
main();
