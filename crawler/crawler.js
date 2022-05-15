const { rejects } = require('assert');
// https://www.twse.com.tw/exchangeReport/STOCK_DAY?response=json&date=20220301&stockNo=2330
const axios = require('axios');
const fs = require('fs');
const { resolve } = require('path');

let readStock = new Promise((resolve, rejects) => {
  fs.readFile('stock.txt', 'utf-8', (err, data) => {
    if (err) {
      rejects(err);
    } else {
      resolve(`${data},抓到資料`);
    }
  });
});

readPromise.then((data) => {
  return axios.get('https://www.twse.com.tw/exchangeReport/STOCK_DAY', {
    params: {
      // 設定 query string
      response: 'json',
      date: '20220301',
      stockNo: data,
    },
  });
  // console.log(axiosPromise);
});

