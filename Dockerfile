FROM gcc:latest

WORKDIR /app

# 安装 Node.js
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# 复制项目文件
COPY package*.json ./
RUN npm install

COPY . .

# 创建临时目录
RUN mkdir -p /tmp/code

# 设置环境变量
ENV PORT=3000

# 启动应用
CMD ["npm", "start"] 