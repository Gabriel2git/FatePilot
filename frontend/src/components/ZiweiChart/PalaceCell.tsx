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

function PalaceDataRow({
  label,
  stars,
  rowClass = '',
  renderCell,
  emptyText = '\u00a0',
}: {
  label: string;
  stars: any[];
  rowClass?: string;
  renderCell: (star: any, index: number) => React.ReactNode;
  emptyText?: string;
}) {
  return (
    <div className={`fp-palace-info-row ${rowClass}`} aria-label={label}>
      <span className="fp-palace-row-label">{label}</span>
      {stars.length ? stars.map(renderCell) : <span className="fp-palace-empty-mark">{emptyText}</span>}
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
  const starColumnCount = Math.max(allStars.length, 1);

  return (
    <div className={`fp-palace-cell w-full h-full p-1 sm:p-2 flex flex-col ${
      isCurrentYearly ? 'is-current-yearly' : ''
    } ${isCurrentDecadal ? 'is-current-decadal' : ''} ${isSelected ? 'is-selected' : ''}`}>
      <div className="fp-palace-info-rows" style={{ '--fp-star-count': starColumnCount } as React.CSSProperties}>
        <PalaceDataRow
          label="星曜"
          stars={allStars}
          emptyText="空宫"
          renderCell={(star, index) => <span
            key={`${star.name}-name-${index}`}
            className={`fp-palace-star ${index < (palace.majorStars || []).length ? 'major' : 'minor'}`}
            title={star.name}
          >{star.name}</span>}
        />
        <PalaceDataRow
          label="亮度"
          stars={allStars}
          rowClass="fp-palace-brightness-row"
          renderCell={(star, index) => <span key={`${star.name}-brightness-${index}`} title={`${star.name}亮度${star.brightness || '未知'}`}>
            {star.brightness || '—'}
          </span>}
        />
        <PalaceDataRow
          label="本命"
          stars={allStars}
          rowClass="fp-mutagen-natal-row"
          renderCell={(star, index) => {
            const marker = selfMarkers.find((item) => item.starName === star.name);
            const tag = star?.mutagen || marker?.mutagen;
            return <span
              key={`${star.name}-birth-${index}`}
              className="fp-mutagen-natal"
              title={tag ? `${star.name}本命化${tag}${marker ? (marker.kind === 'self' ? '，自化' : '，视同自化') : ''}` : star.name}
            >
              {marker && <span className={`fp-self-arrow ${marker.kind}`} aria-label={marker.kind === 'self' ? '自化' : '视同自化'}>
                {marker.kind === 'self' ? '↗' : '↙'}
              </span>}{tag || '\u00a0'}
            </span>;
          }}
        />
        <PalaceDataRow
          label="大限"
          stars={allStars}
          rowClass="fp-mutagen-decadal-row"
          renderCell={(star, index) => {
            const tag = getMutagenTag(star.name, decadalMutagen);
            return <span key={`${star.name}-decadal-${index}`} title={tag ? `${star.name}大限化${tag}` : star.name}>
              {tag || '\u00a0'}
            </span>;
          }}
        />
        <PalaceDataRow
          label="流年"
          stars={allStars}
          rowClass="fp-mutagen-yearly-row"
          renderCell={(star, index) => {
            const tag = getMutagenTag(star.name, yearlyMutagen);
            return <span key={`${star.name}-yearly-${index}`} title={tag ? `${star.name}流年化${tag}` : star.name}>
              {tag || '\u00a0'}
            </span>;
          }}
        />
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
