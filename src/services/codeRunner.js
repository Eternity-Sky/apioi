const Submission = require('../models/submission');
const TestCase = require('../models/testcase');

// 代码执行服务
async function runCode(submissionId) {
  try {
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      throw new Error('提交记录不存在');
    }

    // 获取所有测试用例
    const testCases = await TestCase.find({ problemId: submission.problemId });
    if (!testCases.length) {
      throw new Error('未找到测试用例');
    }

    // 更新状态为评测中
    submission.status = 'pending';
    await submission.save();

    // 模拟代码评测过程
    const results = await Promise.all(testCases.map(async (testCase) => {
      // 这里可以替换为实际的在线评测服务 API 调用
      const result = await simulateCodeExecution(submission.code, testCase);
      return result;
    }));

    // 处理评测结果
    const maxRuntime = Math.max(...results.map(r => r.runtime));
    const maxMemory = Math.max(...results.map(r => r.memory));
    const hasError = results.some(r => r.error);
    const allCorrect = results.every(r => r.correct);

    // 更新提交状态
    submission.runtime = maxRuntime;
    submission.memory = maxMemory;
    submission.status = hasError ? 'error' : (allCorrect ? 'accepted' : 'wrong');
    await submission.save();

    return submission;
  } catch (error) {
    console.error('代码执行错误:', error);
    // 更新提交状态为错误
    await Submission.findByIdAndUpdate(submissionId, { status: 'error' });
    throw error;
  }
}

// 模拟代码执行
// 在实际应用中，这里应该调用在线评测服务的 API
async function simulateCodeExecution(code, testCase) {
  return new Promise(resolve => {
    setTimeout(() => {
      // 模拟评测结果
      resolve({
        runtime: Math.floor(Math.random() * 1000),
        memory: Math.floor(Math.random() * 100),
        correct: Math.random() > 0.3,
        error: Math.random() > 0.9
      });
    }, 1000);
  });
}

module.exports = {
  runCode
}; 