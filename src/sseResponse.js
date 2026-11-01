function sendOpenAICompatibleTextStream(res, content) {
  if (res.writableEnded || res.destroyed) return;

  if (!res.headersSent) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
  }

  const created = Math.floor(Date.now() / 1000);
  const id = `chatcmpl-${Date.now()}`;
  const writeChunk = (delta, finishReason = null) => res.write(`data: ${JSON.stringify({
    id,
    object: 'chat.completion.chunk',
    created,
    model: 'ziwei-tool-result',
    choices: [{ index: 0, delta, finish_reason: finishReason }],
  })}\n\n`);
  if (content) writeChunk({ content });
  writeChunk({}, 'stop');
  res.end('data: [DONE]\n\n');
}

module.exports = { sendOpenAICompatibleTextStream };
