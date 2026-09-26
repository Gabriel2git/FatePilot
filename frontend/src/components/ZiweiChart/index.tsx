﻿﻿﻿﻿﻿﻿﻿import React from 'react';
import PalaceCell from './PalaceCell';
import CenterInfo from './CenterInfo';
import { EARTHLY_BRANCHES, GRID_MAPPING } from './constants';
import { getTrineFourPoints } from './chartDecorations';

interface ZiweiChartProps {
  ziweiData: {
    astrolabe: any;
    horoscope?: any;
    targetYear?: number;
  };
  selectedPalace?: string | null;
  onSelectPalace?: (palace: any) => void;
}

export default function ZiweiChart({ ziweiData, selectedPalace, onSelectPalace }: ZiweiChartProps) {
  if (!ziweiData || !ziweiData.astrolabe) return <div>暂无命盘数据</div>;

  const { astrolabe, horoscope } = ziweiData;
  const palaces = astrolabe.palaces || [];

  const earthlyBranchOfBodyPalace = astrolabe.earthlyBranchOfBodyPalace;
  const birthYearStem = astrolabe.chineseDate ? astrolabe.chineseDate.charAt(0) : undefined;
  const selected = palaces.find((palace: any) => palace.name === selectedPalace);
  const trinePoints = selected ? getTrineFourPoints(selected.earthlyBranch) : [];
  const trinePolygon = trinePoints.map(([x, y]) => `${x},${y}`).join(' ');

  return (
    <div className="fp-ziwei-grid mx-auto relative grid w-full max-w-[720px] grid-cols-4 grid-rows-4 gap-px overflow-hidden rounded-xl border border-[#ddd2bf] bg-[#ddd2bf]">
      {EARTHLY_BRANCHES.map((branch) => {
        const palaceData = palaces.find((palace: any) => palace.earthlyBranch === branch);
        const isSelected = palaceData?.name === selectedPalace;
        return (
          <button
            key={branch}
            type="button"
            onClick={() => palaceData && onSelectPalace?.(palaceData)}
            disabled={!palaceData || !onSelectPalace}
            aria-label={palaceData ? `查看${palaceData.name}` : `${branch}宫暂无数据`}
            aria-pressed={isSelected}
            className={`${GRID_MAPPING[branch]} fp-palace-button relative min-w-0 p-0 text-left focus-visible:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a44135] disabled:cursor-default`}
          >
            <PalaceCell
              palace={palaceData}
              horoscope={horoscope}
              palaces={palaces}
              earthlyBranchOfBodyPalace={earthlyBranchOfBodyPalace}
              birthYearStem={birthYearStem}
              isSelected={isSelected}
            />
          </button>
        );
      })}

      <div className="col-start-2 col-span-2 row-start-2 row-span-2 fp-chart-center relative z-10">
        <CenterInfo astrolabe={astrolabe} horoscope={horoscope} targetYear={ziweiData.targetYear} />
      </div>
      {trinePoints.length > 0 && (
        <svg
          className="fp-trine-overlay absolute inset-0 z-20 h-full w-full pointer-events-none"
          viewBox="0 0 4 4"
          preserveAspectRatio="none"
          aria-label={`${selected.name}宫三方四正连线`}
        >
          <polygon points={trinePolygon} />
          {trinePoints.slice(1).map(([x, y], index) => (
            <line key={index} x1={trinePoints[0][0]} y1={trinePoints[0][1]} x2={x} y2={y} />
          ))}
        </svg>
      )}
    </div>
  );
}
