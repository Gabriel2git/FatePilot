const assert = require('node:assert/strict');
const test = require('node:test');
const iztro = require('iztro');
const {
  getDecadalStartYear,
  getDefaultYearForDecadal,
  getDynamicPalaceName,
  getYearsInDecadal,
} = require('../src/lib/fortunePeriods');

test('uses the selected year when it is inside the chosen decade', () => {
  assert.equal(getDefaultYearForDecadal(2026, 27, [26, 35]), 2026);
  assert.deepEqual(getYearsInDecadal(2026, 27, [26, 35]), [2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034]);
});

test('opens another decade at its first year without changing its age boundaries', () => {
  assert.equal(getDecadalStartYear(2026, 27, 16), 2015);
  assert.equal(getDefaultYearForDecadal(2026, 27, [16, 25]), 2015);
  assert.deepEqual(getYearsInDecadal(2026, 27, [16, 25]), [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024]);
});

test('matches iztro nominal ages and decade ranges for the screenshot birth data', () => {
  const astrolabe = iztro.astro.bySolar('2000-05-23', 5, 'male', true, 'zh-CN');
  const year2015 = astrolabe.horoscope('2015-06-30');
  const year2026 = astrolabe.horoscope('2026-06-30');

  assert.equal(year2015.age.nominalAge, 16);
  assert.deepEqual(astrolabe.palaces.find((palace) => palace.earthlyBranch === year2015.decadal.earthlyBranch).decadal.range, [16, 25]);
  assert.equal(year2026.age.nominalAge, 27);
  assert.deepEqual(astrolabe.palaces.find((palace) => palace.earthlyBranch === year2026.decadal.earthlyBranch).decadal.range, [26, 35]);
});

test('uses iztro palace names by palace index, including the modern 交友 label', () => {
  const astrolabe = iztro.astro.bySolar('2000-05-23', 5, 'male', true, 'zh-CN');
  const horoscope = astrolabe.horoscope('2015-06-30');
  const lifePalace = astrolabe.palaces.find((palace) => horoscope.yearly.palaceNames[palace.index] === '命宫');
  const servantPalace = astrolabe.palaces.find((palace) => horoscope.yearly.palaceNames[palace.index] === '仆役');

  assert.equal(getDynamicPalaceName(lifePalace.index, horoscope.yearly.palaceNames), '命宫');
  assert.equal(getDynamicPalaceName(servantPalace.index, horoscope.yearly.palaceNames), '交友');
});

test('iztro returns monthly palace mapping and mutagen for a date in the requested month', () => {
  const astrolabe = iztro.astro.bySolar('2000-05-23', 5, 'male', true, 'zh-CN');
  const horoscope = astrolabe.horoscope('2026-07-15');

  assert.ok(horoscope.monthly);
  assert.equal(horoscope.monthly.palaceNames.length, 12);
  assert.equal(horoscope.monthly.mutagen.length, 4);
  assert.ok(horoscope.monthly.earthlyBranch);
});
