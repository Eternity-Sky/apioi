require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// 导入路由
const submissionRoutes = require('./routes/submission');
const testcaseRoutes = require('./routes/testcase');

// 创建 Express 应用
const app = express();

// 基本中间件
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS配置
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: '*',
  credentials: false,
  maxAge: 86400
}));

// 预处理OPTIONS请求
app.options('*', cors());

// 安全配置
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: false
}));

// 根路由 - 重定向到API文档
app.get('/', (req, res) => {
  res.redirect('/api');
});

// API文档路由
app.get('/api', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'Online Judge API',
      version: '1.0.0',
      description: 'C++代码在线评测系统',
      baseUrl: 'https://apioi-production.up.railway.app',
      endpoints: {
        submissions: {
          submit: {
            method: 'POST',
            url: '/api/submissions',
            description: '提交代码进行评测',
            body: {
              code: 'string (C++ code)',
              testcases: [{
                input: 'string',
                output: 'string'
              }]
            },
            example: {
              request: {
                code: '#include <iostream>\nint main() { int a,b; std::cin>>a>>b; std::cout<<a+b; return 0; }',
                testcases: [{ input: '1 2', output: '3' }]
              }
            }
          },
          getAll: {
            method: 'GET',
            url: '/api/submissions',
            description: '获取所有提交记录'
          }
        }
      }
    }
  });
});

// API路由
app.use('/api/submissions', submissionRoutes);
app.use('/api/testcases', testcaseRoutes);

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: '未找到请求的资源',
      path: req.path,
      suggestion: '请访问 /api 查看API文档'
    }
  });
});

// 自定义错误类
class APIError extends Error {
  constructor(message, code = 'INTERNAL_ERROR', status = 500) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.status = status;
  }
}

// 统一错误处理
app.use((err, req, res, next) => {
  console.error('API错误:', err);

  // 如果错误是对象，尝试提取有用信息
  let errorMessage = '服务器内部错误';
  let errorCode = 'INTERNAL_ERROR';
  let statusCode = 500;

  if (err) {
    if (typeof err === 'string') {
      errorMessage = err;
    } else if (err instanceof Error) {
      errorMessage = err.message || errorMessage;
      errorCode = err.code || errorCode;
      statusCode = err.status || statusCode;
    } else if (typeof err === 'object') {
      errorMessage = err.message || JSON.stringify(err);
      errorCode = err.code || errorCode;
      statusCode = err.status || statusCode;
    }
  }

  const errorResponse = {
    success: false,
    error: {
      code: errorCode,
      message: errorMessage
    }
  };

  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
});

// 全局错误捕获
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`评测服务器运行在端口 ${PORT}`);
  console.log(`API文档: http://localhost:${PORT}/api`);
});

module.exports = { app, APIError }; 