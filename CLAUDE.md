# Self-Music 音乐流媒体平台

注意：网站设计时完全按照ShadeCN/UI的设计风格来是实现。在此基础上增加的动效效果

## 项目概述

Self-Music 是一个现代化的音乐流媒体网站，专注于提供优美的播放体验。项目以播放页面为核心，具备实时歌词同步显示、毛玻璃效果、心情标签分类和歌单功能。

## 技术栈

### 后端 (FastAPI - 扁平化架构)
- **框架**: FastAPI (Python 3.11+)
- **数据库**: SQLite + 原生SQL
- **音频处理**: mutagen (metadata extraction)
- **文件服务**: 静态文件服务 + 流媒体支持

### 前端 (Next.js)
- **框架**: Next.js 15 + TypeScript
- **UI库**: ShadCN/UI + Tailwind CSS
- **动画**: Framer Motion
- **音频播放**: HTML5 Audio API
- **状态管理**: Zustand
- **玻璃态效果**: backdrop-filter CSS

## 核心功能

1. **音乐播放器** - 核心播放界面，支持播放控制、进度条、音量调节
2. **歌词同步** - LRC格式歌词解析，实时滚动显示
3. **毛玻璃效果** - 基于歌曲封面色彩的动态玻璃态背景
4. **心情标签** - 多维度音乐分类，根据心情播放不同歌曲
5. **歌单管理** - 支持创建、编辑歌单，歌曲可重复添加
6. **文件上传** - 支持音频文件上传和元数据提取

## 项目结构

```
self-music/
├── backend/                 # FastAPI后端 (扁平化)
│   ├── main.py             # 主应用文件，包含所有路由和模型
│   └── requirements.txt    # Python依赖
├── frontend/               # Next.js前端
│   ├── src/
│   │   ├── app/            # App Router页面
│   │   ├── components/     # React组件
│   │   ├── lib/            # 工具函数和hooks
│   │   └── types/          # TypeScript类型定义
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── uploads/                # 音频文件存储
├── static/                 # 静态资源 (封面图片等)
└── README.md
```

## API接口设计

### 歌曲管理
- `GET /api/songs` - 获取歌曲列表
- `POST /api/songs/upload` - 上传音频文件
- `GET /api/songs/{id}/stream` - 流式播放音频
- `GET /api/songs/{id}` - 获取歌曲详情

### 歌单管理
- `GET /api/playlists` - 获取歌单列表
- `POST /api/playlists` - 创建新歌单
- `PUT /api/playlists/{id}` - 更新歌单
- `DELETE /api/playlists/{id}` - 删除歌单

### 心情标签
- `GET /api/moods` - 获取心情标签列表
- `GET /api/moods/{mood}/songs` - 获取特定心情下的歌曲

### 歌词服务
- `GET /api/lyrics/{song_id}` - 获取歌曲歌词

## 开发指南

### 后端开发

1. **安装依赖**:
```bash
cd backend
pip install -r requirements.txt
```

2. **启动开发服务器**:
```bash
python main.py
```

3. **API文档**: 访问 http://localhost:8000/docs

### 前端开发

1. **安装依赖**:
```bash
cd frontend
npm install
```

2. **启动开发服务器**:
```bash
npm run dev
```

3. **构建生产版本**:
```bash
npm run build
```

4. **类型检查**:
```bash
npm run type-check
```

## 特性实现

### 玻璃态效果实现
使用CSS的 `backdrop-filter: blur()` 和 `background: rgba()` 实现毛玻璃效果，结合歌曲封面的主色调动态调整背景色彩。

### 歌词同步
- 支持LRC格式歌词文件
- 实时解析时间轴信息
- 滚动显示当前播放歌词
- 高亮显示当前行

### 心情标签系统
- 预定义心情标签（快乐、放松、专注等）
- 歌曲可关联多个心情标签
- 根据心情筛选播放歌曲

### 响应式设计
- 支持桌面端和移动端
- 自适应布局
- 触摸友好的交互设计

## 部署说明

### 后端部署
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 前端部署
```bash
cd frontend
npm run build
npm start
```

## 项目特色

1. **以播放为中心** - 进入网站即显示播放界面，而非传统的专辑展示页
2. **视觉体验优先** - 毛玻璃效果、动画过渡、色彩搭配
3. **情感化交互** - 通过心情标签连接音乐与情感
4. **现代化技术栈** - 使用最新的Web技术构建
