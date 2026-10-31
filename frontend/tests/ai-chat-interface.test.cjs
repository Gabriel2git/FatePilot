const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const source = (file) => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const page = source('src/app/page.tsx');
const styles = source('src/app/globals.css');
const chat = source('src/components/AIChat/index.tsx');
const aiPage = source('src/components/AIFortuneTeller/index.tsx');
const chart = source('src/components/ChartView/index.tsx');
const palaceCell = source('src/components/ZiweiChart/PalaceCell.tsx');
const centerInfo = source('src/components/ZiweiChart/CenterInfo.tsx');
const chartDecorations = source('src/components/ZiweiChart/chartDecorations.ts');
const aiSource = source('src/lib/ai.ts');
const chatHook = source('src/hooks/useAIChat.ts');
const sseParser = require('../src/lib/sseDataParser.js');

test('SSE parser preserves events split across arbitrary network chunks and UTF-8 boundaries', () => {
  const received = [];
  const parser = sseParser.createSseDataParser((line) => received.push(JSON.parse(line)));
  const event = `data: ${JSON.stringify({ choices: [{ delta: { content: '流月结果' } }] })}\n\n`;
  const bytes = new TextEncoder().encode(`${event}: keep-alive\n\ndata: [DONE]\n\n`);
  const splitAt = bytes.findIndex((byte, index) => byte === 0xe6 && bytes[index + 1] === 0x9c && bytes[index + 2] === 0x88) + 1;
  const decoder = new TextDecoder();
  parser.push(decoder.decode(bytes.slice(0, splitAt), { stream: true }));
  parser.push(decoder.decode(bytes.slice(splitAt), { stream: true }));
  parser.push(decoder.decode());
  parser.finish();

  assert.equal(received.length, 1);
  assert.equal(received[0].choices[0].delta.content, '流月结果');
});

test('tools menu closes on outside pointer and Escape', () => {
  assert.match(page, /addEventListener\('pointerdown', closeOnOutsidePointer\)/);
  assert.match(page, /toolsMenu\.contains\(event\.target as Node\)/);
  assert.match(page, /event\.key === 'Escape'/);
});

test('conversation settings close on outside pointer and Escape', () => {
  assert.match(aiPage, /const settingsRef = useRef<HTMLDetailsElement>\(null\)/);
  assert.match(aiPage, /settings\.contains\(event\.target as Node\)/);
  assert.match(aiPage, /settingsRef\.current\?\.removeAttribute\('open'\)/);
  assert.match(aiPage, /addEventListener\('pointerdown', closeOnOutsidePointer\)/);
  assert.match(aiPage, /removeEventListener\('pointerdown', closeOnOutsidePointer\)/);
});

test('chat keeps long answers in an independently scrollable viewport area', () => {
  assert.match(styles, /\.fp-app-chat \.fp-ai-chat-area\s*\{[^}]*min-height:\s*0/s);
  assert.match(chat, /flex-1 min-h-0 overflow-y-auto/);
  assert.match(styles, /\.fp-chat-composer\s*\{[^}]*flex:\s*none/s);
  assert.match(styles, /env\(safe-area-inset-bottom\)/);
});

test('chat page keeps model and persona in collapsed settings beside a compact chart context', () => {
  const settingsStart = aiPage.indexOf('<details ref={settingsRef} className="fp-ai-settings">');
  const settingsEnd = aiPage.indexOf('</details>', settingsStart);
  assert.notEqual(settingsStart, -1);
  assert.notEqual(settingsEnd, -1);
  const settings = aiPage.slice(settingsStart, settingsEnd);
  assert.match(settings, /id="ai-model-select"/);
  assert.match(settings, /className="fp-persona-control"/);
  assert.match(settings, /role="group" aria-label="解读风格"/);
  assert.doesNotMatch(settings.slice(0, settings.indexOf('>')), /\bopen\b/);
  assert.match(aiPage, /已带入：\{readingContext\}/);
  assert.doesNotMatch(aiPage, /fp-ai-contextbar/);
  assert.match(aiPage, /切换解读风格会重新开始当前对话/);
});

test('chat view uses a compact viewport layout while preserving status and stop controls', () => {
  assert.match(styles, /\.fp-app-chat \.fp-main\s*\{[^}]*overflow:\s*hidden/s);
  assert.match(styles, /\.fp-app-chat \.fp-ai-chat-area\s*\{[^}]*flex:\s*1[^}]*min-height:\s*0/s);
  assert.doesNotMatch(styles, /\.fp-ai-chat-area\s*\{[^}]*min-height:\s*520px/);
  assert.match(chat, /aria-live="polite"/);
  assert.match(chat, /onClick=\{stopGeneration\}/);
});

test('chat waiting feedback stays inline and does not render blank assistant bubbles', () => {
  assert.match(chat, /className="fp-chat-progress" role="status" aria-live="polite"/);
  assert.match(chat, /正在整理\{loadingStage === 'context' \? '命盘信息' : '解读内容'\}/);
  assert.match(chat, /已等待 \{waitingSeconds\} 秒/);
  assert.match(chat, /message\.content\.trim\(\)\.length > 0/);
  assert.doesNotMatch(chat, /fp-chat-loading|fp-chat-spinner/);
  assert.match(styles, /\.fp-chat-progress\s*\{[^}]*margin-left:/s);
  assert.match(chatHook, /连接已结束，但没有收到回答/);
  assert.match(chatHook, /parseSse\.push\(decoder\.decode\(value, \{ stream: true \}\)\)/);
  assert.match(chatHook, /parseSse\.finish\(\)/);
});

test('horoscope tool requests send SSE keepalives while awaiting model completion', () => {
  const server = source('../src/server.js');
  assert.match(server, /setInterval\(\(\) => \{\s*if \(!res\.writableEnded\) res\.write\(': keep-alive\\n\\n'\);\s*\}, 10000\)/);
  assert.match(server, /clearInterval\(heartbeat\)/);
  assert.match(server, /模型没有生成可显示的文字/);
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

test('AI can query engine-computed flows outside the currently selected period', () => {
  const server = source('../src/server.js');
  assert.match(aiSource, /Dynamic Fortune Lookup/);
  assert.match(chatHook, /buildFortuneToolContext\(resolvedZiweiData\)/);
  assert.match(aiSource, /requestBody\.fortuneContext = fortuneContext/);
  assert.match(server, /tools: \[ZIWEI_HOROSCOPE_TOOL\]/);
  assert.match(server, /queryZiweiHoroscope\(fortuneContext, args\)/);
  assert.match(server, /targetMonth/);
  assert.match(aiSource, /selectedContext\?\.targetMonth \? `\\n│   └流月宫位/);
  assert.match(aiSource, /monthlyMutagen/);
});

test('decade selection keeps the reference year when it belongs to that decade', () => {
  assert.match(chart, /getDefaultYearForDecadal\(/);
  assert.match(chart, /getYearsInDecadal\(/);
  assert.match(chart, /if \(selectedDecadal\?\.start === decadalInfo\.start && selectedDecadal\?\.end === decadalInfo\.end\) return/);
});

test('chart labels follow iztro palace-name arrays and separate selection from annual highlighting', () => {
  assert.match(palaceCell, /horoscope\?\.yearly\?\.palaceNames/);
  assert.match(palaceCell, /horoscope\?\.decadal\?\.palaceNames/);
  assert.match(palaceCell, /isCurrentYearly \? 'is-current-yearly'/);
  assert.match(chart, /onSelectPalace=\{setSelectedPalace\}/);
  assert.match(centerInfo, /推演时间：/);
  assert.match(centerInfo, /targetMonth \? `年\$\{targetMonth\}月`/);
});

test('chart separates star brightness and natal, decade, and yearly transformation rows', () => {
  assert.match(styles, /\.fp-palace-star\s*\{[^}]*writing-mode:\s*vertical-rl/s);
  assert.match(palaceCell, /label="亮度"\s+stars=\{allStars\}/);
  assert.match(palaceCell, /label="本命"\s+stars=\{allStars\}/);
  assert.match(palaceCell, /label="大限"/);
  assert.match(palaceCell, /label="流年"/);
  assert.match(styles, /\.fp-palace-info-rows\s*\{/);
});

test('chart shows dashed trine lines only after a palace is selected and labels self-transform arrows', () => {
  const ziweiChart = source('src/components/ZiweiChart/index.tsx');
  assert.match(ziweiChart, /trineConnections\.length > 0/);
  assert.match(ziweiChart, /getTrineConnections\(trinePalace\.earthlyBranch\)/);
  assert.match(ziweiChart, /setTrineBranch\(\(current\) => current === branch \? null : branch\)/);
  assert.match(styles, /\.fp-trine-overlay line/);
  assert.match(palaceCell, /kind === 'self' \? '↗' : '↙'/);
  assert.match(chartDecorations, /SIHUA_TABLE\[palace\.heavenlyStem\]/);
  assert.match(chartDecorations, /OPPOSITES\[palace\.earthlyBranch\]/);
  assert.match(chartDecorations, /kind: 'considered-self'/);
});
