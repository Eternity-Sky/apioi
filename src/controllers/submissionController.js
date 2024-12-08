const Submission = require('../models/submission');
const { runCode } = require('../services/codeRunner');

// 提交代码
exports.submitCode = async (req, res) => {
  try {
    const { problemId, code, language } = req.body;

    // 验证必要字段
    if (!problemId || !code || !language) {
      return res.status(400).json({ message: '缺少必要字段' });
    }

    // 创建提交记录
    const submission = await Submission.create({
      problemId,
      userId: req.user.id, // 假设通过认证中间件设置了 req.user
      code,
      language,
      status: 'pending'
    });

    // 异步执行代码评测
    runCode(submission._id).catch(console.error);

    return res.status(201).json({
      submissionId: submission._id,
      message: '提交成功'
    });
  } catch (error) {
    console.error('提交代码错误:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
};

// 获取提交结果
exports.getSubmissionResult = async (req, res) => {
  try {
    const { submissionId } = req.params;
    
    const submission = await Submission.findById(submissionId).select('-code');
    
    if (!submission) {
      return res.status(404).json({ message: '未找到提交记录' });
    }

    // 检查权限（用户只能查看自己的提交）
    if (submission.userId !== req.user.id) {
      return res.status(403).json({ message: '无权访问此提交记录' });
    }

    return res.json({
      status: submission.status,
      runtime: submission.runtime,
      memory: submission.memory,
      createdAt: submission.createdAt
    });
  } catch (error) {
    console.error('获取提交结果错误:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
}; 