# Docker 部署指南

## 快速启动

### 1. 配置环境变量

```bash
cp .env.docker .env
# 编辑 .env 修改密码和密钥
```

### 2. 构建并启动

```bash
# 构建并启动所有服务
docker-compose up -d --build

# 查看日志
docker-compose logs -f

# 查看服务状态
docker-compose ps
```

### 3. 访问服务

- **前端**: http://localhost
- **后端API**: http://localhost:3000/api/v1
- **Swagger文档**: http://localhost:3000/api-docs

### 4. 默认账号

```
用户名: admin
密码: admin123
```

---

## 常用命令

```bash
# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看后端日志
docker-compose logs -f backend

# 进入后端容器
docker exec -it qjwl-backend sh

# 进入MySQL
docker exec -it qjwl-mysql mysql -uroot -proot123 qjwl_db
```

---

## 数据持久化

数据存储在 Docker volumes 中：

- `mysql_data` - 数据库文件
- `backend_uploads` - 上传的文件

```bash
# 查看 volumes
docker volume ls

# 备份数据库
docker exec qjwl-mysql mysqldump -uroot -proot123 qjwl_db > backup.sql

# 恢复数据库
docker exec -i qjwl-mysql mysql -uroot -proot123 qjwl_db < backup.sql
```

---

## 生产部署建议

### 1. 修改密码和密钥

编辑 `.env` 文件：

```env
MYSQL_ROOT_PASSWORD=your-strong-password
DB_PASSWORD=your-strong-password
JWT_SECRET=your-super-secret-key-at-least-32-chars
```

### 2. 使用外部数据库

如果使用已有的 MySQL 服务器，修改 `docker-compose.yml`：

```yaml
# 注释掉 mysql 服务
# 修改 backend 的环境变量
environment:
  - DB_HOST=your-mysql-host
  - DB_PORT=3306
  - DB_USERNAME=your-username
  - DB_PASSWORD=your-password
```

### 3. 配置 HTTPS

使用 Nginx 反向代理或配置 SSL 证书：

```bash
# 使用 Let's Encrypt
docker run -it --rm \
  -v /etc/letsencrypt:/etc/letsencrypt \
  certbot/certbot certonly --standalone -d your-domain.com
```

### 4. 资源限制

在 `docker-compose.yml` 中添加：

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
```

---

## 更新部署

```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker-compose up -d --build

# 清理旧镜像
docker image prune -f
```

---

## 故障排查

### 后端无法连接数据库

```bash
# 检查 MySQL 是否就绪
docker-compose logs mysql

# 等待 MySQL 完全启动后重启后端
docker-compose restart backend
```

### 前端无法访问 API

```bash
# 检查后端是否运行
curl http://localhost:3000/api/v1/auth/login

# 检查网络
docker network ls
docker network inspect qjwldb_qjwl-network
```

### 清理并重新开始

```bash
# 停止并删除所有容器、网络、卷
docker-compose down -v

# 重新构建
docker-compose up -d --build
```


