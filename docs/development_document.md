# 任务管理平台开发文档

**版本:** 1.0
**日期:** 2026-01-29
**作者:** Manus AI

---

## 1. 项目概述

本文档旨在为“任务管理平台”项目提供全面的技术和开发指导。该项目的主要目标是替代当前基于 Google Sheet 的任务管理流程，开发一个功能完善、可扩展的 Web 应用程序。系统将支持任务的动态发布、分配、跟踪和管理（增删改查），并计划在未来集成人工智能（AI）技术，以实现任务的智能调度和优化分配。

## 2. 需求分析

### 2.1. 核心功能需求

基于对现有 Google Sheet 工作流的分析，系统需要实现以下核心功能：

- **任务管理 (CRUD):**
  - **创建 (Create):** 用户可以创建新任务，并填写任务标题、描述、优先级、截止日期等信息。
  - **读取 (Read):** 用户可以查看任务列表、看板和日历视图，并能通过筛选、排序和搜索功能快速定位任务。
  - **更新 (Update):** 用户可以编辑任务的各项属性，包括状态、分配人、截止日期等。
  - **删除 (Delete):** 用户可以删除不再需要的任务。

- **用户认证与权限:**
  - 系统需要支持用户注册、登录和会话管理。
  - 应实现基于角色的访问控制（RBAC），例如管理员、普通成员、项目助理（PA）等，不同角色拥有不同的操作权限。

- **协作功能:**
  - **任务分配:** 任务可以分配给一个或多个团队成员。
  - **评论与沟通:** 用户可以在任务下发表评论，方便团队成员就具体任务进行沟通。
  - **历史记录:** 自动记录任务的所有变更历史，便于追溯。

- **数据可视化:**
  - 提供仪表盘（Dashboard）功能，通过图表展示任务状态分布、成员工作负载、项目进度等关键指标。

### 2.2. AI 调度功能（二期规划）

在基础功能稳定后，项目将引入 AI 技术以提升任务管理效率：

- **智能分配:** 根据任务的类型、优先级以及团队成员的技能和当前负载，AI 自动推荐最合适的任务执行人。
- **时长预估:** 基于历史数据，AI 能够预测完成一个新任务所需的大致时间。
- **优先级排序:** AI 能够根据任务的紧急程度、重要性和依赖关系，智能推荐任务的处理顺序。
- **自然语言处理:** 用户可以通过自然语言快速创建任务，系统能够自动解析并填充任务的关键信息。

### 2.3. 现有数据结构分析

对 `AI Mission` Google Sheet 的分析揭示了以下数据字段和业务特征，这些都将作为新系统数据库设计的基础。

| 字段 | 说明 | 数据类型 | 备注 |
|---|---|---|---|
| 需求 | 任务的标题或简短描述 | 文本 | 核心字段，必须 |
| 状态 | 任务的当前进展 | 标签/枚举 | 如：待分配, 进行中, 已完成 |
| 提出日期 | 任务创建的日期 | 日期 | |
| 提出人 | 创建任务的用户 | 用户关联 | |
| assignees | 任务的执行者 | 用户关联 (多对多) | 一个任务可分配给多人 |
| PA | 项目助理或协调人 | 用户关联 | |
| ticket/链接 | 关联的外部链接 | URL/文本 | 如：GitHub Issue 链接 |
| 续时长(day) | 任务花费的时间 | 数字 | |
| 完成日期 | 任务标记为完成的日期 | 日期 | |
| 备注 | 补充信息 | 文本 | |

**业务特征:**
- **多角色协作:** 存在提出人、执行人、PA 等多种角色。
- **状态多样性:** 任务状态通过颜色进行区分，暗示了不同状态的业务含义。
- **外部系统集成:** 任务常常需要关联到 GitHub 等外部系统。

## 3. 系统设计与技术架构

### 3.1. 系统架构图

系统采用前后端分离的经典架构，通过 RESTful API 进行通信。数据库独立部署，未来可平滑集成 AI 服务。

```
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│   Web Browser    │      │   Mobile App     │      │   3rd Party      │
│  (React App)     │      │  (Future)        │      │   Integrations   │
└──────────────────┘      └──────────────────┘      └──────────────────┘
         │                        │                        │
         └─────────────┬──────────┴──────────┬─────────────┘
                       │ HTTPS (RESTful API)
                       ▼
┌─────────────────────────────────────────────────────────┐
│                   后端应用 (Node.js)                      │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐ │
│ │ API Gateway│ │ Auth Svc │ │ Task Svc │ │ User Svc  │ │
│ └──────────┘ └──────────┘ └──────────┘ └───────────┘ │
│ ┌────────────────────┐      ┌──────────────────────┐  │
│ │   AI Scheduler     │      │   Notification Svc   │  │
│ │   (Phase 2)        │      │   (Email, Slack)     │  │
│ └────────────────────┘      └──────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              数据库 (PostgreSQL on AWS RDS)              │
│ ┌─────────┐ ┌─────────┐ ┌───────────┐ ┌───────────┐ │
│ │ users   │ │ tasks   │ │ comments  │ │ history   │ │
│ └─────────┘ └─────────┘ └───────────┘ └───────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 3.2. 技术栈选型

| 分层 | 技术 | 理由 |
|---|---|---|
| **前端** | React (with TypeScript), Vite, TailwindCSS, Ant Design | 现代、高效的 UI 开发体验，强大的社区支持和丰富的组件库。 |
| **后端** | Node.js (with TypeScript), Express.js, Drizzle ORM | TypeScript 保证了代码的健壮性，Drizzle ORM 提供了类型安全的数据库操作。 |
| **数据库** | PostgreSQL (AWS RDS) | 功能强大、稳定可靠的关系型数据库，支持 JSONB 和数组等高级类型，适合复杂查询。 |
| **部署** | Vercel (前端), AWS ECS/Lambda (后端), GitHub Actions (CI/CD) | 提供高可用、可扩展的部署方案，并通过 CI/CD 实现自动化。 |
| **AI** | OpenAI API / Claude | 强大的大语言模型能力，可用于实现智能调度和自然语言处理功能。 |

## 4. 数据库设计

数据库设计旨在满足当前需求并为未来扩展提供灵活性。

### 4.1. `users` 表

存储用户信息和角色。

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member', 'pa')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

### 4.2. `tasks` 表

核心表，存储所有任务信息。

```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- 关系字段
  creator_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  pa_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  
  -- 时间字段
  created_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  completed_date DATE,
  estimated_duration_days INTEGER,
  
  -- 扩展字段
  ticket_url TEXT,
  tags TEXT[],
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

### 4.3. `task_assignees` 表

用于处理任务和执行者之间的多对多关系。

```sql
CREATE TABLE task_assignees (
  task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, user_id)
);
```

### 4.4. `task_comments` 表

存储任务下的评论。

```sql
CREATE TABLE task_comments (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

### 4.5. `task_history` 表

记录任务的变更日志。

```sql
CREATE TABLE task_history (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

### 4.6. 索引设计

为常用查询字段创建索引以优化性能。

```sql
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_creator_id ON tasks(creator_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_task_assignees_user_id ON task_assignees(user_id);
CREATE INDEX idx_task_comments_task_id ON task_comments(task_id);
```

## 5. API 设计 (RESTful)

API 设计遵循 RESTful 原则，以资源为中心。

| 模块 | 端点 | HTTP 方法 | 描述 |
|---|---|---|---|
| **认证** | `/api/auth/register` | `POST` | 用户注册 |
| | `/api/auth/login` | `POST` | 用户登录 |
| | `/api/auth/me` | `GET` | 获取当前用户信息 |
| **任务** | `/api/tasks` | `GET` | 获取任务列表 (支持筛选、排序、分页) |
| | `/api/tasks` | `POST` | 创建新任务 |
| | `/api/tasks/:id` | `GET` | 获取单个任务详情 |
| | `/api/tasks/:id` | `PUT` | 更新任务信息 |
| | `/api/tasks/:id` | `DELETE` | 删除任务 |
| | `/api/tasks/:id/comments` | `POST` | 为任务添加评论 |
| **用户** | `/api/users` | `GET` | 获取用户列表 |
| | `/api/users/:id` | `GET` | 获取用户详情 |
| **AI** | `/api/ai/suggest-assignee` | `POST` | (二期) 智能推荐任务执行人 |
| | `/api/ai/parse-task` | `POST` | (二期) 从自然语言创建任务 |

## 6. 前端设计

前端界面应简洁、直观，注重用户体验。

- **主要页面:**
  - **登录/注册页:** 用于用户身份验证。
  - **仪表盘/任务看板:** 核心页面，提供多种任务视图（看板、列表、日历）。
  - **任务详情页:** 展示任务的所有信息，包括描述、评论、历史记录和附件。
  - **用户管理页:** (管理员) 用于管理团队成员及其角色。
  - **统计分析页:** 展示项目和团队的各项数据指标。

- **核心组件:**
  - `TaskCard`: 在看板视图中展示任务的卡片。
  - `TaskForm`: 用于创建和编辑任务的表单。
  - `DataTable`: 用于展示任务列表、用户列表等表格数据。
  - `UserAvatar`: 显示用户头像和名称的组件。
  - `CommentSection`: 任务下的评论区。

## 7. 开发与部署

### 7.1. 开发阶段规划

| 阶段 | 主要内容 | 预计时间 |
|---|---|---|
| **一期：核心功能** | 数据库搭建、后端 CRUD API、用户认证、前端任务看板与列表 | 3-4 周 |
| **二期：协作与增强** | 评论、历史记录、高级筛选、数据统计、通知系统 | 2-3 周 |
| **三期：AI 集成** | 智能分配、时长预估、自然语言任务创建 | 2-3 周 |
| **四期：优化与部署** | 性能测试、安全加固、CI/CD 搭建、生产环境部署 | 1-2 周 |

### 7.2. 数据迁移

从 Google Sheet 迁移至新系统需要一个专门的脚本。步骤如下：
1. **导出:** 使用 Google Sheets API 将表格数据导出为 CSV 或 JSON 文件。
2. **清洗与转换:** 编写脚本，将导出的数据映射到新的数据库表结构。这包括用户名的匹配、状态的标准化等。
3. **导入:** 将处理后的数据批量导入到 PostgreSQL 数据库中。
4. **验证:** 抽样检查导入数据的准确性和完整性。

### 7.3. 部署

- **数据库:** 使用提供的 AWS RDS for PostgreSQL 实例。
- **后端:** 建议使用 Docker 将 Node.js 应用容器化，并部署在 AWS ECS 或 Fargate 上，以实现高可用和弹性伸缩。
- **前端:** 静态 React 应用可以部署在 Vercel、Netlify 或 AWS S3 + CloudFront 上，以获得全球加速和低延迟。
- **CI/CD:** 配置 GitHub Actions，在代码推送到主分支时自动运行测试、构建和部署。

## 8. 非功能性需求

- **安全性:** 所有通信使用 HTTPS，密码必须加盐哈希存储，API 应有速率限制和权限校验，防范 SQL 注入、XSS 和 CSRF 攻击。
- **性能:** API 响应时间应控制在 200ms 以内，前端页面加载时间应小于 3 秒。对数据库慢查询进行优化，并考虑引入缓存（如 Redis）。
- **可维护性:** 代码应遵循统一的编码规范，有清晰的注释和文档。前后端都应有单元测试和集成测试覆盖。
- **监控与日志:** 集成如 Sentry 或 Datadog 等工具进行错误监控和性能追踪。后端服务应记录结构化的日志，便于问题排查。

---
**文档结束**
