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

// 中间件
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 添加根路由处理器
app.get('/api', (req, res) => {
  res.json({
    message: 'API 运行正常',
    endpoints: {
      submissions: '/api/submissions',
      testcases: '/api/testcases'
    }
  });
});

// API路由
app.use('/api', submissionRoutes);
app.use('/api/testcases', testcaseRoutes);

// 所有其他路由返回前端页面
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '服务器错误' });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
}); 