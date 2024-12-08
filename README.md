# 在线代码评测系统 API

基于 Node.js + Express + MongoDB 构建的在线代码评测系统 API。

## 功能特点

- 代码提交和评测
- 测试用例管理
- 评测结果查询
- 支持多种编程语言
- 安全性保护
- API 访问频率限制

## 部署到 Vercel

1. Fork 此仓库到你的 GitHub 账号

2. 在 Vercel 控制台创建新项目，选择导入 GitHub 仓库

3. 配置环境变量：
   - `MONGODB_URI`: MongoDB 连接字符串
   - `JWT_SECRET`: JWT 密钥
   - `RATE_LIMIT_WINDOW`: 频率限制时间窗口（分钟）
   - `RATE_LIMIT_MAX`: 最大请求次数

4. 点击 Deploy 开始部署

## API 文档

### 提交代码
POST /api/submit
```json
{
  "problemId": "题目ID",
  "code": "代码内容",
  "language": "编程语言"
}
```

### 获取提交结果
GET /api/result/:submissionId

### 获取测试用例
GET /api/testcases/:problemId

### 添加测试用例（管理员）
POST /api/testcases
```json
{
  "problemId": "题目ID",
  "input": "输入数据",
  "output": "期望输出",
  "isPublic": true
}
```

## 本地开发

1. 克隆仓库
```bash
git clone <repository-url>
```

2. 安装依赖
```bash
npm install
```

3. 创建 .env 文件并配置环境变量

4. 启动开发服务器
```bash
npm run dev
``` 