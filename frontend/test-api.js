const https = require('https');

function testAPI() {
  const apiKey = 'sk-62fd1163f8d74324b1b76f4ab32b0805';
  const options = {
    hostname: 'dashscope.aliyuncs.com',
    path: '/compatible-mode/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'Content-Length': Buffer.byteLength(JSON.stringify({
        model: 'deepseek-v3.2',
        messages: [
          {
            role: 'user',
            content: '你好'
          }
        ],
        stream: false
      }))
    }
  };

  console.log('测试API调用...');
  const req = https.request(options, (res) => {
    console.log('响应状态:', res.statusCode);
    console.log('响应头:', res.headers);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('响应数据:', data);
    });
  });

  req.on('error', (e) => {
    console.error('API调用失败:', e);
  });

  req.write(JSON.stringify({
    model: 'deepseek-v3.2',
    messages: [
      {
        role: 'user',
        content: '你好'
      }
    ],
    stream: false
  }));
  req.end();
}

testAPI();
