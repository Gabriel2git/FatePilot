const assert = require('node:assert/strict');
const test = require('node:test');
const { sendOpenAICompatibleTextStream } = require('../../src/sseResponse');

function createResponse({ headersSent = false, destroyed = false, writableEnded = false } = {}) {
  return {
    headersSent,
    destroyed,
    writableEnded,
    statusCode: 0,
    headers: {},
    chunks: [],
    setHeader(name, value) {
      if (this.headersSent) {
        const error = new Error('Cannot set headers after they are sent to the client');
        error.code = 'ERR_HTTP_HEADERS_SENT';
        throw error;
      }
      this.headers[name] = value;
    },
    write(chunk) {
      this.headersSent = true;
      this.chunks.push(chunk);
      return true;
    },
    end(chunk) {
      if (chunk) this.chunks.push(chunk);
      this.writableEnded = true;
    },
  };
}

test('stream error fallback writes after heartbeat headers without setting headers again', () => {
  const response = createResponse({ headersSent: true });

  sendOpenAICompatibleTextStream(response, '模型服务暂时不可用');

  assert.match(response.chunks.join(''), /模型服务暂时不可用/);
  assert.match(response.chunks.join(''), /\[DONE\]/);
  assert.equal(response.writableEnded, true);
  assert.deepEqual(response.headers, {});
});

test('stream response sets SSE headers when no heartbeat has been sent', () => {
  const response = createResponse();

  sendOpenAICompatibleTextStream(response, '正常回答');

  assert.equal(response.statusCode, 200);
  assert.equal(response.headers['Content-Type'], 'text/event-stream; charset=utf-8');
  assert.match(response.chunks.join(''), /正常回答/);
});

test('stream response ignores already closed clients', () => {
  const response = createResponse({ destroyed: true });

  sendOpenAICompatibleTextStream(response, '不能发送');

  assert.equal(response.chunks.length, 0);
  assert.equal(response.writableEnded, false);
});
