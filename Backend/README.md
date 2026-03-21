# Ruanm Backend

替代 Supabase 的后端服务，用于部署到 Railway。

## 功能特性

- ✅ 用户认证（注册、登录、密码修改）
- ✅ OAuth 2.0 授权系统
- ✅ 用户资料管理
- ✅ Beta 权限管理
- ✅ API 使用日志
- ✅ 系统状态监控
- ✅ 完全兼容现有前端代码

## 快速开始

### 1. 安装依赖

```bash
cd Backend
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置以下变量：

```env
# 数据库配置
DATABASE_URL=postgresql://username:password@localhost:5432/ruanm

# JWT 配置
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# 服务器配置
PORT=3001
NODE_ENV=development

# CORS 配置
ALLOWED_ORIGINS=https://ruanmgjx.dpdns.org,http://localhost:3000
```

### 3. 初始化数据库

执行 `supabase/schema.sql` 文件中的 SQL 脚本来创建所有必需的表：

```bash
psql $DATABASE_URL -f ../supabase/schema.sql
```

或在数据库管理工具中执行该文件。

### 4. 启动服务器

开发模式：

```bash
npm run dev
```

生产模式：

```bash
npm start
```

服务器将在 `http://localhost:3001` 启动。

## API 接口

### 认证接口

#### 用户注册
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "用户名",
  "email": "email@example.com",
  "password": "密码"
}
```

#### 用户登录
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "email@example.com",
  "password": "密码"
}
```

#### 获取用户资料
```http
GET /api/v1/auth/profile/:id
Authorization: Bearer <token>
```

#### 修改密码
```http
PUT /api/v1/auth/change-password/:id
Content-Type: application/json
Authorization: Bearer <token>

{
  "currentPassword": "当前密码",
  "newPassword": "新密码"
}
```

### OAuth 接口

#### 创建应用
```http
POST /api/v1/oauth/applications
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "应用名称",
  "description": "应用描述",
  "redirect_uri": "https://example.com/callback",
  "scopes": "read write"
}
```

#### 获取应用列表
```http
GET /api/v1/oauth/applications
Authorization: Bearer <token>
```

#### 授权
```http
POST /api/v1/oauth-authorize/authorize
Content-Type: application/json
Authorization: Bearer <token>

{
  "client_id": "client_id",
  "redirect_uri": "https://example.com/callback",
  "scopes": "read write"
}
```

#### 令牌交换
```http
POST /api/v1/oauth/token
Content-Type: application/json

{
  "grant_type": "authorization_code",
  "code": "authorization_code",
  "client_id": "client_id",
  "client_secret": "client_secret",
  "redirect_uri": "https://example.com/callback"
}
```

### 管理员接口

#### 获取所有用户
```http
GET /api/v1/admin/users
Authorization: Bearer <token>
```

#### 授予 Beta 权限
```http
PUT /api/v1/admin/users/:id/beta-access
Content-Type: application/json
Authorization: Bearer <token>

{
  "has_beta_access": true
}
```

#### 获取系统状态
```http
GET /api/v1/admin/statuses
```

## 部署到 Railway

### 方法一：GitHub 部署（推荐）

#### 1. 连接 GitHub

1. 访问 [Railway](https://railway.app/)
2. 使用 GitHub 账号登录
3. 点击 "New Project"
4. 选择 "Deploy from GitHub repo"
5. 选择你的 Ruanm 仓库

#### 2. 配置 Railway

在 Railway 项目设置中：

1. **设置 Root 目录**：
   - 点击 "Settings"
   - 在 "Root Directory" 中输入 `Backend`
   - 这样 Railway 就知道从 Backend 文件夹构建

2. **添加环境变量**：
   - 点击 "Variables"
   - 添加以下变量：
     - `DATABASE_URL`: PostgreSQL 连接字符串
     - `JWT_SECRET`: 随机生成的密钥（可使用 `openssl rand -hex 32` 生成）
     - `NODE_ENV`: `production`

3. **配置 PostgreSQL 数据库**：
   - 点击 "New" > "Database" > "Add PostgreSQL"
   - Railway 会自动创建数据库并设置 `DATABASE_URL` 环境变量
   - 等待数据库部署完成

#### 3. 初始化数据库

在本地执行数据库初始化脚本：

```bash
# 从 Railway 复制 DATABASE_URL
cd Backend
npm install
npm run init-db
```

或在 Railway 中使用 "Shell" 功能执行。

#### 4. 部署完成

Railway 会自动构建和部署，部署完成后会提供一个公网 URL。

### 方法二：命令行部署

#### 1. 安装 Railway CLI

```bash
npm install -g @railway/cli
```

#### 2. 登录 Railway

```bash
railway login
```

#### 3. 初始化项目

```bash
cd Backend
railway init
```

#### 4. 创建 PostgreSQL 数据库

```bash
railway add postgresql
```

#### 5. 设置环境变量

```bash
railway variables set JWT_SECRET=your-secret-key
railway variables set NODE_ENV=production
```

#### 6. 部署

```bash
railway up
```

#### 7. 初始化数据库

```bash
railway run npm run init-db
```

#### 8. 打开应用

```bash
railway open
```

### 方法三：Docker 部署

#### 1. 创建 Dockerfile

在 Backend 文件夹中创建 `Dockerfile`：

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
```

#### 2. 构建并推送

```bash
docker build -t ruanm-backend .
docker tag ruanm-backend:latest registry.railway.app/ruanm-backend:latest
docker push registry.railway.app/ruanm-backend:latest
```

#### 3. 在 Railway 部署

使用 Railway 的 Docker 部署功能。

## 数据库架构

所有表结构定义在 `supabase/schema.sql` 文件中，包括：

- user_profiles (用户资料)
- oauth_applications (OAuth 应用)
- oauth_authorization_codes (授权码)
- oauth_access_tokens (访问令牌)
- oauth_refresh_tokens (刷新令牌)
- api_usage_logs (API 日志)
- system_statuses (系统状态)
- beta_applications (Beta 申请)
- 等等...

## 数据库架构

所有表结构定义在 `supabase/schema.sql` 文件中，包括：

- user_profiles (用户资料)
- oauth_applications (OAuth 应用)
- oauth_authorization_codes (授权码)
- oauth_access_tokens (访问令牌)
- oauth_refresh_tokens (刷新令牌)
- api_usage_logs (API 日志)
- system_statuses (系统状态)
- beta_applications (Beta 申请)
- 等等...

## 安全建议

1. **JWT_SECRET**: 使用强随机字符串，并定期更换
2. **数据库连接**: 生产环境使用 SSL 连接
3. **密码加密**: 使用 bcrypt 加密，salt rounds 设置为 10
4. **CORS**: 严格限制允许的域名
5. **令牌过期**: 访问令牌 1 小时过期，刷新令牌 7 天过期

## 故障排除

### 数据库连接失败

检查 `DATABASE_URL` 是否正确，确保数据库服务正在运行。

### CORS 错误

确保 `ALLOWED_ORIGINS` 包含前端应用的域名。

### 令牌无效

检查 `JWT_SECRET` 是否一致，确保客户端和服务端使用相同的密钥。

## 性能优化

- 使用数据库连接池
- 为常用查询创建索引
- 实现 API 日志异步写入
- 使用缓存层（如 Redis）存储会话

## 许可证

MIT License
