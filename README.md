# AI Mission 任务管理系统 - 后端服务

这是 AI Mission 任务管理系统的后端 API 服务。

## 技术栈

- Node.js 22 + TypeScript
- Express.js
- Drizzle ORM
- PostgreSQL
- JWT 认证

## 环境变量

在部署前需要配置以下环境变量：

```env
DATABASE_URL=postgres://n8n:AViDmp1uEVWqiOF3KjFU@tonytest-n8n.cgb5t3jqdx7r.us-east-1.rds.amazonaws.com/n8n
JWT_SECRET=your-random-secret-key
PORT=3000
NODE_ENV=production
```

## Zeabur 部署

1. 在 Zeabur 创建新服务
2. 选择 Git 仓库：`toller892/AI_Mission_manage`
3. 选择分支：`deploy-backend`
4. 配置上述环境变量
5. 点击部署

## 本地开发

```bash
# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件

# 开发模式
pnpm dev

# 构建
pnpm build

# 生产模式
pnpm start
```

## API 端点

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息
- `GET /api/tasks` - 获取任务列表
- `POST /api/tasks` - 创建任务
- `GET /api/tasks/:id` - 获取任务详情
- `PUT /api/tasks/:id` - 更新任务
- `DELETE /api/tasks/:id` - 删除任务
- `POST /api/tasks/:id/comments` - 添加评论
- `GET /api/users` - 获取用户列表
- `GET /api/users/:id` - 获取用户详情
- `PUT /api/users/:id` - 更新用户信息

## 数据库表

所有表使用 `ai_mission_` 前缀：

- `ai_mission_users` - 用户表
- `ai_mission_tasks` - 任务表
- `ai_mission_task_assignees` - 任务分配表
- `ai_mission_task_comments` - 任务评论表
- `ai_mission_task_history` - 任务历史表

## License

MIT
