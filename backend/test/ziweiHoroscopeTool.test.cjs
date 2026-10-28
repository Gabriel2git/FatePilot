const assert = require('node:assert/strict');
const test = require('node:test');
const { ZIWEI_HOROSCOPE_TOOL, queryZiweiHoroscope } = require('../../src/ziweiHoroscopeTool');

const context = { birthday: '2000-05-23', hourIndex: 5, gender: 'male' };

test('flow-year query returns engine-computed yearly palace, age, and natal palace mapping', () => {
  const result = queryZiweiHoroscope(context, { year: 2026 });

  assert.equal(result.query, '2026年流年');
  assert.equal(result.targetSolarDate, '2026-06-30');
  assert.ok(result.yearly.lifePalaceGanzhi);
  assert.equal(result.yearly.palaceNames.length, 12);
  assert.equal(result.palaces.length, 12);
  assert.equal(result.monthly, null);
});

test('flow-month query resolves the selected Gregorian month to an engine result and lunar date', () => {
  const result = queryZiweiHoroscope(context, { year: 2026, month: 7 });

  assert.equal(result.query, '2026年7月流月');
  assert.equal(result.targetSolarDate, '2026-07-15');
  assert.ok(result.targetLunarDate);
  assert.ok(result.monthly.lifePalaceGanzhi);
  assert.equal(result.monthly.palaceNames.length, 12);
  assert.equal(result.monthly.mutagen.length, 4);
});

test('calculation tool requires bounded integer Gregorian year and month values', () => {
  assert.equal(ZIWEI_HOROSCOPE_TOOL.function.name, 'get_ziwei_horoscope');
  assert.throws(() => queryZiweiHoroscope(context, { year: 2101 }), /1900至2100/);
  assert.throws(() => queryZiweiHoroscope(context, { year: 2026, month: 13 }), /1至12/);
});
