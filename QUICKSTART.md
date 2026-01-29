# 快速开始指南

## 🚀 在 Zeabur 上部署

### 步骤 1: 准备数据库

您已经有 AWS RDS PostgreSQL 数据库：
```
postgres://n8n:AViDmp1uEVWqiOF3KjFU@tonytest-n8n.cgb5t3jqdx7r.us-east-1.rds.amazonaws.com/n8n
```

需要先初始化数据库表结构，请在数据库中执行以下 SQL：

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

### 步骤 2: 在 Zeabur 部署后端

1. 访问 [Zeabur](https://zeabur.com) 并登录
2. 创建新项目
3. 点击 "Add Service" → "Git Repository"
4. 选择 `toller892/AI_Mission_manage` 仓库
5. 选择 `backend` 目录作为根目录
6. 配置环境变量：
   - `DATABASE_URL`: `postgres://n8n:AViDmp1uEVWqiOF3KjFU@tonytest-n8n.cgb5t3jqdx7r.us-east-1.rds.amazonaws.com/n8n`
   - `JWT_SECRET`: 生成一个随机字符串（例如：`your-super-secret-jwt-key-change-this-in-production`）
   - `PORT`: `3000`
   - `NODE_ENV`: `production`
7. 点击部署

部署完成后，记录后端服务的 URL（例如：`https://your-backend.zeabur.app`）

### 步骤 3: 在 Zeabur 部署前端

1. 在同一个项目中，点击 "Add Service" → "Git Repository"
2. 选择 `toller892/AI_Mission_manage` 仓库
3. 选择 `frontend` 目录作为根目录
4. 配置环境变量：
   - `VITE_API_URL`: 后端服务的完整 URL（例如：`https://your-backend.zeabur.app`）
5. 点击部署

### 步骤 4: 访问应用

部署完成后，访问前端服务的 URL，您将看到登录页面。

1. 点击"立即注册"创建第一个管理员账号
2. 登录后即可开始使用任务管理系统

## 📋 功能清单

✅ **已实现的功能：**
- 用户注册和登录
- 任务的创建、查看、编辑、删除
- 任务状态管理（待处理、进行中、已完成、已取消）
- 任务优先级设置（低、中、高、紧急）
- 多人任务分配
- 任务评论功能
- 任务历史记录
- 响应式界面设计

🚧 **计划中的功能（二期）：**
- AI 智能任务分配
- AI 任务时长预估
- 自然语言创建任务
- 任务看板视图
- 日历视图
- 数据统计和报表
- 通知系统

## 🛠️ 本地开发

### 后端

```bash
cd backend
pnpm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件

# 开发模式
pnpm dev
```

### 前端

```bash
cd frontend
pnpm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件

# 开发模式
pnpm dev
```

## 📚 文档

- [完整开发文档](./docs/development_document.md)
- [部署指南](./docs/DEPLOYMENT.md)

## 🆘 常见问题

### 1. 数据库连接失败

确保数据库 URL 格式正确，并且数据库服务器允许外部连接。

### 2. 前端无法连接后端

检查 `VITE_API_URL` 是否配置正确，确保包含完整的协议和域名。

### 3. 登录后页面空白

清除浏览器缓存和 localStorage，然后重新登录。

## 📞 技术支持

如有问题，请在 GitHub 仓库提交 Issue。
