# 仓库指南

## 项目结构与模块组织
- 根目录：`frontend/`（Next.js + TypeScript + Tailwind CSS 4），`backend/`（FastAPI + SQLite）。
- 前端：
  - 应用路由：`frontend/src/app/*`
  - UI：`frontend/src/components/*`，工具：`frontend/src/lib/*`，样式：`frontend/src/app/globals.css` 与 `frontend/src/styles/*`，资源：`frontend/public/*`。
- 后端：
  - API 入口：`backend/main.py`，认证/用户路由：`backend/user.py`，数据库：`backend/music.db`，依赖：`backend/requirements.txt`。

## 构建、测试与开发命令
- 前端（推荐 pnpm）：
  - `pnpm dev`（或 `npm run dev`）：启动 Next.js 开发服务器。
  - `pnpm build`（或 `npm run build`）：生产构建。
  - `pnpm lint`（或 `npm run lint`）：运行 ESLint。
- 后端（Python）：
  - 安装依赖：`pip install -r backend/requirements.txt`。
  - 运行 API（开发）：`uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000`。

## 编码风格与命名约定
- TypeScript + React 函数组件；优先使用 hooks 与组合。
- 文件名：kebab-case（例如 `lyrics-display.tsx`、`player-layout.tsx`）。
- 缩进：2 个空格；保持 import 顺序合理。
- Tailwind：utility-first；通过 `frontend/src/lib/utils` 中的 `cn` 实现条件类名。
- Lint：ESLint（Next.js 配置）。提交前运行 `pnpm lint`。
- Python：使用 Pydantic 模型定义 schema；将端点拆分为小而专注的路由。

## 测试指南
- 暂无正式单元测试套件。通过以下方式验证变更：
  - 前端：本地运行，验证关键流程（播放页、歌词、播放列表），并检查控制台错误。
  - 后端：使用 `curl`/REST 客户端调用接口；确认 SQLite 持久化有效。
- 如引入复杂逻辑，请补充测试（TS 与代码同目录或放在 `__tests__`；Python 可添加 pytest）。

## 提交与 Pull Request 指南
- 提交：简洁祈使句主题；必要时包含作用域（例如 `frontend: clamp lyrics on mobile`）。
- PR：包含描述、动机、截图或终端输出与测试步骤，并关联相关 issue。
- 确保：构建通过、`pnpm lint` 通过，且 API 能在本地运行。

## 安全与配置提示
- 不要提交任何密钥。生产环境下后端 `SECRET_KEY` 必须通过环境变量提供。
- 验证上传并清理用户输入。生产环境将 CORS 限制为受信任的来源。
