// 建立一個 routers 檔案夾
// 在 routers 裡，建立一了一個 stockRouter.js

const express = require('express');
const router = express.Router();
// router is a mini-app

const pool = require('../utils/db');

// RESTful API
// 取得 stocks 的列表
router.get('/', async (req, res, next) => {
  console.log('我是股票列表');
  let [data, fields] = await pool.execute('SELECT * FROM stocks');
  res.json(data);
});

// 取得某個股票 id 的資料
router.get('/:stockId', async (req, res, next) => {
  // 取得網址上的參數 req.params
  // req.params.stockId
  console.log('get stocks by id', req.params);

  // RESTful 風格之下，鼓勵把這種過濾參數用 query string 來傳遞
  // /stocks/:stockId?page=1
  // 1. 取得目前在第幾頁，而且利用 || 這個特性來做預設值
  // req.query = {}
  // 如果網址上沒有 page 這個 query string，那 req.query.page 會是 undefined
  // undefined 會是 false，所以 page 就被設定成 || 後面那個數字
  // https://developer.mozilla.org/zh-CN/docs/Glossary/Falsy
  let page = req.query.page || 1;
  console.log('current page', page);

  // 2. 取得目前的總筆數
  let [allResults, fields] = await pool.execute('SELECT * FROM stock_prices WHERE stock_id = ?', [req.params.stockId]);
  const total = allResults.length;
  console.log('total:', total);

  // 3. 計算總共有幾頁
  // Math.ceil 1.1 => 2   1.05 -> 2
  const perPage = 5; // 每一頁有幾筆
  const lastPage = Math.ceil(total / perPage);
  console.log('lastPage:', lastPage);

  // 4. 計算 offset 是多少（計算要跳過幾筆）
  // 在第五頁，就是要跳過 4 * perPage
  let offset = (page - 1) * perPage;
  console.log('offset:', offset);

  // 5. 取得這一頁的資料 select * from table limit ? offet ?
  let [pageResults] = await pool.execute('SELECT * FROM stock_prices WHERE stock_id = ? ORDER BY date DESC LIMIT ? OFFSET ?', [req.params.stockId, perPage, offset]);

  // test case:

  // 正面: 沒有page, page=1, page=2, page=12 (因為總共12頁)
  // 負面: page=-1, page=13, page=空白(page=1), page=a,...
  // 6. 回覆給前端
  res.json({
    // 用來儲存所有跟頁碼有關的資訊
    pagination: {
      total,
      lastPage,
      page,
    },
    // 真正的資料
    data: pageResults,
  });
});

module.exports = router;
