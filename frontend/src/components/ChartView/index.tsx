﻿﻿﻿﻿﻿﻿import { useMemo, useRef } from 'react';
import html2canvas from 'html2canvas';
import ZiweiChart from '@/components/ZiweiChart';

interface BirthData {
  birthday: string;
  birthTime: number;
  birthMinute: number;
  birthdayType: 'solar' | 'lunar';
  gender: 'male' | 'female';
  longitude: number;
}

interface DecadalInfo {
  start: number;
  end: number;
  stem: string;
  branch: string;
}

interface SavedCase {
  id: string;
  name: string;
  birthData: BirthData;
  ziweiData: any;
  savedAt: string;
}

interface ChartViewProps {
  ziweiData: any;
  birthData: BirthData | null;
  selectedDecadal: DecadalInfo | null;
  setSelectedDecadal: (decadal: DecadalInfo | null) => void;
  selectedYear: number | null;
  setSelectedYear: (year: number | null) => void;
  savedCases: SavedCase[];
  showSavedCases: boolean;
  setShowSavedCases: (show: boolean) => void;
  onSaveCase: () => void;
  onLoadCase: (caseData: SavedCase) => void;
  onDeleteCase: (caseId: string, event: React.MouseEvent) => void;
  onYearChange?: (year: number) => void;
  onTestAIPrompt?: (savedCase: SavedCase) => void;
  horoscopeYear: number;
  isRefreshingData: boolean;
  selectedPalace: any | null;
  setSelectedPalace: (palace: any | null) => void;
  onStartReading: () => void;
  scope: 'natal' | 'decadal' | 'yearly';
  setScope: (scope: 'natal' | 'decadal' | 'yearly') => void;
}

function getDecadalStartYear(targetYear: number, currentNominalAge: number, decadalStartAge: number): number {
  return targetYear - (currentNominalAge - decadalStartAge);
}

export default function ChartView({
  ziweiData,
  birthData,
  selectedDecadal,
  setSelectedDecadal,
  selectedYear,
  setSelectedYear,
  savedCases,
  showSavedCases,
  setShowSavedCases,
  onSaveCase,
  onLoadCase,
  onDeleteCase,
  onYearChange,
  onTestAIPrompt,
  horoscopeYear,
  isRefreshingData,
  selectedPalace,
  setSelectedPalace,
  onStartReading,
  scope,
  setScope,
}: ChartViewProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  const decadalButtons = useMemo(() => {
    const palaces = ziweiData?.astrolabe?.palaces || [];
    return palaces
      .filter((palace: any) => Array.isArray(palace?.decadal?.range) && palace.decadal.range.length === 2)
      .map((palace: any) => ({
        start: Number(palace.decadal.range[0]),
        end: Number(palace.decadal.range[1]),
        stem: palace.heavenlyStem || '',
        branch: palace.earthlyBranch || '',
        name: palace.name || '',
      }))
      .sort((a: any, b: any) => a.start - b.start);
  }, [ziweiData?.astrolabe?.palaces]);

  const handleExportChart = async () => {
    if (!chartRef.current) return;

    try {
      const canvas = await html2canvas(chartRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `紫微命盘_${birthData?.birthday || Date.now()}.png`;
      link.click();
    } catch (error) {
      console.error('导出命盘失败:', error);
      alert('导出命盘失败，请重试');
    }
  };

  const handleSelectDecadal = (item: any) => {
    if (!ziweiData?.horoscope?.age?.nominalAge || !ziweiData?.targetYear) {
      return;
    }

    const decadalInfo: DecadalInfo = {
      start: item.start,
      end: item.end,
      stem: item.stem,
      branch: item.branch,
    };

    if (selectedDecadal && selectedDecadal.start === decadalInfo.start) {
      setSelectedDecadal(null);
      setSelectedYear(null);
      setScope('natal');
      onYearChange?.(new Date().getFullYear());
      return;
    }

    setSelectedDecadal(decadalInfo);
    setScope('decadal');

    const firstYear = getDecadalStartYear(
      Number(ziweiData.targetYear),
      Number(ziweiData.horoscope.age.nominalAge),
      Number(decadalInfo.start),
    );
    setSelectedYear(firstYear);
    onYearChange?.(firstYear);
  };

  const yearsOfSelectedDecadal = useMemo(() => {
    if (!selectedDecadal || !ziweiData?.horoscope?.age?.nominalAge || !ziweiData?.targetYear) {
      return [] as number[];
    }

    const startYear = getDecadalStartYear(
      Number(ziweiData.targetYear),
      Number(ziweiData.horoscope.age.nominalAge),
      Number(selectedDecadal.start),
    );

    const totalYears = Number(selectedDecadal.end) - Number(selectedDecadal.start) + 1;
    return Array.from({ length: Math.max(totalYears, 0) }, (_, index) => startYear + index);
  }, [selectedDecadal, ziweiData?.horoscope?.age?.nominalAge, ziweiData?.targetYear]);

  const activePalace =
    selectedPalace || ziweiData?.astrolabe?.palaces?.find((palace: any) => palace.name === '命宫') || null;
  const yearlyOptions = selectedDecadal
    ? yearsOfSelectedDecadal
    : Array.from({ length: 5 }, (_, index) => horoscopeYear - 2 + index);
  const readingPeriod = selectedDecadal
    ? `${selectedDecadal.start}–${selectedDecadal.end}岁大限${selectedYear ? ` · ${selectedYear}年流年` : ''}`
    : `${selectedYear || horoscopeYear}年流年`;
  const majorStars = (activePalace?.majorStars || []).map((star: any) => star.name).filter(Boolean).join('、');
  const minorStars = (activePalace?.minorStars || []).slice(0, 4).map((star: any) => star.name).filter(Boolean).join('、');

  return (
    <div className="fp-chart-page">
      {ziweiData && birthData ? (
        <>
          <div className="fp-chart-heading">
            <div>
              <div className="fp-eyebrow">YOUR NATAL CHART</div>
              <h1>命盘总览</h1>
              <div className="fp-birth-summary">
                <strong>{birthData.gender === 'male' ? '男命' : '女命'}</strong>
                <span>{birthData.birthdayType === 'lunar' ? '农历' : '公历'} {birthData.birthday}</span>
                <span>{birthData.birthTime}时 {String(birthData.birthMinute).padStart(2, '0')}分</span>
                <span>命盘已生成</span>
              </div>
            </div>
            <div className="fp-chart-actions">
              <button className="fp-secondary-button" onClick={() => setShowSavedCases(!showSavedCases)}>
                我的命例 ({savedCases.length})
              </button>
              <button className="fp-secondary-button" onClick={handleExportChart}>导出命盘</button>
              <button className="fp-primary-button" onClick={onSaveCase}>保存命例</button>
            </div>
          </div>

          <div className="fp-chart-layout">
          <section className="fp-chart-card">
            <div className="fp-chart-card-head">
              <div>
                <strong>十二宫位</strong>
                <span>点击宫位，查看星曜与主题</span>
              </div>
              {isRefreshingData && <span className="fp-refreshing">正在更新运限…</span>}
            </div>
            <div className="fp-scope-tabs" role="tablist" aria-label="选择命盘范围">
                <button className={scope === 'natal' ? 'active' : ''} onClick={() => {
                setScope('natal');
                setSelectedDecadal(null);
                setSelectedYear(null);
                onYearChange?.(new Date().getFullYear());
              }}>本命</button>
              <button className={scope === 'decadal' ? 'active' : ''} onClick={() => setScope('decadal')}>大限</button>
              <button className={scope === 'yearly' ? 'active' : ''} onClick={() => setScope('yearly')}>流年</button>
              <span>{scope === 'natal' ? '本命结构' : selectedDecadal ? `${selectedDecadal.start}–${selectedDecadal.end} 岁` : `${selectedYear || horoscopeYear} 年`}</span>
            </div>

            {scope === 'decadal' && (
              <div className="fp-period-options" aria-label="选择大限">
                {decadalButtons.map((item: any) => (
                  <button
                    key={`${item.stem}${item.branch}-${item.start}`}
                    onClick={() => handleSelectDecadal(item)}
                    className={selectedDecadal?.start === item.start ? 'active' : ''}
                    aria-pressed={selectedDecadal?.start === item.start}
                    title={`${item.name} ${item.stem}${item.branch}`}
                  >{item.start}–{item.end} 岁</button>
                ))}
                {decadalButtons.length === 0 && <span>当前命盘没有可用的大限数据</span>}
              </div>
            )}

            {scope === 'yearly' && (
              <div className="fp-period-options" aria-label="选择流年">
                {yearlyOptions.map((year) => (
                  <button
                    key={year}
                    onClick={() => {
                      if (selectedYear === year || isRefreshingData) return;
                      setScope('yearly');
                      setSelectedYear(year);
                      onYearChange?.(year);
                    }}
                    className={(selectedYear || horoscopeYear) === year ? 'active' : ''}
                    aria-pressed={(selectedYear || horoscopeYear) === year}
                  >{year} 年</button>
                ))}
              </div>
            )}

            <div className="fp-chart-grid-wrap" ref={chartRef}>
              <ZiweiChart
                ziweiData={{
                  astrolabe: ziweiData?.astrolabe,
                  horoscope: scope === 'natal' ? undefined : ziweiData?.horoscope,
                }}
                selectedPalace={activePalace?.name || null}
                onSelectPalace={setSelectedPalace}
              />
            </div>
            <div className="fp-chart-legend"><span><i className="fp-dot-red" />流年宫位</span><span><i className="fp-dot-gold" />大限宫位</span><span>四化标记随运限同步变化</span></div>
          </section>

          <aside className="fp-palace-detail">
            <div className="fp-detail-eyebrow">PALACE DETAIL</div>
            <h2>{activePalace?.name || '宫位详情'}</h2>
            {activePalace ? (
              <>
                <p className="fp-detail-branch">{activePalace.heavenlyStem}{activePalace.earthlyBranch} · {activePalace.decadal?.range?.[0]}–{activePalace.decadal?.range?.[1]} 岁</p>
                <div className="fp-detail-block"><small>主星</small><strong>{majorStars || '暂无主星'}</strong></div>
                <div className="fp-detail-block"><small>辅曜与杂曜</small><strong>{minorStars || '暂无辅曜'}</strong></div>
                <p className="fp-detail-copy">点击其他宫位切换关注焦点。进入命理解读后，AI 会围绕当前宫位和所选运限继续分析。</p>
              </>
            ) : <p className="fp-detail-copy">选择命盘中的宫位，查看对应星曜信息。</p>}
            <div className="fp-detail-context"><small>当前解读范围</small><strong>{scope === 'natal' ? '本命全盘' : readingPeriod}</strong></div>
          </aside>
          </div>

          <div className="fp-ai-bridge">
            <div><small>下一步</small><strong>带着当前命盘与关注点，开始命理解读</strong><span>{activePalace?.name || '全盘'} · {scope === 'natal' ? '本命结构' : readingPeriod}</span></div>
            <button onClick={onStartReading}>开始命理解读&nbsp; →</button>
          </div>

          {showSavedCases && (
              <div className="fp-saved-cases">
                <h3>我的命例</h3>
                {savedCases.length === 0 ? (
                  <p className="fp-empty-cases">暂无保存的命例</p>
                ) : (
                  <div className="fp-saved-list">
                    {savedCases.map((savedCase) => (
                      <div
                        key={savedCase.id}
                        onClick={() => onLoadCase(savedCase)}
                        className="fp-saved-item"
                      >
                        <div>
                          <div className="fp-saved-name">{savedCase.name}</div>
                          <div className="fp-saved-meta">
                            {savedCase.birthData.birthday} | {savedCase.birthData.gender === 'male' ? '男' : '女'}
                          </div>
                        </div>
                        <div className="fp-saved-actions">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onTestAIPrompt?.(savedCase);
                            }}
                            className="fp-secondary-button"
                            title="将命例数据作为 Prompt 发送给 AI 进行测试"
                          >
                            测试AI
                          </button>
                          <button
                            onClick={(e) => onDeleteCase(savedCase.id, e)}
                            className="fp-danger-button"
                          >
                            删除
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
        </>
      ) : (
        <div className="fp-empty-chart"><h2>还没有命盘</h2><p>先填写出生信息，完成排盘后就能查看十二宫和运限。</p></div>
      )}
    </div>
  );
}
