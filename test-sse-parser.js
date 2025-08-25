// 测试SSE数据解析逻辑
const testSSEData = `data: {"text":"✅ 解析后的响应: nextAgents=['FINISH']\\n"}

data: {"text":"🎯"}

data: {"text":" "}

data: {"text":"C"}

data: {"text":"o"}

data: {"text":"o"}

data: {"text":"r"}

data: {"text":"d"}

data: {"text":"i"}

data: {"text":"n"}

data: {"text":"a"}

data: {"text":"t"}

data: {"text":"o"}

data: {"text":"r"}

data: [DONE]

`;

function parseSSEData(sseData) {
    let text = '';
    const lines = sseData.split('\n');
    
    for (const line of lines) {
        if (line.trim() === '') continue;
        
        if (line.startsWith('data: ')) {
            const dataStr = line.slice(6); // 去掉 "data: " 前缀
            
            if (dataStr === '[DONE]') {
                break;
            }

            try {
                const data = JSON.parse(dataStr);
                if (data.text) {
                    text += data.text;
                }
            } catch (error) {
                console.error('Failed to parse SSE data:', error, dataStr);
            }
        }
    }
    
    return text;
}

const result = parseSSEData(testSSEData);
console.log('解析结果:');
console.log('[' + result + ']');
console.log('\n原始数据长度:', testSSEData.length);
console.log('解析后文本长度:', result.length);
console.log('\n字符编码:');
for (let i = 0; i < result.length; i++) {
    console.log(`位置 ${i}: '${result[i]}' (${result.charCodeAt(i)})`);
}
