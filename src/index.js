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

// 统一错误处理
app.use((err, req, res, next) => {
  console.error('API错误:', err);
  
  const statusCode = err.status || 500;
  const errorResponse = {
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || '服务器内部错误',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  };

  // 对特定错误类型进行处理
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorResponse.error.code = 'VALIDATION_ERROR';
  } else if (err.name === 'CompilationError') {
    statusCode = 400;
    errorResponse.error.code = 'COMPILATION_ERROR';
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

module.exports = app; 