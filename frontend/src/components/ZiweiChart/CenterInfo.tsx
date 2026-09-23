﻿﻿﻿﻿﻿﻿﻿import React from 'react';

interface CenterInfoProps {
  astrolabe: any;
  horoscope?: any;
}

export default function CenterInfo({ astrolabe, horoscope }: CenterInfoProps) {
  return (
    <div className="fp-chart-center w-full h-full p-1 sm:p-4 flex flex-col items-center justify-center border-2 border-double border-[#d8ccb7]">
      <h2
        className="text-[8px] sm:text-base font-bold text-[#5b5142] tracking-widest mb-1 sm:mb-4"
        style={{ fontFamily: 'SimSun, serif' }}
      >
        紫微斗数
      </h2>

      <div className="bg-[#eee5d2] text-[#806b43] px-1 py-0.5 rounded-full text-[8px] sm:text-sm font-bold mb-1 sm:mb-4">
        {astrolabe.chineseDate}
      </div>

      <div className="space-y-0.5 sm:space-y-2 text-[8px] sm:text-sm text-[#68685f] text-center">
        <p>
          公历：{astrolabe.solarDate} {astrolabe.timeRange}
        </p>
        <p>
          农历：{astrolabe.lunarDate} {astrolabe.time}
        </p>

        <div className="w-8 sm:w-16 h-px bg-[#d8ccb7] mx-auto my-1 sm:my-2" />

        <div className="flex gap-2 justify-center">
          <span>
            命主：<span className="font-bold text-[#a44135]">{astrolabe.soul}</span>
          </span>
          <span>
            身主：<span className="font-bold text-[#a58a58]">{astrolabe.body}</span>
          </span>
        </div>
        <p>五行局：{astrolabe.fiveElementsClass}</p>

        {horoscope?.age && (
          <p className="mt-4 text-[#a44135] font-bold">当前推演虚岁：{horoscope.age.nominalAge} 岁</p>
        )}
      </div>
    </div>
  );
}
