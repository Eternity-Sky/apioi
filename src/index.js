require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// 导入路由
const submissionRoutes = require('./routes/submission');
const testcaseRoutes = require('./routes/testcase');

// 创建 Express 应用
const app = express();

// 中间件
app.use(helmet());
app.use(cors());
app.use(express.json());

// 路由
app.use('/api', submissionRoutes);
app.use('/api/testcases', testcaseRoutes);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '服务器错误' });
});

// 启动服务器
const PORT = process.env.PORT || 3000;

// Vercel 环境检查
if (process.env.VERCEL) {
  // 导出 app 以供 Vercel 使用
  module.exports = app;
} else {
  // 本地开发环境
  app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
  });
} 