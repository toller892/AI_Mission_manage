# AI Mission 任务管理系统 - 前端应用

这是 AI Mission 任务管理系统的前端 Web 应用。

## 技术栈

- React 19 + TypeScript
- Vite
- Ant Design + TailwindCSS
- React Query + Zustand
- React Router v6

## 环境变量

在部署前需要配置以下环境变量：

```env
VITE_API_URL=https://your-backend-url.zeabur.app
```

**重要**: `VITE_API_URL` 必须是后端服务的完整 URL（包括 https://）

## Zeabur 部署

1. 在 Zeabur 创建新服务
2. 选择 Git 仓库：`toller892/AI_Mission_manage`
3. 选择分支：`deploy-frontend`
4. 配置环境变量 `VITE_API_URL`
5. 点击部署

## 本地开发

```bash
# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置 VITE_API_URL

# 开发模式
pnpm dev

# 构建
pnpm build

# 预览构建结果
pnpm preview
```

## 功能特性

- ✅ 用户注册和登录
- ✅ 任务管理（增删改查）
- ✅ 任务状态管理
- ✅ 任务优先级设置
- ✅ 多人任务分配
- ✅ 任务评论
- ✅ 响应式设计

## 页面路由

- `/login` - 登录页面
- `/register` - 注册页面
- `/` - 任务列表（需要登录）

## 部署注意事项

1. 必须先部署后端服务
2. 获取后端服务的 URL
3. 在前端部署时配置 `VITE_API_URL` 环境变量
4. 确保后端 URL 可以被前端访问（CORS 已配置）

## License

MIT
