const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const util = require('util');
const execAsync = util.promisify(exec);

// 使用内存存储
const submissions = [];

exports.createSubmission = async (req, res) => {
  try {
    const { code, testcases } = req.body;
    
    if (!code) {
      return res.status(400).json({ message: '缺少代码' });
    }

    // 创建提交记录
    const submission = {
      id: Date.now().toString(),
      code,
      language: 'cpp',
      status: 'pending',
      testResults: [],
      createdAt: new Date()
    };
    submissions.push(submission);

    // 异步执行代码评测
    runCode(submission, testcases || [{ input: '', output: '' }]).catch(error => {
      console.error('代码评测错误:', error);
      submission.status = 'error';
      submission.error = error.message;
    });

    res.status(201).json(submission);
  } catch (error) {
    console.error('创建提交错误:', error);
    res.status(500).json({ message: error.message });
  }
};

// 代码评测函数
async function runCode(submission, testcases) {
  const tempDir = path.join(process.cwd(), 'temp', `code-${submission.id}`);
  const sourceFile = path.join(tempDir, 'main.cpp');
  const execFile = path.join(tempDir, 'main');
  const inputFile = path.join(tempDir, 'input.txt');

  try {
    console.log('创建临时目录:', tempDir);
    await fs.mkdir(tempDir, { recursive: true });
    
    console.log('写入源代码文件');
    await fs.writeFile(sourceFile, submission.code);
    
    console.log('编译代码');
    const { stderr: compileError } = await execAsync(`g++ -O2 -std=c++17 -Wall ${sourceFile} -o ${execFile}`);
    
    if (compileError) {
      throw new Error(`编译错误:\n${compileError}`);
    }

    submission.testResults = [];
    let allPassed = true;

    // 运行每个测试用例
    for (let i = 0; i < testcases.length; i++) {
      const testcase = testcases[i];
      console.log(`运行测试用例 ${i + 1}`);
      
      // 写入输入文件
      await fs.writeFile(inputFile, testcase.input);

      try {
        const startTime = process.hrtime();
        const { stdout, stderr } = await execAsync(`${execFile} < ${inputFile}`, {
          timeout: 1000, // 1秒超时
          maxBuffer: 1024 * 1024 // 1MB输出限制
        });
        const [seconds, nanoseconds] = process.hrtime(startTime);
        const executionTime = seconds * 1000 + nanoseconds / 1000000; // 转换为毫秒

        const result = {
          testcase: i + 1,
          input: testcase.input,
          expectedOutput: testcase.output,
          actualOutput: stdout.trim(),
          time: executionTime,
          status: stdout.trim() === testcase.output.trim() ? 'AC' : 'WA'
        };

        if (stderr) {
          result.error = stderr;
        }

        submission.testResults.push(result);
        if (result.status !== 'AC') {
          allPassed = false;
        }
      } catch (error) {
        submission.testResults.push({
          testcase: i + 1,
          input: testcase.input,
          expectedOutput: testcase.output,
          error: error.message,
          status: error.code === 'ETIMEDOUT' ? 'TLE' : 'RE'
        });
        allPassed = false;
      }
    }

    submission.status = allPassed ? 'AC' : 'WA';
    submission.executionTime = Math.max(...submission.testResults.map(r => r.time || 0));

    console.log('清理临时文件');
    await fs.rm(tempDir, { recursive: true, force: true });
  } catch (error) {
    console.error('代码评测过程错误:', error);
    submission.status = 'CE';
    submission.error = error.message;
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (e) {
      console.error('清理临时文件失败:', e);
    }
  }
}

exports.getSubmissions = async (req, res) => {
  try {
    res.json(submissions);
  } catch (error) {
    console.error('获取提交列表错误:', error);
    res.status(500).json({ message: error.message });
  }
}; 