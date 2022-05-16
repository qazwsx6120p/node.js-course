
const axios = require('axios');
const fs = require('fs');

 new Promise(function (resolve, reject) {
    fs.readFile('stock.txt', 'utf-8', (err, data) => {
        if (err) {
            // 錯誤了
            reject(err);
        } else {
            resolve(data);
        }
    });
}).then((num) => {
    return axios.get('https://www.twse.com.tw/exchangeReport/STOCK_DAY', {
        params: {
            // 設定 query string
            response: 'json',
            date: '20220301',
            stockNo: num,
        },
    })
}).then((response) => {
    console.log(response);
})



