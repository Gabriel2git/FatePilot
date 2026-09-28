const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const source = (file) => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const page = source('src/app/page.tsx');
const styles = source('src/app/globals.css');
const chat = source('src/components/AIChat/index.tsx');
const chart = source('src/components/ChartView/index.tsx');
const palaceCell = source('src/components/ZiweiChart/PalaceCell.tsx');
const centerInfo = source('src/components/ZiweiChart/CenterInfo.tsx');
const chartDecorations = source('src/components/ZiweiChart/chartDecorations.ts');

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

test('decade selection keeps the reference year when it belongs to that decade', () => {
  assert.match(chart, /getDefaultYearForDecadal\(/);
  assert.match(chart, /getYearsInDecadal\(/);
  assert.match(chart, /if \(selectedDecadal\?\.start === decadalInfo\.start && selectedDecadal\?\.end === decadalInfo\.end\) return/);
});

test('chart labels follow iztro palace-name arrays and separate selection from annual highlighting', () => {
  assert.match(palaceCell, /horoscope\?\.yearly\?\.palaceNames/);
  assert.match(palaceCell, /horoscope\?\.decadal\?\.palaceNames/);
  assert.match(palaceCell, /isCurrentYearly \? 'is-current-yearly'/);
  assert.match(chart, /selectedPalace=\{selectedPalace\?\.name \|\| null\}/);
  assert.match(centerInfo, /推演年份：/);
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
  assert.match(ziweiChart, /getTrineConnections\(selected\.earthlyBranch\)/);
  assert.match(styles, /\.fp-trine-overlay line/);
  assert.match(palaceCell, /kind === 'self' \? '↗' : '↙'/);
  assert.match(chartDecorations, /SIHUA_TABLE\[palace\.heavenlyStem\]/);
  assert.match(chartDecorations, /OPPOSITES\[palace\.earthlyBranch\]/);
  assert.match(chartDecorations, /kind: 'considered-self'/);
});
