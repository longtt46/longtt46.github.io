// my.js
async function callAPI(content) {
    const url = 'https://api.coze.cn/v3/chat';
    const headers = {
        'Authorization': 'Bearer pat_u05Gez5m57eTnRfWUpPpAQA58gUfoYGQz2gwNNUhr9XBrBomJOyOSdFjQU1DQWZ6',
        'Content-Type': 'application/json'
    };
    const data = {
        "bot_id": "7461210563834642451",
        "user_id": "123456789",
        "stream": true,
        "auto_save_history": true,
        "additional_messages": [
            {
                "role": "user",
                "content": content,
                "content_type": "text"
            }
        ]
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let done = false;
    let fullResponse = '';

    while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        const chunk = decoder.decode(value, { stream: !done });
        fullResponse += chunk;
    }

    // 解析流式响应
    const events = fullResponse.split('\n\n').filter(line => line.trim() !== '');
    let finalContent = '';
    let imageUrl = '';

    events.forEach(event => {
        if (event.startsWith('event:conversation.message.delta')) {
            const dataLine = event.split('\n').find(line => line.startsWith('data:'));
            if (dataLine) {
                const jsonData = JSON.parse(dataLine.substring(5));
                finalContent += jsonData.content;

                // 检查是否有图片URL
                if (jsonData.image_url) {
                    imageUrl = jsonData.image_url;
                }
            }
        }
    });

    // 更新前端展示
    const responseElement = document.getElementById('response');
    responseElement.innerText = finalContent;
    if (imageUrl) {
        const imgElement = document.getElementById('generated-image');
        imgElement.src = imageUrl;
        imgElement.alt = "Generated Emoji";
        imgElement.className = "emoji-image";
        imgElement.style.display = "block"; // 确保图片显示
    }
}