const express = require('express');
const router = express.Router();
const testcaseController = require('../controllers/testcaseController');

// GET /api/testcases - 获取所有测试用例
router.get('/', testcaseController.getTestcases);

// POST /api/testcases - 创建新测试用例
router.post('/', testcaseController.createTestcase);

module.exports = router; 