# Fish Audio API 文档

> 来源：Context7 + 官方文档 (https://docs.fish.audio)
> 整理日期：2026-02-27

---

## 目录

1. [平台概述](#平台概述)
2. [认证方式](#认证方式)
3. [API 基础信息](#api-基础信息)
4. [文本转语音 (TTS)](#文本转语音-tts)
5. [语音克隆](#语音克隆)
6. [语音转文本 (STT/ASR)](#语音转文本-sttatr)
7. [模型管理](#模型管理)
8. [情感控制](#情感控制)
9. [实时流式传输 (WebSocket)](#实时流式传输-websocket)
10. [Python SDK](#python-sdk)
11. [JavaScript SDK](#javascript-sdk)
12. [自托管部署](#自托管部署)

---

## 平台概述

Fish Audio 是一个专注于语音生成的 AI 平台，核心功能包括：

- **文本转语音 (TTS)**：支持 30+ 种语言，超低延迟流式输出
- **语音克隆**：仅需 15 秒音频样本即可克隆声音
- **语音转文本 (STT/ASR)**：将音频转录为文字
- **情感与韵律控制**：为 AI 语音添加自然情感表达
- **多角色叙事**：支持多角色音频故事创作

**应用场景**：播客自动化、游戏 NPC、教育工具、客服 IVR、无障碍访问、娱乐内容创作

---

## 认证方式

所有 API 请求均需在 Header 中携带 Bearer Token：

```bash
Authorization: Bearer YOUR_API_KEY
```

**获取 API Key**：登录 [fish.audio](https://fish.audio) 后在开发者面板中创建。

---

## API 基础信息

| 项目 | 值 |
|------|-----|
| Base URL | `https://api.fish.audio` |
| 协议 | HTTPS / WebSocket |
| 响应格式 | JSON / 二进制音频流 |
| SDK 支持 | Python、JavaScript/Node.js |

---

## 文本转语音 (TTS)

### 端点

```
POST /v1/tts
```

### 请求头

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `Authorization` | string | 是 | `Bearer YOUR_API_KEY` |
| `Content-Type` | string | 是 | `application/json` |
| `model` | string | 否 | 指定模型，如 `s1`（默认为最新模型） |

### 请求体

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `text` | string | 是 | 要转换为语音的文本 |
| `format` | string | 否 | 音频格式：`mp3`、`wav`（默认 `mp3`） |
| `reference_id` | string | 否 | 已保存声音模型的 ID |
| `reference_audio` | string | 否 | Base64 编码的参考音频（用于声音克隆） |
| `reference_text` | string | 否 | 参考音频的文字转录（配合 `reference_audio` 使用） |

### 可用模型

| 模型 ID | 说明 |
|---------|------|
| `s1` | 最新模型（默认），支持完整情感控制 |
| `speech-1.6` | 上一代，稳定生产可用，支持基础情感 |
| `speech-1.5` | 早期版本，资源占用低 |

### 示例：cURL 基础请求

```bash
export FISH_API_KEY="your_api_key_here"

curl -X POST https://api.fish.audio/v1/tts \
  -H "Authorization: Bearer $FISH_API_KEY" \
  -H "Content-Type: application/json" \
  -H "model: s1" \
  -d '{
    "text": "Hello! Welcome to Fish Audio. This is my first AI-generated voice.",
    "format": "mp3"
  }' \
  --output welcome.mp3

# macOS 播放
afplay welcome.mp3
```

### 响应

- **成功 (200)**：返回二进制音频流（非 JSON）
- 直接写入文件即可使用

---

## 语音克隆

可通过以下两种方式使用克隆声音：

### 方式一：使用已保存的模型 ID（推荐）

```bash
curl -X POST https://api.fish.audio/v1/tts \
  -H "Authorization: Bearer $FISH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, this is my cloned voice.",
    "reference_id": "your_model_id_here",
    "format": "mp3"
  }' \
  --output output.mp3
```

### 方式二：直接上传参考音频（即时克隆）

```bash
curl -X POST https://api.fish.audio/v1/tts \
  -H "Authorization: Bearer $FISH_API_KEY" \
  -H "Content-Type: application/json" \
  -H "model: s1" \
  -d '{
    "text": "This is a test of voice cloning technology.",
    "reference_audio": "BASE64_ENCODED_AUDIO_DATA",
    "reference_text": "参考音频的文字内容",
    "format": "mp3"
  }' \
  --output cloned_voice.mp3
```

**说明**：
- `reference_audio`：参考音频的 Base64 编码字符串
- `reference_text`：参考音频的准确文字转录（影响克隆质量）
- 仅需 15 秒音频样本即可完成克隆

---

## 语音转文本 (STT/ASR)

Fish Audio 提供语音转文本功能，可将音频文件转录为文字。

### 端点

```
POST /v1/asr
```

### 请求

上传音频文件进行转录（multipart/form-data）。

### Python SDK 示例

```python
from fish_audio_sdk import Session, ASRRequest

session = Session("your_api_key")

with open("audio.mp3", "rb") as f:
    result = session.asr(ASRRequest(audio=f.read()))
    print(result.text)
```

---

## 模型管理

### 获取模型列表

```python
# 同步
models = session.list_models()
print(models)

# 异步
import asyncio

async def main():
    models = await session.list_models.awaitable()
    print(models)

asyncio.run(main())
```

### 获取特定模型信息

```python
model = session.get_model("your_model_id")
print(model)
```

---

## 情感控制

通过在文本中嵌入情感标签来控制语音的情感表达：

### 支持的情感标签

```
(happy)      快乐
(sad)        悲伤
(excited)    兴奋
(laughing)   笑声
(uncertain)  不确定
(hopeful)    希望
(determined) 坚定
(friendly)   友好
(empathetic) 同理心
(confident)  自信
(grateful)   感激
```

### 使用示例

```python
text = """
(excited) This is amazing!
(laughing) Ha ha ha!
(sad) But then things changed.
(hopeful) I believe it will get better.
"""
```

### cURL 示例（情感控制）

```bash
curl -X POST https://api.fish.audio/v1/tts \
  -H "Authorization: Bearer $FISH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "(happy) What a beautiful day! (excited) I cannot believe this!",
    "format": "mp3"
  }' \
  --output emotional_speech.mp3
```

---

## 实时流式传输 (WebSocket)

支持 WebSocket 连接进行实时流式 TTS，适用于低延迟应用场景。

### Python 异步流式 TTS

```python
from fish_audio import FishAudioClient
import asyncio

async def stream_tts(text: str, voice_id: str):
    """实时流式 TTS"""
    client = FishAudioClient(api_key="your-api-key")

    async for chunk in client.tts.stream(
        text=text,
        model_id=voice_id,
        chunk_size=1024
    ):
        # 处理音频片段（如实时播放）
        yield chunk

# 使用示例
async def main():
    async for audio_chunk in stream_tts("Hello, world!", "your_voice_id"):
        # 写入文件或播放
        pass

asyncio.run(main())
```

**WebSocket 功能特性**：
- 实时流式传输
- 自动重连机制
- 缓冲区管理
- 错误恢复

---

## Python SDK

### 安装

```bash
pip install fish-audio-sdk
```

### 基础使用

```python
from fish_audio_sdk import Session, TTSRequest

# 初始化（可选：指定自定义 Base URL）
session = Session("your_api_key")
# session = Session("your_api_key", base_url="https://your-proxy-domain")

# TTS - 基础用法
with open("output.mp3", "wb") as f:
    for chunk in session.tts(TTSRequest(text="Hello, world!")):
        f.write(chunk)
```

### 使用模型 ID（已保存的声音）

```python
from fish_audio_sdk import Session, TTSRequest

session = Session("your_api_key")

with open("output.mp3", "wb") as f:
    for chunk in session.tts(TTSRequest(
        text="Hello, world!",
        reference_id="your_model_id",
    )):
        f.write(chunk)
```

### 使用参考音频（即时克隆）

```python
from fish_audio_sdk import Session, TTSRequest, ReferenceAudio

session = Session("your_api_key")

with open("reference.mp3", "rb") as audio_file:
    request = TTSRequest(
        text="Hello, world!",
        references=[
            ReferenceAudio(
                audio=audio_file.read(),
                text="参考音频的文字内容",
            )
        ],
    )

with open("output.mp3", "wb") as f:
    for chunk in session.tts(request):
        f.write(chunk)
```

### 指定不同模型

```python
from fish_audio_sdk import Session, TTSRequest

session = Session("your_api_key")

# 使用最新 S1 模型（默认）
response = session.tts(TTSRequest(
    text="Using the latest S1 model.",
    model="s1"
))

# 使用 speech-1.6（上一代稳定版）
response = session.tts(TTSRequest(
    text="Using legacy 1.6 model.",
    model="speech-1.6"
))

# 使用 speech-1.5（早期版本）
response = session.tts(TTSRequest(
    text="Using legacy 1.5 model.",
    model="speech-1.5"
))
```

### 异步用法

```python
import asyncio
from fish_audio_sdk import Session, TTSRequest

session = Session("your_api_key")

async def main():
    # 异步 TTS
    async with session.tts.as_async(TTSRequest(text="Hello!")) as stream:
        with open("output.mp3", "wb") as f:
            async for chunk in stream:
                f.write(chunk)

    # 异步获取模型列表
    models = await session.list_models.awaitable()
    print(models)

asyncio.run(main())
```

---

## JavaScript SDK

Fish Audio 同样提供 JavaScript/Node.js SDK，支持：

- 认证管理
- 文本转语音
- 语音克隆
- WebSocket 实时流式传输

（详细 JS SDK 文档请参考 [官方文档](https://docs.fish.audio)）

---

## 自托管部署

Fish Audio 支持本地/私有化部署（基于 Fish Speech 开源模型）。

### 使用 Python 启动

```bash
python -m tools.api_server \
    --listen 0.0.0.0:8080 \
    --llama-checkpoint-path "checkpoints/openaudio-s1-mini" \
    --decoder-checkpoint-path "checkpoints/openaudio-s1-mini/codec.pth" \
    --decoder-config-name modded_dac_vq
```

### 使用 Docker 启动（CUDA）

```bash
docker run -d \
    --name fish-speech-server \
    --gpus all \
    -p 8080:8080 \
    -v ./checkpoints:/app/checkpoints \
    -v ./references:/app/references \
    -e COMPILE=1 \
    fishaudio/fish-speech:latest-server-cuda
```

### 使用 Docker 启动（CPU Only）

```bash
docker run -d \
    --name fish-speech-server-cpu \
    -p 8080:8080 \
    -v ./checkpoints:/app/checkpoints \
    -v ./references:/app/references \
    fishaudio/fish-speech:latest-server-cpu
```

### 使用 Docker Compose

```bash
# 克隆仓库
git clone https://github.com/fishaudio/fish-speech.git
cd fish-speech

# 启动 WebUI（CUDA）
docker compose --profile webui up

# 启动 API Server
docker compose --profile server up

# CPU Only
BACKEND=cpu docker compose --profile webui up
```

### 自托管 API 请求示例

```bash
curl -X POST "http://localhost:8080/v1/tts" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, this is a test",
    "reference_audio": "base64_encoded_audio",
    "reference_text": "Reference transcription",
    "format": "mp3"
  }' \
  --output output.mp3
```

**注意**：本地 API 文档访问地址为 `http://localhost:8080/docs`

---

## 相关链接

| 资源 | 链接 |
|------|------|
| 官方文档 | https://docs.fish.audio |
| 平台主页 | https://fish.audio |
| 声音广场 | https://fish.audio/discovery |
| Python SDK | https://github.com/fishaudio/fish-audio-python |
| Fish Speech (开源) | https://github.com/fishaudio/fish-speech |
| OpenAudio 文档 | https://speech.fish.audio |
