# AI Mission 任务管理系统

一个功能完善的任务管理平台，用于替代 Google Sheet 进行团队任务管理。

## 功能特性

- ✅ 任务的增删改查（CRUD）
- ✅ 用户认证与权限管理
- ✅ 任务分配与协作
- ✅ 任务评论与历史记录
- ✅ 多视图展示（看板、列表、日历）
- 🚧 AI 智能任务调度（规划中）

## 技术栈

### 前端
- React 18 + TypeScript
- Vite
- TailwindCSS + Ant Design
- React Query + Zustand
- Axios

### 后端
- Node.js 22 + TypeScript
- Express.js
- Drizzle ORM
- PostgreSQL
- JWT 认证

## 项目结构

```
AI_Mission_manage/
├── frontend/          # 前端应用
├── backend/           # 后端 API 服务
├── docs/              # 项目文档
└── README.md
```

## 快速开始

### 前置要求

- Node.js 22+
- PostgreSQL 14+
- pnpm

### 安装依赖

```bash
# 安装后端依赖
cd backend
pnpm install

# 安装前端依赖
cd ../frontend
pnpm install
```

### 配置环境变量

在 `backend` 目录创建 `.env` 文件：

```env
DATABASE_URL=postgres://n8n:AViDmp1uEVWqiOF3KjFU@tonytest-n8n.cgb5t3jqdx7r.us-east-1.rds.amazonaws.com/n8n
JWT_SECRET=your-secret-key
PORT=3000
```

### 运行项目

```bash
# 启动后端
cd backend
pnpm dev

# 启动前端
cd frontend
pnpm dev
```

## 部署

本项目支持在 Zeabur 上一键部署。

## 开发文档

详细的开发文档请查看 `docs/development_document.md`

## License

MIT
