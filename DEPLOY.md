# 工程咨询全业务数据库平台 - 部署指南

## 系统要求

- Node.js 18+
- MySQL 8.0+
- npm 或 yarn

---

## 快速部署

### 1. 安装依赖

```bash
# 后端
cd backend
npm install

# 前端
cd ../frontend
npm install
```

### 2. 配置后端环境变量

复制环境变量模板并修改：

```bash
cd backend
cp env.example .env
```

编辑 `.env` 文件：

```env
# 数据库配置（必须修改）
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
DB_DATABASE=qjwl_db
DB_SYNCHRONIZE=true
DB_LOGGING=false

# 服务端口
PORT=3000

# JWT配置（生产环境必须修改）
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRES_IN=7d
```

### 3. 创建数据库

```sql
CREATE DATABASE qjwl_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. 启动服务

#### 开发模式

```bash
# 后端（终端1）
cd backend
npm run start:dev

# 前端（终端2）
cd frontend
npm run dev
```

#### 生产模式

```bash
# 构建后端
cd backend
npm run build
npm run start:prod

# 构建前端
cd frontend
npm run build
# 将 dist 目录部署到 Nginx 或其他静态服务器
```

---

## 访问地址

- **前端**: http://localhost:5173 (开发) 或部署后的地址
- **后端API**: http://localhost:3000/api/v1
- **Swagger文档**: http://localhost:3000/api-docs

---

## 默认账号

```
用户名: admin
密码: admin123
```

⚠️ **首次登录后请立即修改密码！**

---

## 生产部署建议

### 使用 PM2 管理后端进程

```bash
# 安装 PM2
npm install -g pm2

# 启动后端
cd backend
npm run build
pm2 start dist/main.js --name qjwl-backend

# 查看状态
pm2 status
pm2 logs qjwl-backend
```

### Nginx 配置示例

```nginx
# 前端静态文件
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # 代理后端API
    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 代理静态文件（上传的文件）
    location /static {
        proxy_pass http://127.0.0.1:3000;
    }
}
```

### 前端生产环境配置

编辑 `frontend/vite.config.ts`，修改 API 代理地址为实际后端地址。

或者修改 `frontend/src/services/api.ts` 中的 `baseURL`。

---

## 目录结构

```
QJWLdb/
├── backend/                 # 后端代码
│   ├── src/                 # 源代码
│   ├── uploads/             # 上传文件目录
│   ├── .env                 # 环境变量（需创建）
│   └── package.json
├── frontend/                # 前端代码
│   ├── src/                 # 源代码
│   ├── dist/                # 构建输出（npm run build 后生成）
│   └── package.json
└── DEPLOY.md               # 本文档
```

---

## 常见问题

### 1. 数据库连接失败

检查 `.env` 中的数据库配置是否正确，确保 MySQL 服务已启动。

### 2. 端口被占用

修改 `.env` 中的 `PORT` 或前端 `vite.config.ts` 中的端口配置。

### 3. 上传文件无法访问

确保 `backend/uploads` 目录存在且有写入权限。

### 4. Token 过期

修改 `.env` 中的 `JWT_EXPIRES_IN`，如 `30d` 表示30天。

---

## 技术栈

**后端**
- NestJS + TypeScript
- TypeORM + MySQL
- JWT 认证
- Swagger API 文档

**前端**
- React 18 + TypeScript
- Vite
- Ant Design
- React Query

---

## 联系方式

如有问题，请联系开发团队。


