const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ts = require('typescript');

const sourcePath = path.join(__dirname, '../src/components/ZiweiChart/chartDecorations.ts');
const source = fs.readFileSync(sourcePath, 'utf8').replace(
  "import { SIHUA_TABLE } from '@/lib/sihua';",
  'const SIHUA_TABLE = {};',
);
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const chartDecorations = { exports: {} };
new Function('require', 'module', 'exports', compiled)(require, chartDecorations, chartDecorations.exports);

const { getTrineConnections } = chartDecorations.exports;
const groups = [
  ['寅', ['午', '戌', '申']], ['午', ['寅', '戌', '子']], ['戌', ['寅', '午', '辰']],
  ['申', ['子', '辰', '寅']], ['子', ['申', '辰', '午']], ['辰', ['申', '子', '戌']],
  ['巳', ['酉', '丑', '亥']], ['酉', ['巳', '丑', '卯']], ['丑', ['巳', '酉', '未']],
  ['亥', ['卯', '未', '巳']], ['卯', ['亥', '未', '酉']], ['未', ['亥', '卯', '丑']],
];

test('三方四正连接从所选宫位出发，目标为另外两组三合宫和对宫', () => {
  for (const [origin, expectedTargets] of groups) {
    const connections = getTrineConnections(origin);
    assert.equal(connections.length, 3, `${origin} should have three connections`);
    assert.deepEqual(connections.map((item) => item.toBranch), expectedTargets);
    assert.ok(connections.every((item) => item.fromBranch === origin));
    assert.ok(connections.every((item) => item.from === connections[0].from));
    assert.ok(connections.every((item) => item.toBranch !== origin));
  }
  assert.deepEqual(getTrineConnections('无效地支'), []);
});

test('星曜、亮度和本命大限流年四化都由同一组星曜列生成', () => {
  const component = fs.readFileSync(path.join(__dirname, '../src/components/ZiweiChart/PalaceCell.tsx'), 'utf8');
  assert.match(component, /label="星曜"\s+stars=\{allStars\}/);
  assert.match(component, /label="亮度"\s+stars=\{allStars\}/);
  assert.match(component, /label="本命"\s+stars=\{allStars\}/);
  assert.match(component, /label="大限"\s+stars=\{allStars\}/);
  assert.match(component, /label="流年"\s+stars=\{allStars\}/);
  assert.match(component, /marker\.kind === 'self' \? '↗' : '↙'/);
});

test('选中宫位才渲染三条 SVG 连线，未选中不渲染', () => {
  const component = fs.readFileSync(path.join(__dirname, '../src/components/ZiweiChart/index.tsx'), 'utf8');
  const cell = fs.readFileSync(path.join(__dirname, '../src/components/ZiweiChart/PalaceCell.tsx'), 'utf8');
  const styles = fs.readFileSync(path.join(__dirname, '../src/app/globals.css'), 'utf8');
  assert.match(component, /trinePalace \? getTrineConnections\(trinePalace\.earthlyBranch\) : \[\]/);
  assert.match(component, /current === branch \? null : branch/);
  assert.match(component, /aria-pressed=\{trineBranch === branch\}/);
  assert.match(component, /isSelected=\{trineBranch === branch\}/);
  assert.match(cell, /isSelected \? 'is-selected' : ''/);
  assert.match(component, /trineConnections\.map\(/);
  assert.match(component, /x1=\{connection\.from\[0\]\}/);
  assert.match(component, /y1=\{connection\.from\[1\]\}/);
  assert.match(styles, /\.fp-trine-overlay line[^\{]*\{[^}]*stroke-width:\s*1\.5px/);
  assert.match(styles, /\.fp-trine-overlay line[^\{]*\{[^}]*stroke-dasharray:\s*6 5/);
});

test('星曜区高度跟随星名内容，不再保留固定空白高度', () => {
  const styles = fs.readFileSync(path.join(__dirname, '../src/app/globals.css'), 'utf8');
  assert.match(styles, /\.fp-palace-info-row\[aria-label="星曜"\]\s*\{\s*min-height:\s*0;/);
  assert.doesNotMatch(styles, /\.fp-palace-info-row\[aria-label="星曜"\]\s*\{[^}]*min-height:\s*(?:39|48)px/);
});
