
const axios = require('axios');
const fs = require('fs');

let readStock = new Promise(function (resolve, reject) {
    fs.readFile('stock.txt', 'utf-8', (err, data) => {
        if (err) {
            // 錯誤了
            reject(err);
        } else {
            resolve(data);
        }
    });
});

// readStock.then((a)=>{
//     console.log(a)
// })


async function main() {
    let num = await readStock
    axios.get('https://www.twse.com.tw/exchangeReport/STOCK_DAY', {  //<-老師!不好意思，問一下為何這邊可以省略return不會報錯(crawler-promise.js檔案沒有return印出來結果會是undefined)
        params: {
            // 設定 query string
            response: 'json',
            date: '20220301',
            stockNo: num,
        },
    }).then((a) => {
        console.log(a)
    })
}
main();





