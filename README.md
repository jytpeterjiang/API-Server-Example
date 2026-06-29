# CodeBuddy + MCP 构建简单的后端API

基于 **Next.js 15** + **Prisma ORM** + **SQLite** 构建的 RESTful API 服务端项目，提供用户管理、商品订单管理及分类报表等功能。

## 技术栈

| 类别       | 技术                                                    |
| ---------- | ------------------------------------------------------- |
| 框架       | Next.js 15 (App Router)                                 |
| 语言       | TypeScript                                              |
| ORM        | Prisma 6                                                |
| 数据库     | SQLite                                                  |
| 样式       | Tailwind CSS 4                                          |

## 功能概览

### API 端点

| 方法     | 路径                     | 说明                 |
| -------- | ------------------------ | -------------------- |
| `GET`    | `/api/users`             | 用户列表（分页+搜索）|
| `POST`   | `/api/users`             | 创建用户             |
| `GET`    | `/api/users/[id]`        | 用户详情             |
| `PUT`    | `/api/users/[id]`        | 更新用户             |
| `DELETE` | `/api/users/[id]`        | 删除用户（含订单校验）|
| `GET`    | `/api/reports/category`  | 分类聚合报表         |

### 数据模型

- **User** — 用户（姓名、邮箱、角色）
- **Product** — 商品（名称、单价、分类、库存）
- **Order** — 订单（关联用户、总金额、状态）
- **OrderItem** — 订单明细（关联订单与商品、数量、成交价）

## 安装与启动

### 前置要求

- Node.js >= 18
- npm（随 Node.js 一并安装）

### 1. 安装依赖

```bash
npm install
```

安装完成后会自动执行 `prisma generate`，生成 Prisma Client。

### 2. 配置环境变量

项目根目录下的 `.env` 文件包含了数据库连接配置：

```
DATABASE_URL="file:../data/app.db"
```

如果文件不存在，请手动创建 `.env` 并写入以上内容。

### 3. 生成 Prisma Client（如果安装时未自动执行）

```bash
npm run prisma:generate
```

### 4. 启动开发服务器

```bash
npm run dev
```

启动后访问 [http://localhost:3000](http://localhost:3000) 即可看到主页。

### 5. 其他命令

```bash
# 生产构建
npm run build

# 生产启动
npm run start

# 代码检查
npm run lint

# 启动 Prisma Studio（数据库可视化工具）
npm run prisma:studio
```

## API 使用示例

### 获取用户列表（分页）

```bash
curl "http://localhost:3000/api/users?page=1&pageSize=10"
```

### 搜索用户

```bash
curl "http://localhost:3000/api/users?search=张三"
```

### 创建用户

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "李四", "email": "lisi@example.com", "role": "user"}'
```

### 获取分类报表

```bash
curl "http://localhost:3000/api/reports/category"
```

## 项目结构

```
MCP/
├── prisma/
│   └── schema.prisma        # 数据库模型定义
├── data/
│   └── app.db               # SQLite 数据库文件
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── users/
│   │   │   │   ├── route.ts            # GET/POST /api/users
│   │   │   │   └── [id]/route.ts       # GET/PUT/DELETE /api/users/:id
│   │   │   └── reports/
│   │   │       └── category/route.ts   # GET /api/reports/category
│   │   ├── globals.css                 # 全局样式
│   │   ├── layout.tsx                  # 根布局
│   │   └── page.tsx                    # 首页
│   └── lib/
│       ├── prisma.ts                   # Prisma 客户端单例
│       └── api-response.ts             # 统一响应格式工具
├── .env                               # 环境变量
├── .gitignore
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```
