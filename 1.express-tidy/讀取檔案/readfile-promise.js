const fs = require('fs');

let p = new Promise(function (resolve, reject) {
  fs.readFile('test.txt', 'utf-8', (err, data) => {
    if (err) {
      // 錯誤了
      reject(err);
      // console.log('喔喔喔，發生錯誤了');
      // console.error(err);
    } else {
      resolve(data);
      // 因為沒有 err，所以是正確的
      // console.log(data);
    }
  });
});

p.then(function (data) {
  console.log(data);
}).catch(function (err) {
  console.log(err);
});
