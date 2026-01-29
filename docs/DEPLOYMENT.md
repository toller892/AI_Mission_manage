# 部署指南

## Zeabur 部署

### 前置准备

1. 注册 [Zeabur](https://zeabur.com) 账号
2. 连接您的 GitHub 账号
3. 准备 PostgreSQL 数据库（可使用 AWS RDS 或 Zeabur 提供的数据库服务）

### 部署步骤

#### 1. 创建新项目

在 Zeabur 控制台创建新项目。

#### 2. 部署后端服务

1. 点击 "Add Service" -> "Git Repository"
2. 选择 `toller892/AI_Mission_manage` 仓库
3. 选择 `backend` 目录
4. 配置环境变量：
   - `DATABASE_URL`: PostgreSQL 连接字符串
   - `JWT_SECRET`: JWT 密钥（建议使用随机生成的长字符串）
   - `NODE_ENV`: `production`
5. 点击部署

#### 3. 运行数据库迁移

后端服务部署完成后，需要初始化数据库表结构：

```bash
# 在后端服务的终端中运行
pnpm db:push
```

或者手动执行 SQL：

```sql
-- 创建枚举类型
CREATE TYPE user_role AS ENUM ('admin', 'member', 'pa');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- 创建用户表
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  role user_role DEFAULT 'member' NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 创建任务表
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status task_status DEFAULT 'pending' NOT NULL,
  priority task_priority DEFAULT 'medium' NOT NULL,
  creator_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  pa_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_date DATE DEFAULT CURRENT_DATE NOT NULL,
  due_date DATE,
  completed_date DATE,
  estimated_duration_days INTEGER,
  ticket_url TEXT,
  tags TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 创建任务分配表
CREATE TABLE task_assignees (
  task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (task_id, user_id)
);

-- 创建任务评论表
CREATE TABLE task_comments (
  id SERIAL PRIMARY KEY,
  task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 创建任务历史表
CREATE TABLE task_history (
  id SERIAL PRIMARY KEY,
  task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 创建索引
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_creator_id ON tasks(creator_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_task_assignees_user_id ON task_assignees(user_id);
CREATE INDEX idx_task_comments_task_id ON task_comments(task_id);
```

#### 4. 部署前端服务

1. 点击 "Add Service" -> "Git Repository"
2. 选择 `toller892/AI_Mission_manage` 仓库
3. 选择 `frontend` 目录
4. 配置环境变量：
   - `VITE_API_URL`: 后端服务的 URL（例如：`https://your-backend.zeabur.app`）
5. 点击部署

#### 5. 配置域名（可选）

在 Zeabur 控制台为前端和后端服务配置自定义域名。

### 验证部署

1. 访问前端 URL
2. 注册新用户
3. 创建测试任务
4. 验证所有功能正常

## Docker 部署

### 使用 Docker Compose

```bash
# 1. 克隆仓库
git clone https://github.com/toller892/AI_Mission_manage.git
cd AI_Mission_manage

# 2. 配置环境变量
cp backend/.env.example backend/.env
# 编辑 backend/.env 填入数据库连接信息

# 3. 启动服务
docker-compose up -d

# 4. 查看日志
docker-compose logs -f
```

服务将在以下端口启动：
- 前端: http://localhost:80
- 后端: http://localhost:3000
- 数据库: localhost:5432

## 手动部署

### 后端

```bash
cd backend
pnpm install
pnpm build

# 配置环境变量
export DATABASE_URL="your-database-url"
export JWT_SECRET="your-secret"
export PORT=3000

# 运行数据库迁移
pnpm db:push

# 启动服务
pnpm start
```

### 前端

```bash
cd frontend
pnpm install

# 配置环境变量
echo "VITE_API_URL=http://your-backend-url" > .env

# 构建
pnpm build

# 使用 nginx 或其他静态服务器托管 dist 目录
```

## 故障排查

### 数据库连接失败

- 检查 `DATABASE_URL` 格式是否正确
- 确认数据库服务器可访问
- 检查防火墙规则

### 前端无法连接后端

- 检查 `VITE_API_URL` 配置
- 确认后端服务正常运行
- 检查 CORS 配置

### 认证失败

- 检查 `JWT_SECRET` 是否一致
- 清除浏览器 localStorage
- 重新登录

## 数据迁移

如需从 Google Sheet 迁移数据，请参考 `docs/development_document.md` 中的数据迁移方案。
