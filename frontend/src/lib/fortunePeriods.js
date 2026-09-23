/**
 * Resolve a decadal's first Gregorian year from the horoscope's reference year
 * and nominal age at the reference date (the backend uses June 30).
 * @param {number} targetYear
 * @param {number} nominalAge
 * @param {number} startAge
 */
export function getDecadalStartYear(targetYear, nominalAge, startAge) {
  if (![targetYear, nominalAge, startAge].every(Number.isFinite)) return null;
  return targetYear + startAge - nominalAge;
}

/**
 * Keep the reference year when it belongs to the selected decade; otherwise
 * begin at that decade's first year.
 * @param {number} targetYear
 * @param {number} nominalAge
 * @param {[number, number]} ageRange
 */
export function getDefaultYearForDecadal(targetYear, nominalAge, ageRange) {
  if (!Array.isArray(ageRange) || ageRange.length !== 2) return null;
  const [startAge, endAge] = ageRange;
  if (![targetYear, nominalAge, startAge, endAge].every(Number.isFinite) || startAge > endAge) return null;
  if (nominalAge >= startAge && nominalAge <= endAge) return targetYear;
  return getDecadalStartYear(targetYear, nominalAge, startAge);
}

/**
 * @param {number} targetYear
 * @param {number} nominalAge
 * @param {[number, number]} ageRange
 */
export function getYearsInDecadal(targetYear, nominalAge, ageRange) {
  if (!Array.isArray(ageRange) || ageRange.length !== 2) return [];
  const [startAge, endAge] = ageRange;
  const firstYear = getDecadalStartYear(targetYear, nominalAge, startAge);
  if (firstYear === null || !Number.isFinite(endAge) || endAge < startAge) return [];
  return Array.from({ length: endAge - startAge + 1 }, (_, index) => firstYear + index);
}

/**
 * Use the palace-role names returned by iztro instead of recomputing branch
 * arithmetic in the UI. The UI's modern label for 仆役宫 is 交友宫.
 * @param {number | undefined} palaceIndex
 * @param {string[] | undefined} palaceNames
 */
export function getDynamicPalaceName(palaceIndex, palaceNames) {
  if (!Number.isInteger(palaceIndex) || !Array.isArray(palaceNames)) return null;
  const name = palaceNames[palaceIndex];
  if (typeof name !== 'string' || !name) return null;
  return name === '仆役' ? '交友' : name;
}
