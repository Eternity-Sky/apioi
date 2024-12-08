const express = require('express');
const router = express.Router();
const { rateLimit } = require('express-rate-limit');

const {
  submitCode,
  getSubmissionResult
} = require('../controllers/submissionController');

// 创建提交频率限制中间件
const submitLimiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX,
  message: '提交太频繁，请稍后再试'
});

// 提交代码路由
router.post('/submit', submitLimiter, submitCode);

// 获取提交结果路由
router.get('/result/:submissionId', getSubmissionResult);

module.exports = router; 