// hard code stock no

// npm i axios
const axios = require('axios');

axios.get('https://www.twse.com.tw/exchangeReport/STOCK_DAY', {
    params: {
      // 設定 query string
      response: 'json',
      date: '20220301',
      stockNo: '2330',
    },
  })
  .then((response) => {
    // response 物件
    console.log(response);
  })
  .catch((e) => {
    console.error(e);
  });