# 🎵 Self Music - 私人音乐系统

- 预览地址：https://music.icodeq.com

![屏幕截图(616)](https://img.onmicrosoft.cn/zkeq/20250817125324565.png)

![屏幕截图(617)](https://img.onmicrosoft.cn/zkeq/20250817125724096.png)

![屏幕截图(618)](https://img.onmicrosoft.cn/zkeq/20250817125723943.png)

![屏幕截图(619)](https://img.onmicrosoft.cn/zkeq/20250817125723887.png)

![屏幕截图(621)](https://img.onmicrosoft.cn/zkeq/20250817125729741.png)

![屏幕截图(620)](https://img.onmicrosoft.cn/zkeq/20250817125727225.png)

![屏幕截图(624)](https://img.onmicrosoft.cn/zkeq/20250817125723840.png)

![屏幕截图(623)](https://img.onmicrosoft.cn/zkeq/20250817125723806.png)


<div align="center">

**🌟 一个现代化的私人音乐管理与播放系统，支持播放列表、歌词同步与多端访问。（支持一键导入网易云音乐元数据，批量搜刮的私人音乐客户端）**

[🚀 快速开始](#-快速开始) •
[✨ 功能特性](#-功能特性) •
[🛠️ 技术栈](#️-技术栈) •
[🤝 贡献](#-贡献)

</div>

---

## 📖 项目简介

Self Music 是一个面向个人与小团队的音乐管理与播放系统。提供优雅的 UI 与流畅的播放体验，支持播放列表管理、歌词同步、艺术家/专辑数据浏览，并内置后台管理（JWT 认证），开箱即用。

### 🎯 核心亮点

- 🎨 现代化设计：基于 shadcn/ui + Tailwind CSS 4 的精美界面
- 📱 响应式布局：桌面与移动端无缝适配
- 🔐 安全认证：基于 JWT 的后台管理登录
- 🎧 播放体验：HTML5 音频 + 歌词(LRC)解析与同步滚动
- 🎛️ 播放控制：进度、音量、随机、循环、上一首/下一首
- 🌓 主题切换：内置暗黑模式（next-themes）

---

## ✨ 功能特性

### 🎛 播放与体验
- 🎵 播放列表：支持播放队列、从列表播放、跳转到指定歌曲
- 📝 歌词支持：LRC/纯文本解析，支持全屏歌词与滚动高亮
- 🔁 播放模式：随机/列表循环/单曲循环
- 💾 本地记忆：播放列表与状态持久化（localStorage）

### 🎭 浏览与分类
- 👤 艺术家：列表与详情、该艺术家歌曲/专辑
- 💿 专辑：列表与详情、专辑下歌曲
- 📂 播放列表：公共播放列表浏览与播放
- 😊 情绪/氛围：按 mood 分类展示与筛选（后端支持）

### 🛠 管理后台（/admin）
- ✅ 艺术家/专辑/歌曲/情绪(mood)/播放列表：完整 CRUD
- 🔃 播放列表重排：支持自定义顺序（保持顺序返回）
- ⬆️ 文件上传：音频文件上传并落盘（`/uploads`）
- 📦 批量导入：按歌曲/专辑/艺人信息批量写入（含歌词与音频 URL）
- 👤 默认管理员：`admin / admin123`

### 🔐 安全特性
- 🛡️ JWT 认证：Bearer Token 鉴权的管理接口
- 🌐 CORS 设置：默认允许所有来源

---

## 🛠️ 技术栈

### 后端
- 🐍 FastAPI `^0.104`：现代、高性能 API 框架
- 🚀 Uvicorn `^0.24`：ASGI 服务器
- 💾 SQLite：轻量级持久化存储（`backend/music.db`）
- 🔐 PyJWT + HTTP Bearer：认证与鉴权
- 🎼 Mutagen：音频元数据解析（用于时长等）
- 📦 python-multipart：文件上传

### 前端
- ⚛️ Next.js `15.4.x` + React `19`
- 📘 TypeScript `^5`
- 🎨 Tailwind CSS `4`
- 🧩 shadcn/ui + Radix UI
- 🗃 Zustand（状态管理）
- 🌗 next-themes（主题切换）
- 🎬 framer-motion（动效）

---

## 🚀 快速开始

### 📋 环境要求
- 🐍 Python 3.8+
- 📦 Node.js 18+
- 🔧 包管理器：推荐 pnpm（或 npm）

### 1) 克隆项目
```bash
git clone https://github.com/zkeq/Self-music.git
cd Self-music
```

### 2) 启动后端（FastAPI）
```bash
cd backend
pip install -r requirements.txt
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```
- 后端地址：`http://localhost:8000`
- 文档地址：`http://localhost:8000/docs`
- 默认管理员：`admin / admin123`

> 生产环境请通过环境变量或安全配置提供 `SECRET_KEY`，并收敛 CORS 到可信来源。

### 3) 启动前端（Next.js）
```bash
cd ../frontend
pnpm install   # 或 npm install
# 配置环境变量（可选，默认：http://localhost:8000/api）
# echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local
pnpm dev       # 或 npm run dev
```
- 前端地址：`http://localhost:3000`

### 4) 主要页面
- 🏠 首页：`/`
- 🎧 播放页：`/play` 与 `/play/[id]`
- 🎵 歌曲列表：`/songs`
- 👤 艺术家：`/artists` 与 `/artist/[id]`
- 💿 专辑：`/albums`（如有启用）
- 📂 播放列表：`/playlists` 与 `/playlist/[id]`
- 🔐 管理后台登录：`/admin/login`

---

## 📁 项目结构

```
Self-Music/
├── backend/                 # FastAPI + SQLite
│   ├── main.py              # API 入口（含后台路由）
│   ├── user.py              # 面向用户的公开接口
│   ├── music.db             # SQLite 数据库
│   └── requirements.txt     # Python 依赖
├── frontend/                # Next.js + TypeScript + Tailwind CSS 4
│   ├── src/
│   │   ├── app/             # 应用路由（/play、/artists、/admin 等）
│   │   ├── components/      # UI 组件、播放器、歌词、面板
│   │   ├── lib/             # API 客户端、store、工具
│   │   └── styles/          # 全局样式与主题
│   └── package.json         # 前端依赖与脚本
├── AGENTS.md                # 仓库贡献与开发规范（中文）
├── README.md                # 中文说明（本文件）
└── README.en.md             # English README
```

---

## 📚 API 概览（节选）

- 公共接口（无需登录）
  - `GET /api/songs`：分页获取歌曲
  - `GET /api/songs/{id}`：歌曲详情
  - `GET /api/songs/{id}/stream`：音频流
  - `GET /api/artists`、`/api/artists/{id}`、`/api/artists/{id}/songs`、`/api/artists/{id}/albums`
  - `GET /api/albums`、`/api/albums/{id}`、`/api/albums/{id}/songs`
  - `GET /api/playlists`、`/api/playlists/{id}`

- 管理接口（需 Bearer Token）
  - `POST /api/auth/login`：管理员登录
  - `GET/POST/PUT/DELETE /api/admin/{artists|albums|songs|moods|playlists}`
  - `PUT /api/admin/playlists/{id}/reorder`：播放列表重排
  - `POST /api/admin/upload`：上传音频文件
  - `POST /api/admin/import/*`：批量导入与查重

> 详见运行后端后的 Swagger 文档：`/docs`

---

## 🐛 故障排除

- 后端无法启动
  - 确认 Python 版本与依赖安装无误
  - 检查端口 `8000` 是否被占用
- 音频无法播放
  - 数据库 `songs.audioUrl` 是否为有效本地路径
  - 目标文件存在且后端有读权限
- CORS 问题
  - 开发默认放开；生产需将允许来源限制到前端域名
- 样式异常
  - 删除 `node_modules` 后重装依赖，或检查 Tailwind 配置

---

## 🚀 部署建议

- 后端
  - 使用 `uvicorn`/`gunicorn` + 反向代理（Nginx/Caddy）
  - 配置 `SECRET_KEY`、收敛 CORS、持久化 `music.db` 与 `uploads/`
- 前端
  - 任何静态服务或 Vercel 等平台
  - 设置环境变量 `NEXT_PUBLIC_API_URL` 指向后端 API（如 `https://api.example.com/api`）

---

## 🤝 贡献

- 提交前确保：构建通过、`pnpm lint` 通过、API 本地可运行
- 遵循本仓库约定（见 `AGENTS.md`）
- 欢迎：Bug 报告、功能提议、文档改进、国际化支持

---

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源协议。

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请为它点一颗星！⭐**

Made with ❤️ for music lovers.

</div>
