﻿﻿﻿﻿﻿﻿﻿import React from 'react';
import { useState } from 'react';
import PalaceCell from './PalaceCell';
import CenterInfo from './CenterInfo';
import { EARTHLY_BRANCHES, GRID_MAPPING } from './constants';
import { getTrineConnections } from './chartDecorations';

interface ZiweiChartProps {
  ziweiData: {
    astrolabe: any;
    horoscope?: any;
    targetYear?: number;
  };
  onSelectPalace?: (palace: any) => void;
}

export default function ZiweiChart({ ziweiData, onSelectPalace }: ZiweiChartProps) {
  const [trineBranch, setTrineBranch] = useState<string | null>(null);
  if (!ziweiData || !ziweiData.astrolabe) return <div>暂无命盘数据</div>;

  const { astrolabe, horoscope } = ziweiData;
  const palaces = astrolabe.palaces || [];

  const earthlyBranchOfBodyPalace = astrolabe.earthlyBranchOfBodyPalace;
  const birthYearStem = astrolabe.chineseDate ? astrolabe.chineseDate.charAt(0) : undefined;
  const trinePalace = palaces.find((palace: any) => palace.earthlyBranch === trineBranch);
  const trineConnections = trinePalace ? getTrineConnections(trinePalace.earthlyBranch) : [];

  return (
    <div className="fp-ziwei-grid mx-auto relative grid w-full max-w-[720px] grid-cols-4 grid-rows-4 gap-px overflow-hidden rounded-xl border border-[#ddd2bf] bg-[#ddd2bf]">
      {EARTHLY_BRANCHES.map((branch) => {
        const palaceData = palaces.find((palace: any) => palace.earthlyBranch === branch);
        return (
          <button
            key={branch}
            type="button"
            onClick={() => {
              if (!palaceData) return;
              onSelectPalace?.(palaceData);
              setTrineBranch((current) => current === branch ? null : branch);
            }}
            disabled={!palaceData || !onSelectPalace}
            aria-label={palaceData ? `查看${palaceData.name}，切换三方四正连线` : `${branch}宫暂无数据`}
            aria-pressed={trineBranch === branch}
            className={`${GRID_MAPPING[branch]} fp-palace-button relative min-w-0 p-0 text-left focus-visible:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a44135] disabled:cursor-default`}
          >
            <PalaceCell
              palace={palaceData}
              horoscope={horoscope}
              palaces={palaces}
              earthlyBranchOfBodyPalace={earthlyBranchOfBodyPalace}
              birthYearStem={birthYearStem}
              isSelected={trineBranch === branch}
            />
          </button>
        );
      })}

      <div className="col-start-2 col-span-2 row-start-2 row-span-2 fp-chart-center relative z-10">
        <CenterInfo astrolabe={astrolabe} horoscope={horoscope} targetYear={ziweiData.targetYear} />
      </div>
      {trineConnections.length > 0 && (
        <svg
          className="fp-trine-overlay absolute inset-0 z-20 h-full w-full pointer-events-none"
          viewBox="0 0 4 4"
          preserveAspectRatio="none"
          aria-label={`${trinePalace.name}宫三方四正连线`}
          role="img"
        >
          <title>{trinePalace.name}宫连接三方两宫及对宫</title>
          {trineConnections.map((connection) => (
            <line
              key={connection.toBranch}
              data-from-branch={connection.fromBranch}
              data-to-branch={connection.toBranch}
              x1={connection.from[0]}
              y1={connection.from[1]}
              x2={connection.to[0]}
              y2={connection.to[1]}
            />
          ))}
        </svg>
      )}
    </div>
  );
}
