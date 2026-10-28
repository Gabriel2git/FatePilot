const iztro = require('iztro');

const ZIWEI_HOROSCOPE_TOOL = {
  type: 'function',
  function: {
    name: 'get_ziwei_horoscope',
    description: '使用紫微斗数计算引擎查询指定出生者在某个公历年份或公历年月的实际运限数据。用户询问当前已选范围以外的年份或月份时必须调用。月份查询以该公历月15日为代表日期，并返回对应农历日期。',
    parameters: {
      type: 'object',
      properties: {
        year: { type: 'integer', minimum: 1900, maximum: 2100, description: '目标公历年份，必填' },
        month: { type: 'integer', minimum: 1, maximum: 12, description: '目标公历月份，查询流月时填写；只查询流年时省略' },
      },
      required: ['year'],
      additionalProperties: false,
    },
  },
};

function getLifePalaceGanzhi(astrolabe, section) {
  const names = section?.palaceNames;
  if (!Array.isArray(names)) return '';
  const index = names.indexOf('命宫');
  const palace = index >= 0 ? astrolabe.palaces?.[index] : null;
  return palace ? `${palace.heavenlyStem || ''}${palace.earthlyBranch || ''}` : '';
}

function compactScope(section, astrolabe) {
  if (!section) return null;
  return {
    heavenlyStem: section.heavenlyStem || '',
    earthlyBranch: section.earthlyBranch || '',
    mutagen: section.mutagen || [],
    palaceNames: section.palaceNames || [],
    lifePalaceGanzhi: getLifePalaceGanzhi(astrolabe, section),
  };
}

function queryZiweiHoroscope(context, args) {
  const year = Number(args?.year);
  const month = args?.month === undefined ? null : Number(args.month);
  if (!context || typeof context.birthday !== 'string' || !context.birthday) throw new Error('出生日期缺失，无法计算运限');
  if (!Number.isInteger(context.hourIndex) || context.hourIndex < 0 || context.hourIndex > 12) throw new Error('出生时辰参数无效');
  if (!['male', 'female'].includes(context.gender)) throw new Error('性别参数无效');
  if (!Number.isInteger(year) || year < 1900 || year > 2100) throw new Error('目标年份必须在1900至2100之间');
  if (month !== null && (!Number.isInteger(month) || month < 1 || month > 12)) throw new Error('目标月份必须在1至12之间');

  const astrolabe = iztro.astro.bySolar(context.birthday, context.hourIndex, context.gender, true, 'zh-CN');
  const yearlyHoroscope = astrolabe.horoscope(`${year}-06-30`);
  const targetDate = month === null ? `${year}-06-30` : `${year}-${String(month).padStart(2, '0')}-15`;
  const targetHoroscope = month === null ? yearlyHoroscope : astrolabe.horoscope(targetDate);

  return {
    query: month === null ? `${year}年流年` : `${year}年${month}月流月`,
    targetSolarDate: targetDate,
    targetLunarDate: targetHoroscope.lunarDate || '',
    nominalAge: targetHoroscope.age?.nominalAge ?? null,
    annualAnchor: `${year}-06-30`,
    decadal: compactScope(targetHoroscope.decadal, astrolabe),
    yearly: compactScope(yearlyHoroscope.yearly, astrolabe),
    monthly: month === null ? null : compactScope(targetHoroscope.monthly, astrolabe),
    palaces: astrolabe.palaces.map((palace, index) => ({
      natalPalace: palace.name,
      branch: `${palace.heavenlyStem || ''}${palace.earthlyBranch || ''}`,
      majorStars: (palace.majorStars || []).map((star) => star.name),
      minorStars: (palace.minorStars || []).map((star) => star.name),
      yearlyPalace: yearlyHoroscope.yearly?.palaceNames?.[index] || '',
      monthlyPalace: targetHoroscope.monthly?.palaceNames?.[index] || '',
    })),
  };
}

module.exports = { ZIWEI_HOROSCOPE_TOOL, queryZiweiHoroscope };
