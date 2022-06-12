const express = require('express');
const router = express.Router();

// /api/member/info
router.get('/info', (req, res, next) => {
  if (req.session.member) {
    // 表示登入過
    return res.json(req.session.member);
  } else {
    // 表示尚未登入
    return res.status(403).json({ code: 2001, error: '尚未登入' });
  }
});

module.exports = router;
