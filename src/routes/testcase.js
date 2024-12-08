const express = require('express');
const router = express.Router();
const {
  getTestCases,
  createTestCase
} = require('../controllers/testcaseController');

// 中间件函数：检查是否是管理员
const isAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: '需要管理员权限' });
  }
  next();
};

// 获取公开测试用例
router.get('/:problemId', getTestCases);

// 管理员添加测试用例
router.post('/', isAdmin, createTestCase);

module.exports = router; 