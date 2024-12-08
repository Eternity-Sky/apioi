const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');

// GET /api/submissions - 获取所有提交
router.get('/submissions', submissionController.getSubmissions);

// POST /api/submissions - 创建新提交
router.post('/submissions', submissionController.createSubmission);

module.exports = router; 