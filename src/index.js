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
app.use(express.json({ limit: '50mb' }));  // 增加请求体大小限制
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 安全和CORS配置
app.use(helmet({
  contentSecurityPolicy: false,  // 禁用 CSP
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false,
}));

// CORS配置
app.use(cors({
  origin: true,  // 允许所有来源
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400  // CORS预检请求缓存24小时
}));

// 预处理OPTIONS请求
app.options('*', cors());

// API错误处理中间件
app.use((err, req, res, next) => {
  console.error('API错误:', err);
  
  // 确保返回JSON格式
  res.setHeader('Content-Type', 'application/json');
  
  // 标准化错误响应
  res.status(err.status || 500).json({
    success: false,
    error: {
      message: err.message || '服务器内部错误',
      type: err.name || 'InternalError',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  });
});

// API健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API路由
app.use('/api/submissions', submissionRoutes);  // 简化路由路径
app.use('/api/testcases', testcaseRoutes);

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
  console.log(`API地址: http://localhost:${PORT}/api`);
});

// 导出app实例（用于测试）
module.exports = app; 