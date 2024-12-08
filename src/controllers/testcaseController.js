const TestCase = require('../models/testcase');

// 获取题目的公开测试用例
exports.getTestCases = async (req, res) => {
  try {
    const { problemId } = req.params;
    
    const testCases = await TestCase.find({
      problemId,
      isPublic: true
    }).sort('order');

    return res.json(testCases);
  } catch (error) {
    console.error('获取测试用例错误:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
};

// 管理员添加测试用例
exports.createTestCase = async (req, res) => {
  try {
    const { problemId, input, output, isPublic, timeLimit, memoryLimit } = req.body;

    // 验证必要字段
    if (!problemId || !input || !output) {
      return res.status(400).json({ message: '缺少必要字段' });
    }

    // 获取当前最大的 order 值
    const maxOrder = await TestCase.findOne({ problemId })
      .sort('-order')
      .select('order');
    
    const order = maxOrder ? maxOrder.order + 1 : 0;

    // 创建新测试用例
    const testCase = await TestCase.create({
      problemId,
      input,
      output,
      isPublic: isPublic || false,
      order,
      timeLimit: timeLimit || 1000,
      memoryLimit: memoryLimit || 256
    });

    return res.status(201).json({
      message: '测试用例创建成功',
      testCase
    });
  } catch (error) {
    console.error('创建测试用例错误:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
}; 