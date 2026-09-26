import React from 'react';
import { getDynamicPalaceName } from '@/lib/fortunePeriods';
import { getSelfTransformationMarkers } from './chartDecorations';

const MUTAGEN_LABELS = ['禄', '权', '科', '忌'];

interface PalaceCellProps {
  palace: any;
  horoscope?: any;
  palaces?: any[];
  earthlyBranchOfBodyPalace?: string;
  birthYearStem?: string;
  isSelected?: boolean;
}

function getMutagenTag(starName: string, mutagen: string[] | undefined): string | null {
  if (!Array.isArray(mutagen)) return null;
  const index = mutagen.findIndex((name) => name === starName);
  return index >= 0 && index < 4 ? MUTAGEN_LABELS[index] : null;
}

function MutagenRow({ label, stars, color }: { label: string; stars: any[]; color: string }) {
  const entries = stars.flatMap((star) => star.tag ? [{ name: star.name, tag: star.tag }] : []);
  return (
    <div className="fp-palace-info-row" aria-label={label}>
      <span className="fp-palace-row-label">{label}</span>
      <span className="fp-palace-row-values">
        {entries.length ? entries.map((entry, index) => (
          <span key={`${entry.name}-${index}`} className={color} title={`${entry.name}${entry.tag}`}>
            {entry.tag}
          </span>
        )) : <span className="fp-palace-empty-mark">·</span>}
      </span>
    </div>
  );
}

export default function PalaceCell({
  palace,
  horoscope,
  palaces = [],
  earthlyBranchOfBodyPalace,
  birthYearStem,
  isSelected = false,
}: PalaceCellProps) {
  if (!palace) return null;

  const isCurrentDecadal = horoscope?.decadal?.earthlyBranch === palace.earthlyBranch;
  const isCurrentYearly = horoscope?.yearly?.earthlyBranch === palace.earthlyBranch;
  const isBodyPalace = palace.earthlyBranch === earthlyBranchOfBodyPalace;
  const isOriginPalace = palace.heavenlyStem === birthYearStem;
  const decadalPalace = getDynamicPalaceName(palace.index, horoscope?.decadal?.palaceNames);
  const yearlyPalace = getDynamicPalaceName(palace.index, horoscope?.yearly?.palaceNames);
  const allStars = [...(palace.majorStars || []), ...(palace.minorStars || [])];
  const selfMarkers = getSelfTransformationMarkers(palace, palaces);
  const decadalMutagen = horoscope?.decadal?.mutagen;
  const yearlyMutagen = horoscope?.yearly?.mutagen;
  const birthEntries = allStars.flatMap((star) => {
    const marker = selfMarkers.find((item) => item.starName === star.name);
    const tag = star?.mutagen || marker?.mutagen;
    return tag ? [{ name: star.name, tag, marker }] : [];
  });
  const decadalEntries = allStars.map((star) => ({ name: star.name, tag: getMutagenTag(star.name, decadalMutagen) }));
  const yearlyEntries = allStars.map((star) => ({ name: star.name, tag: getMutagenTag(star.name, yearlyMutagen) }));

  return (
    <div className={`fp-palace-cell w-full h-full p-1 sm:p-2 flex flex-col ${
      isCurrentYearly ? 'is-current-yearly' : ''
    } ${isCurrentDecadal ? 'is-current-decadal' : ''} ${isSelected ? 'is-selected' : ''}`}>
      <div className="fp-palace-stars" aria-label="主星与辅星">
        {allStars.length ? allStars.map((star, index) => (
          <span
            key={`${star.name}-${index}`}
            className={`fp-palace-star ${index < (palace.majorStars || []).length ? 'major' : 'minor'}`}
            title={`${star.name}${star.brightness ? ` · ${star.brightness}` : ''}`}
          >{star.name}</span>
        )) : <span className="fp-palace-no-stars">空宫</span>}
      </div>

      <div className="fp-palace-info-rows">
        <div className="fp-palace-info-row" aria-label="亮度">
          <span className="fp-palace-row-label">亮度</span>
          <span className="fp-palace-row-values">
            {allStars.length ? allStars.map((star, index) => (
              <span key={`${star.name}-brightness-${index}`} title={star.name}>{star.brightness || '—'}</span>
            )) : <span className="fp-palace-empty-mark">—</span>}
          </span>
        </div>
        <div className="fp-palace-info-row" aria-label="本命四化">
          <span className="fp-palace-row-label">本命</span>
          <span className="fp-palace-row-values natal">
            {birthEntries.length ? birthEntries.map((entry, index) => (
              <span key={`${entry.name}-birth-${index}`} className="fp-mutagen-natal" title={`${entry.name}本命化${entry.tag}`}>
                {entry.marker && <span className={`fp-self-arrow ${entry.marker.kind}`} aria-label={entry.marker.kind === 'self' ? '自化' : '视同自化'}>
                  {entry.marker.kind === 'self' ? '↗' : '↙'}
                </span>}{entry.tag}
              </span>
            )) : <span className="fp-palace-empty-mark">·</span>}
          </span>
        </div>
        <MutagenRow label="大限" stars={decadalEntries} color="fp-mutagen-decadal" />
        <MutagenRow label="流年" stars={yearlyEntries} color="fp-mutagen-yearly" />
      </div>
      <div className="fp-palace-adjectives" title={(palace.adjectiveStars || []).map((star: any) => star.name).join(' ')}>
        {(palace.adjectiveStars || []).slice(0, 4).map((star: any) => star.name).join(' ')}
        {palace.changsheng12 ? ` · ${palace.changsheng12}` : ''}
        {palace.boshi12 ? ` · ${palace.boshi12}` : ''}
      </div>

      <div className="fp-palace-meta">
        <div className="fp-palace-meta-left">
          <span className="fp-palace-age">{palace.decadal?.range?.[0]}–{palace.decadal?.range?.[1]} 岁</span>
          <span className="fp-palace-name-line">
            <strong>{palace.name}</strong>
            {isBodyPalace && <span className="fp-body-tag">身</span>}
          </span>
          {(decadalPalace || yearlyPalace) && <span className="fp-palace-dynamic-names">
            {decadalPalace && `大${decadalPalace.substring(0, 2)}`}
            {yearlyPalace && ` 年${yearlyPalace.substring(0, 2)}`}
          </span>}
        </div>
        <div className="fp-palace-meta-right">
          {isOriginPalace && <span className="fp-origin-tag">因</span>}
          <strong>{palace.heavenlyStem}{palace.earthlyBranch}</strong>
        </div>
      </div>
    </div>
  );
}
