#!/bin/bash

echo "=== 测试 aichat/chat 接口 ==="
echo "请确保8080端口的chat服务器已经启动"
echo ""

# 测试8080端口的服务器
echo "1. 直接测试8080端口的chat服务器:"
curl -N -X POST "http://localhost:8080/aichat/chat" \
  -H "accept: text/event-stream" \
  -H "Content-Type: application/json" \
  -d '{
    "conversation_id": "1919358918656524289",
    "messages": [{"role": "user", "content": "向左移动20cm"}]
}'

echo -e "\n\n测试完成！"
