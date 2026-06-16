# 校园管理系统

一个基于 Vue 3 + TypeScript 的校园管理系统前端项目，提供用户管理、班级管理、课程管理等功能。

## 项目简介

本项目是一个校园管理系统的前端实现，采用现代化的技术栈和设计理念，为学校提供便捷的信息管理解决方案。

## 功能模块

### 核心功能

- **用户管理**：支持学生学号、班级字段，角色筛选，分页展示，删除二次确认
- **班级管理**：动态统计学生人数，课程绑定功能
- **课程管理**：课程增删改查，筛选搜索
- **首页仪表盘**：统计卡片展示，数据可视化
- **登录页面**：图形验证码支持，表单验证

### 其他功能

- 学生管理
- 管理员管理
- 成绩管理
- 成绩查询
- 教室管理
- 教室预约
- 评价管理
- 我的课程
- 学生评价

## 技术栈

### 前端技术

- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - JavaScript 的超集，提供类型安全
- **Element Plus** - Vue 3 组件库
- **Vite** - 下一代前端构建工具
- **Pinia** - Vue 状态管理库
- **Vue Router** - Vue.js 官方路由
- **Axios** - HTTP 请求库
- **ECharts** - 数据可视化图表库

### 后端技术

- **Node.js** - JavaScript 运行环境
- **Express** - Node.js Web 框架
- **MySQL** - 关系型数据库

## 项目结构

```
superAdmin/
├── pure-admin-thin/          # 前端项目
│   ├── src/
│   │   ├── api/              # API 接口
│   │   ├── components/       # 公共组件
│   │   ├── hooks/            # 组合式函数
│   │   ├── layout/           # 布局组件
│   │   ├── router/           # 路由配置
│   │   ├── store/            # 状态管理
│   │   ├── style/            # 样式文件
│   │   ├── utils/            # 工具函数
│   │   └── views/            # 页面组件
│   │       ├── welcome/      # 首页仪表盘
│   │       ├── userManagement/    # 用户管理
│   │       ├── classManagement/   # 班级管理
│   │       ├── courseManagement/  # 课程管理
│   │       ├── login/        # 登录页面
│   │       └── ...           # 其他页面
│   ├── public/               # 静态资源
│   └── package.json          # 项目配置
│
├── pure-admin-backend/       # 后端项目
│   ├── src/
│   │   ├── router/           # 路由处理
│   │   ├── server.ts         # 服务入口
│   │   └── ...
│   └── package.json          # 项目配置
│
├── database_update.sql       # 数据库更新脚本
├── start.bat                 # 启动脚本
└── README.md                 # 项目说明文档
```

## 安装与运行

### 前端项目

```bash
# 进入前端目录
cd pure-admin-thin

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build
```

### 后端项目

```bash
# 进入后端目录
cd pure-admin-backend

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

### 数据库配置

1. 创建 MySQL 数据库
2. 执行 `database_update.sql` 脚本初始化数据表

```bash
mysql -u root -p < database_update.sql
```

## 数据库配置信息

- **数据库地址**: 127.0.0.1:3306
- **用户名**: cs13
- **密码**: cs13
- **数据库名**: cs13

## 用户角色

系统支持两种用户角色：

| 角色 | 标识 | 权限 |
|------|------|------|
| 管理员 | admin | 所有功能 |
| 学生 | students | 部分功能 |

## 功能截图

### 首页仪表盘
- 统计卡片展示学生总数、班级总数、课程总数
- 课程进度图表
- 系统公告
- 最近活动

### 用户管理
- 用户列表展示
- 学号、班级字段支持
- 角色筛选
- 分页功能
- 删除二次确认

### 班级管理
- 班级列表展示
- 动态统计学生人数
- 课程绑定功能

### 课程管理
- 课程列表展示
- 增删改查功能
- 筛选搜索

## 开发规范

- 使用 TypeScript 进行类型检查
- 遵循 Vue 3 Composition API 规范
- 使用 Element Plus 组件库
- 代码注释使用中文

## 许可证

MIT License

## 作者

Vxiaolong666

## 贡献指南

欢迎提交 Issue 和 Pull Request 来改进项目。

## 更新日志

### v1.0.0 (2026-05-27)

- 初始化项目
- 实现用户管理功能
- 实现班级管理功能
- 实现课程管理功能
- 实现首页仪表盘
- 实现登录页面
- 添加图形验证码支持
- 实现权限管理
- 数据库结构设计