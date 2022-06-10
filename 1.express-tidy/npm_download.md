1.npm i axios <--是一個基於promise 網路請求庫
2.npm i mysql2 <--執行sql語法
3.npm i dotenv <--密碼保護 (創建.env)
4.npm i express <--路由處理
5.npm i core

只要跨來源，就會被瀏覽器阻擋 （事實上，請求還是發得出去，只是瀏覽器沒有得到 Access-Control-Allow-Origin 許可，會在最後一刻攔截資料，而不交給我們。）
但是開放的話要找後端開放 => cors 第三方開發的中間件。

6.npm i -g nodemon (指令nodemon server.js)

啟動程式的時候，本來應該是要用 node server.js，因為 server 的程式是會一直啟動中，這樣才可以一直等著接受請求。
當你編輯程式的時候，你就必須要手動停掉程式，再啟動一次，這樣才可以把新的程式碼載入記憶體中去執行。
