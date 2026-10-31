function createSseDataParser(onData) {
  let buffer = '';

  const consumeLine = (line) => {
    if (!line.startsWith('data:')) return;
    const data = line.slice(5).trimStart();
    if (data && data !== '[DONE]') onData(data);
  };

  return {
    push(chunk) {
      const lines = `${buffer}${chunk}`.split(/\r?\n/);
      buffer = lines.pop() || '';
      lines.forEach(consumeLine);
    },
    finish() {
      if (buffer) consumeLine(buffer);
      buffer = '';
    },
  };
}

module.exports = { createSseDataParser };
