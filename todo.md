# 声音克隆网站 - 开发任务列表

## Phase 1: 竞品分析
- [x] ElevenLabs、Murf.ai、Fish Audio、Resemble AI 分析
- [x] 信息架构、流程、UI 对比

## Phase 2: 方案设计
- [x] 方案 A：左侧导航工作台模式
- [x] 方案 B：顶部 Tab 双页模式
- [x] 方案 C：单页垂直分区模式（已选定）
- [x] 评估矩阵比较，确定方案 C

## Phase 3: 原型设计
- [x] Pencil 高保真原型（主页面线框图）
- [x] 截图确认设计方案

## Phase 4: 项目搭建
- [x] 初始化 Next.js 项目（App Router + TypeScript）
- [x] 安装依赖：better-sqlite3, shadcn/ui, lucide-react, react-dropzone
- [x] 配置 Tailwind CSS 深色主题

## Phase 5: 数据库层
- [x] 创建 lib/db.ts（SQLite 初始化 + Schema）
- [x] 建表：voices（声音库）、generations（生成历史）、settings

## Phase 6: Fish Audio API 封装
- [x] 创建 lib/fish-audio.ts（API 请求封装）
- [x] 实现即时克隆 TTS（reference_audio + reference_text）
- [x] 创建 lib/storage.ts（本地文件存储）

## Phase 7: API 路由
- [x] GET/POST /api/voices（声音列表 + 创建）
- [x] DELETE /api/voices/[id]（删除声音）
- [x] POST /api/tts（生成语音）
- [x] GET/PUT /api/settings（API Key 管理）
- [x] GET /api/generations（历史记录）

## Phase 8: 前端组件
- [x] app/page.tsx（主页面，单页垂直分区）
- [x] components/voice-library.tsx（声音库）
- [x] components/clone-panel.tsx（克隆上传面板）
- [x] components/tts-workspace.tsx（TTS 工作区）
- [x] components/audio-player.tsx（音频播放器）
- [x] components/settings-modal.tsx（设置弹窗）

## Phase 9: 联调测试
- [ ] 启动开发服务器：cd voice-clone-app && npm run dev
- [ ] 配置 Fish Audio API Key（Settings 按钮）
- [ ] 上传音频 → 创建声音 → 状态 ready
- [ ] 选择声音 → 输入文本 → 生成 → 播放 → 下载
- [ ] 历史记录可见
