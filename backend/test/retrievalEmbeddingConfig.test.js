const assert = require('node:assert/strict');
const test = require('node:test');
const RetrievalService = require('../services/retrievalService');

test('generates embeddings with the configured DashScope text model', async () => {
  const originalFetch = global.fetch;
  const originalApiKey = process.env.DASHSCOPE_API_KEY;
  let request;

  process.env.DASHSCOPE_API_KEY = 'test-key';
  global.fetch = async (url, options) => {
    request = { url, options };
    return {
      ok: true,
      json: async () => ({ output: { embeddings: [{ embedding: [0.1, 0.2] }] } }),
    };
  };

  try {
    const service = new RetrievalService();
    const embedding = await service.generateEmbedding('紫微斗数');

    assert.deepEqual(embedding, [0.1, 0.2]);
    assert.equal(request.url, 'https://dashscope.aliyuncs.com/api/v1/services/embeddings/text-embedding/text-embedding');
    assert.equal(request.options.headers.Authorization, 'Bearer test-key');
    assert.deepEqual(JSON.parse(request.options.body), {
      model: 'qwen3.7-text-embedding',
      input: { texts: ['紫微斗数'] },
    });
  } finally {
    global.fetch = originalFetch;
    if (originalApiKey === undefined) delete process.env.DASHSCOPE_API_KEY;
    else process.env.DASHSCOPE_API_KEY = originalApiKey;
  }
});
