# 声音克隆网站 - 开发任务列表

## Phase 1: 竞品分析
- ✅ ElevenLabs、Murf.ai、Fish Audio、Resemble AI 分析
- ✅ 信息架构、流程、UI 对比

## Phase 2: 方案设计
- ✅ 方案 A：左侧导航工作台模式
- ✅ 方案 B：顶部 Tab 双页模式
- ✅ 方案 C：单页垂直分区模式（已选定）
- ✅ 评估矩阵比较，确定方案 C

## Phase 3: 原型设计
- ✅ Pencil 高保真原型（主页面线框图）
- ✅ 截图确认设计方案

## Phase 4: 项目搭建
- ✅ 初始化 Next.js 项目（App Router + TypeScript）
- ✅ 安装依赖：better-sqlite3, shadcn/ui, lucide-react, react-dropzone
- ✅ 配置 Tailwind CSS 深色主题

## Phase 5: 数据库层
- ✅ 创建 lib/db.ts（SQLite 初始化 + Schema）
- ✅ 建表：voices（声音库）、generations（生成历史）、settings

## Phase 6: Fish Audio API 封装
- ✅ 创建 lib/fish-audio.ts（API 请求封装）
- ✅ 实现即时克隆 TTS（reference_audio + reference_text）
- ✅ 创建 lib/storage.ts（本地文件存储）

## Phase 7: API 路由
- ✅ GET/POST /api/voices（声音列表 + 创建）
- ✅ DELETE /api/voices/[id]（删除声音）
- ✅ POST /api/tts（生成语音）
- ✅ GET/PUT /api/settings（API Key 管理）
- ✅ GET /api/generations（历史记录）

## Phase 8: 前端组件
- ✅ app/page.tsx（主页面，单页垂直分区）
- ✅ components/voice-library.tsx（声音库）
- ✅ components/clone-panel.tsx（克隆上传面板）
- ✅ components/tts-workspace.tsx（TTS 工作区）
- ✅ components/audio-player.tsx（音频播放器）
- ✅ components/settings-modal.tsx（设置弹窗）

## Phase 10: Pencil 按钮组件系统搭建
- ✅ 创建设计变量（Design Tokens）：颜色、字体、间距
- ✅ 搭建 Button/Primary 可复用组件（默认/悬浮/按下/禁用）
- ✅ 搭建 Button/Secondary 可复用组件（4种状态）
- ✅ 搭建 Button/Outlined 可复用组件（4种状态）
- ✅ 搭建 Button/Text 可复用组件（4种状态）
- ✅ 搭建 Button/Danger 可复用组件（4种状态）
- ✅ 创建组件展示页（变体矩阵 + 按钮组合）
- ✅ 创建设计指南文档页（分类/行为/类型/状态/尺寸/规则）
- ✅ 创建场景与案例页（推荐用法/错误用法/表单/弹窗/危险操作）

## Phase 9: 联调测试
- ✅ 启动开发服务器：cd voice-clone-app && npm run dev
- [ ] 配置 Fish Audio API Key（Settings 按钮）
- [ ] 上传音频 → 创建声音 → 状态 ready
- [ ] 选择声音 → 输入文本 → 生成 → 播放 → 下载
- [ ] 历史记录可见

## Phase 11: UI 间距与交互微调
- ✅ 修复 Card 组件 py-6/gap-6 与 CardContent padding 叠加导致的过大间距
- ✅ Settings 弹窗：点击遮罩关闭 + 入场动画 + 间距优化
- ✅ AudioPlayer 波形图：useMemo 固定条形高度，消除 Math.random() 重渲染抖动
- ✅ Voice Library：卡片网格 gap-4、点击 active:scale 反馈、Badge 尺寸精调
- ✅ TTS Workspace：情感标签 px-3 py-1.5 增大点击区域、gap 统一
- ✅ Clone Panel：拖拽区域 hover/drag 反馈、按钮间距 gap-3
- ✅ 全局按钮添加 active:scale 点击缩放反馈
- ✅ 主页面 section 间距 space-y-8、顶部 py-6 优化
