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
    runCode(submission).catch(error => {
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
async function runCode(submission) {
  const tempDir = path.join(process.cwd(), 'temp', `code-${submission.id}`);
  const sourceFile = path.join(tempDir, 'main.cpp');
  const execFile = path.join(tempDir, 'main');

  try {
    console.log('创建临时目录:', tempDir);
    await fs.mkdir(tempDir, { recursive: true });
    
    console.log('写入源代码文件');
    await fs.writeFile(sourceFile, submission.code);
    
    console.log('创建Docker容器');
    const container = await docker.createContainer({
      Image: 'gcc:latest',
      Cmd: [
        'sh', '-c',
        `g++ -O2 -std=c++17 ${sourceFile} -o ${execFile} && ${execFile}`
      ],
      HostConfig: {
        Binds: [`${tempDir}:${tempDir}`],
        NetworkDisabled: true,
        Memory: 256 * 1024 * 1024,
        MemorySwap: 256 * 1024 * 1024,
        CpuPeriod: 100000,
        CpuQuota: 10000,
        PidsLimit: 50,
        AutoRemove: true
      },
      WorkingDir: tempDir,
      Tty: true,
      StopTimeout: 5
    });

    console.log('启动容器');
    await container.start();

    console.log('等待执行完成');
    const result = await container.wait();
    
    console.log('获取输出');
    const output = await container.logs({
      stdout: true,
      stderr: true
    });

    console.log('更新提交状态');
    submission.status = result.StatusCode === 0 ? 'success' : 'error';
    submission.output = output.toString();
    submission.executionTime = Date.now() - new Date(submission.createdAt).getTime();

    try {
      console.log('清理容器');
      await container.remove();
    } catch (e) {
      console.error('清理容器失败:', e);
    }

    try {
      console.log('清理临时文件');
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (e) {
      console.error('清理临时文件失败:', e);
    }
  } catch (error) {
    console.error('代码评测过程错误:', error);
    submission.status = 'error';
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