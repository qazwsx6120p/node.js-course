const express = require('express');
const router = express.Router();

// npm i express-validator
const { body, validationResult } = require('express-validator');

// 自己整理的資料庫模組
const pool = require('../utils/db');

// for hash password
// npm i bcrypt
const bcrypt = require('bcrypt');

// for image upload
// npm i multer
const multer = require('multer');
const path = require('path');
// 圖片上傳需要地方放，在 public 裡，建立了 uploads 檔案夾
// 設定圖片儲存的位置
const storage = multer.diskStorage({
  // 設定儲存的目的地 （檔案夾）
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'public', 'members'));
  },
  // 重新命名使用者上傳的圖片名稱
  filename: function (req, file, cb) {
    // console.log('multer filename', file);
    let ext = file.originalname.split('.').pop();
    let newFilename = `${Date.now()}.${ext}`;
    cb(null, newFilename);
    // {
    //   fieldname: 'photo',
    //   originalname: 'japan04-200.jpg',
    //   encoding: '7bit',
    //   mimetype: 'image/jpeg'
    // }
  },
});
const uploader = multer({
  // 設定儲存的位置
  storage: storage,
  // 過濾圖片
  fileFilter: function (req, file, cb) {
    if (
      file.mimetype !== 'image/jpeg' &&
      file.mimetype !== 'image/jpg' &&
      file.mimetype !== 'image/png'
    ) {
      cb('這些是不被接受的格式', false);
    } else {
      cb(null, true);
    }
  },
  // 檔案尺寸的過濾
  // limits: {
  //   // 1k = 1024
  //   fileSize: 200 * 1024,
  // },
});

const registerRules = [
  body('email').isEmail().withMessage('Email 欄位請填寫正確格式'),
  body('password').isLength({ min: 8 }).withMessage('密碼長度至少為8'),
  body('confirmPassword')
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage('密碼驗證不一致'),
];

// /api/auth/register
router.post(
  '/register',
  uploader.single('photo'),
  registerRules,
  async (req, res, next) => {
    // 1. req.params <-- 網址上的路由參數
    // 2. req.query  <-- 網址上的 query string
    // 3. req.body <-- 通常是表單 post 用的
    console.log('register body:', req.body);

    // 驗證資料
    // 拿到驗證結果
    const validateResults = validationResult(req);
    console.log('validateResults', validateResults);
    if (!validateResults.isEmpty()) {
      // 不是 empty --> 表示有不符合
      let error = validateResults.array();
      return res.status(400).json({ code: 3001, error: error });
    }

    // 確認 email 有沒有註冊過
    let [members] = await pool.execute(
      'SELECT id, email FROM members WHERE email = ?',
      [req.body.email]
    );
    if (members.length !== 0) {
      // 這個 email 有註冊過
      return res
        .status(400)
        .json({ code: 3002, error: '這個 email 已經註冊過' });
      // 盡可能讓後端回覆的格式是一致的，如果無法完全一致，那至少要讓前端有判斷的依據。
      // 做專案的時候，在專案開始前，可以先討論好要回覆的錯誤格式與代碼。
    }

    // 密碼雜湊 hash
    // bcrypt (長度: 60), argon2 (長度: 95)
    let hashPassword = await bcrypt.hash(req.body.password, 10);
    console.log('hashPassword: ', hashPassword);

    // 圖片處理完成後，會被放在 req 物件裡
    console.log('req.file', req.file);
    // 最終前端需要的網址: http://localhost:3001/public/members/1655003030907.jpg
    // 可以由後端來組合這個網址，也可以由前端來組合
    // 記得不要把 http://locahost:3001 這個存進資料庫，因為正式環境部署會不同
    // 目前這個專案採用：儲存 members/1655003030907.jpg 這樣格式
    // 使用者不一定有上傳圖片，所以要確認 req 是否有 file
    let photo = req.file ? '/members/' + req.file.filename : '';

    // save to db
    let [result] = await pool.execute(
      'INSERT INTO members (email, password, name, photo) VALUES (?, ?, ?, ?)',
      [req.body.email, hashPassword, req.body.name, photo]
    );
    console.log('insert result:', result);

    // response
    res.json({ code: 0, result: 'OK' });
  }
);

// /api/auth/login
router.post('/login', async (req, res, next) => {
  // 確認資料有收到
  console.log('req.body', req.body);
  // 確認有沒有這個帳號
  let [members] = await pool.execute(
    'SELECT id, email, password, name, photo FROM members WHERE email = ?',
    [req.body.email]
  );
  if (members.length === 0) {
    // 如果沒有，就回覆錯誤
    // 這個 email 沒有註冊過
    return res.status(400).json({ code: 3003, error: '帳號或密碼錯誤' });
  }
  // 如果程式碼能執行到這裡，表示 members 裡至少有一個資料
  // 把這個會員資料拿出來
  let member = members[0];

  // 如果有，確認密碼
  let passwordCompareResult = await bcrypt.compare(
    req.body.password,
    member.password
  );
  if (passwordCompareResult === false) {
    // 如果密碼不符合，回覆登入錯誤
    return res.status(400).json({ code: 3004, error: '帳號或密碼錯誤' });
  }

  // 密碼符合，就開始寫 session
  let returnMember = {
    email: member.email,
    name: member.name,
    photo: member.photo,
  };
  req.session.member = returnMember;

  // 回覆資料給前端
  res.json({
    code: 0,
    member: returnMember,
  });
});

router.get('/logout', (req, res, next) => {
  // 因為我們會依靠判斷 req.session.member 有沒有資料來當作有沒有登入
  // 所以當我們把 req.session.member 設定成 null，那就登出了
  req.session.member = null;
  res.sendStatus(202);
});

module.exports = router;
