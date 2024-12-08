const Docker = require('dockerode');
const docker = new Docker();
const fs = require('fs').promises;
const path = require('path');

// 使用内存存储
const submissions = [];

exports.createSubmission = async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ message: '缺少代码' });
    }

    // 创建提交记录
    const submission = {
      id: Date.now().toString(),
      code,
      language: 'cpp',
      status: 'pending',
      createdAt: new Date()
    };
    submissions.push(submission);

    // 异步执行代码评测
    runCode(submission).catch(console.error);

    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 代码评测函数
async function runCode(submission) {
  const tempDir = `/tmp/code-${submission.id}`;
  const sourceFile = path.join(tempDir, 'main.cpp');
  const execFile = path.join(tempDir, 'main');

  try {
    // 创建临时目录
    await fs.mkdir(tempDir, { recursive: true });
    
    // 写入源代码文件
    await fs.writeFile(sourceFile, submission.code);
    
    // 创建容器
    const container = await docker.createContainer({
      Image: 'gcc:latest',
      Cmd: [
        'sh', '-c',
        `g++ -O2 -std=c++17 ${sourceFile} -o ${execFile} && ${execFile}`
      ],
      HostConfig: {
        Binds: [`${tempDir}:${tempDir}`],
        NetworkDisabled: true,
        Memory: 256 * 1024 * 1024, // 256MB内存限制
        MemorySwap: 256 * 1024 * 1024,
        CpuPeriod: 100000,
        CpuQuota: 10000, // 限制CPU使用
        PidsLimit: 50 // 限制进程数
      },
      WorkingDir: tempDir,
      Tty: true,
      StopTimeout: 5
    });

    // 启动容器
    await container.start();

    // 等待执行完成
    const result = await container.wait();
    
    // 获取输出
    const output = await container.logs({
      stdout: true,
      stderr: true
    });

    // 更新提交状态
    submission.status = result.StatusCode === 0 ? 'success' : 'error';
    submission.output = output.toString();
    submission.executionTime = Date.now() - new Date(submission.createdAt).getTime();

    // 清理容器和临时文件
    await container.remove();
    await fs.rm(tempDir, { recursive: true, force: true });
  } catch (error) {
    submission.status = 'error';
    submission.error = error.message;
    // 确保清理临时文件
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
    res.status(500).json({ message: error.message });
  }
}; 