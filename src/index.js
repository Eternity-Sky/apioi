require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// 导入路由
const submissionRoutes = require('./routes/submission');
const testcaseRoutes = require('./routes/testcase');

// 创建 Express 应用
const app = express();

// 基本中间件
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 安全和CORS配置
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false,
}));

// CORS配置
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400
}));

// 预处理OPTIONS请求
app.options('*', cors());

// 根路由 - API文档
app.get('/', (req, res) => {
  res.json({
    name: 'Code Judge API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      submissions: '/api/submissions',
      testcases: '/api/testcases'
    },
    documentation: {
      submitCode: {
        method: 'POST',
        url: '/api/submissions',
        body: {
          code: 'string (C++ code)',
          testcases: [{
            input: 'string',
            output: 'string'
          }]
        }
      },
      getSubmissions: {
        method: 'GET',
        url: '/api/submissions'
      }
    }
  });
});

// API健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'code-judge-api'
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
      message: '未找到请求的资源',
      type: 'NotFoundError',
      path: req.path
    }
  });
});

// API错误处理中间件
app.use((err, req, res, next) => {
  console.error('API错误:', err);
  
  res.setHeader('Content-Type', 'application/json');
  
  res.status(err.status || 500).json({
    success: false,
    error: {
      message: err.message || '服务器内部错误',
      type: err.name || 'InternalError',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  });
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
  console.log(`API文档: http://localhost:${PORT}/`);
  console.log(`健康检查: http://localhost:${PORT}/api/health`);
});

module.exports = app; 