# Chat API 使用说明

## 概述

本项目现在直接调用8080端口的chat服务器，无需代理。

**前端应用**: `http://localhost:3000` (Next.js应用)
**Chat服务器**: `http://localhost:8080/aichat/chat` (独立的chat服务)

## 启动服务

```bash
# 启动前端应用（3000端口）
npm run dev
```

**注意**: 8080端口的chat服务器需要单独启动，不在本项目范围内。

## API 接口

### 请求格式

**URL**: `POST /aichat/chat`

**Headers**:
```
accept: text/event-stream
Content-Type: application/json
```

**请求体**:
```json
{
  "conversation_id": "1919358918656524289",
  "messages": [
    {"role": "user", "content": "向左移动20cm"}
  ]
}
```

### 响应格式

接口返回 Server-Sent Events (SSE) 流，每个事件包含：

```json
{"text": "AI回复的文本片段"}
```

流结束时发送：
```
data: [DONE]
```

### 示例请求

```bash
curl -N -X POST "http://localhost:8080/aichat/chat" \
  -H "accept: text/event-stream" \
  -H "Content-Type: application/json" \
  -d '{
    "conversation_id": "1919358918656524289",
    "messages": [{"role": "user", "content": "向左移动20cm"}]
}'
```

## 环境变量配置

确保在 `.env` 文件中配置以下环境变量：

```env
# OpenAI配置
OPENAI_TYPE=OPENAI  # 或 AZURE_OPENAI
OPENAI_API_KEY=your_openai_api_key
OPENAI_API_MODEL=gpt-3.5-turbo

# Azure OpenAI配置（如果使用Azure）
AZURE_OPENAI_API_KEY=your_azure_api_key
AZURE_OPENAI_API_DEPLOYMENT_NAME=your_deployment_name
AZURE_OPENAI_API_INSTANCE_NAME=your_instance_name
AZURE_OPENAI_API_VERSION=2023-05-15
AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME=your_embeddings_deployment_name
```

## 测试

运行测试脚本：
```bash
chmod +x test-chat.sh
./test-chat.sh
```

## 架构说明

- **8080端口服务器**: 独立的chat服务器，直接处理chat请求并返回SSE流
- **3000端口前端**: Next.js应用，直接调用8080端口服务器
- **SSE流式响应**: 支持实时流式显示AI回复，适合前端流式展示

## 环境变量配置

在项目根目录创建 `.env.local` 文件：

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

## 注意事项

1. 确保8080端口的chat服务器已经启动
2. 前端应用直接调用8080端口，无需代理
3. SSE响应需要前端正确处理流式数据
4. 错误处理会返回JSON格式的错误信息
