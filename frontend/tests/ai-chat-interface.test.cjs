const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const source = (file) => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const page = source('src/app/page.tsx');
const styles = source('src/app/globals.css');
const chat = source('src/components/AIChat/index.tsx');

test('tools menu closes on outside pointer and Escape', () => {
  assert.match(page, /addEventListener\('pointerdown', closeOnOutsidePointer\)/);
  assert.match(page, /toolsMenu\.contains\(event\.target as Node\)/);
  assert.match(page, /event\.key === 'Escape'/);
});

test('chat keeps long answers in an independently scrollable viewport area', () => {
  assert.match(styles, /\.fp-app-chat \.fp-ai-chat-area\s*\{[^}]*min-height:\s*0/s);
  assert.match(chat, /flex-1 min-h-0 overflow-y-auto/);
});

test('chat scrollbar uses FatePilot theme colors', () => {
  assert.match(styles, /\.fp-app \.show-scrollbar\s*\{[^}]*scrollbar-color:\s*var\(--fp-gold\) transparent/s);
  assert.match(styles, /\.fp-app \.show-scrollbar::-webkit-scrollbar-thumb\s*\{[^}]*var\(--fp-gold\)/s);
  assert.doesNotMatch(styles, /\.fp-app \.show-scrollbar::-webkit-scrollbar-thumb\s*\{[^}]*#[a-f\d]{3,8}/is);
});

test('chat text is reduced and only prompt debugging remains in the tools menu', () => {
  assert.match(styles, /\.fp-chat-message\s*\{[^}]*font-size:\s*14px/s);
  assert.match(page, /setShowDebug\(true\).*调试提示词/s);
  assert.doesNotMatch(chat, /导出|导入/);
});
