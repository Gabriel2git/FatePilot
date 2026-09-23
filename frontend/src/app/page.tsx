﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AI_MODELS } from '@/lib/ai';
import { useZiweiData } from '@/hooks/useZiweiData';
import { useAIChat } from '@/hooks/useAIChat';
import { useSavedCases } from '@/hooks/useSavedCases';
import BirthForm from '@/components/BirthForm';
import ChartView from '@/components/ChartView';
import RagTest from '@/components/RagTest';
import AIFortuneTeller from '@/components/AIFortuneTeller';
import ModelLatencyTest from '@/components/ModelLatencyTest';

interface BirthData {
  birthday: string;
  birthTime: number;
  birthMinute: number;
  birthdayType: 'solar' | 'lunar';
  gender: 'male' | 'female';
  longitude: number;
  isLeap: boolean;
}

interface DecadalInfo {
  start: number;
  end: number;
  stem: string;
  branch: string;
}

export default function Home() {
  const [currentPage, setCurrentPage] = useState<'input' | 'chart' | 'ai' | 'rag' | 'model-test'>('input');
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0]);
  const [darkMode, setDarkMode] = useState(false);

  const [hasBirthData, setHasBirthData] = useState(false);
  const [birthData, setBirthData] = useState<BirthData | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [showSavedCases, setShowSavedCases] = useState(false);
  const [savedCasesOpen, setSavedCasesOpen] = useState(false);
  const [saveCaseOpen, setSaveCaseOpen] = useState(false);
  const [caseName, setCaseName] = useState('');
  const toolsMenuRef = useRef<HTMLDetailsElement>(null);
  const [selectedPalace, setSelectedPalace] = useState<any | null>(null);
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const [chartScope, setChartScope] = useState<'natal' | 'decadal' | 'yearly'>('natal');
  const [selectedDecadal, setSelectedDecadal] = useState<DecadalInfo | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const {
    ziweiData,
    isRefreshingData,
    contextStatus,
    horoscopeYear,
    error,
    loadZiweiData,
    updateHoroscopeYear,
    ensureZiweiContext,
    setError,
  } = useZiweiData();
  const selectedPeriod = chartScope === 'natal'
    ? '本命全盘'
    : chartScope === 'decadal'
      ? selectedDecadal
        ? `大限 ${selectedDecadal.start}–${selectedDecadal.end} 岁${selectedYear ? ` · 流年 ${selectedYear}` : ''}`
        : '大限待选择'
      : `流年 ${selectedYear || horoscopeYear}`;
  const readingContext = `${selectedPalace?.name || '全盘'} · ${selectedPeriod}`;
  const resolveCompleteZiweiData = useCallback(async () => {
    if (!birthData) return ziweiData;
    return ensureZiweiContext(birthData, horoscopeYear);
  }, [birthData, ensureZiweiContext, horoscopeYear, ziweiData]);
  const {
    messages,
    inputMessage,
    setInputMessage,
    isLoading,
    loadingStage,
    debugPrompt,
    setDebugPrompt,
    selectedPersona,
    setSelectedPersona,
    messagesEndRef,
    messagesContainerRef,
    initializeChat,
    updateChatForHoroscope,
    sendMessage,
    stopGeneration,
  } = useAIChat(ziweiData, horoscopeYear, resolveCompleteZiweiData, contextStatus, readingContext);
  const { savedCases, saveCase, deleteCase } = useSavedCases();

  useEffect(() => {
    const closeOnOutsidePointer = (event: PointerEvent) => {
      const toolsMenu = toolsMenuRef.current;
      if (toolsMenu?.open && (!event.target || !toolsMenu.contains(event.target as Node))) {
        toolsMenu.removeAttribute('open');
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') toolsMenuRef.current?.removeAttribute('open');
    };

    document.addEventListener('pointerdown', closeOnOutsidePointer);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  const toggleDarkMode = () => {
    const htmlElement = document.documentElement;
    const isDark = htmlElement.classList.toggle('dark');
    setDarkMode(isDark);
  };

  const handleDataLoaded = async (data: BirthData) => {
    setBirthData(data);
    setHasBirthData(false);
    setSelectedDecadal(null);
    setSelectedYear(null);
    setSelectedPalace(null);
    setChartScope('natal');
    setIsLoadingChart(true);
    setError(null);

    try {
      const realZiweiData = await loadZiweiData(data);
      initializeChat(realZiweiData, selectedPersona, '全盘 · 本命全盘');
      setHasBirthData(true);
      setCurrentPage('chart');
    } catch (err) {
      console.error('获取后端数据失败:', err);
    } finally {
      setIsLoadingChart(false);
    }
  };

  const handleHoroscopeYearChange = async (year: number) => {
    if (!birthData || isRefreshingData) return;
    if (year === horoscopeYear) return;

    setError(null);
    try {
      const realZiweiData = await updateHoroscopeYear(birthData, year);
      updateChatForHoroscope(realZiweiData);
    } catch (err) {
      console.error('更新命盘数据失败:', err);
    }
  };

  const handleSaveCurrentCase = () => {
    if (!birthData || !ziweiData) {
      alert('请先排盘后再保存命例');
      return;
    }

    setCaseName('');
    setSaveCaseOpen(true);
  };

  const confirmSaveCurrentCase = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!birthData || !ziweiData) return;
    const trimmedName = caseName.trim();
    if (!trimmedName) return;

    saveCase({
      id: Date.now().toString(),
      name: trimmedName,
      birthData,
      ziweiData,
      savedAt: new Date().toISOString(),
    });
    setSaveCaseOpen(false);
    setCaseName('');
  };

  const handleLoadSavedCase = async (caseData: any) => {
    setBirthData(caseData.birthData);
    setShowSavedCases(false);
    setSelectedDecadal(null);
    setSelectedYear(null);
    setSelectedPalace(null);
    setChartScope('natal');

    try {
      const realZiweiData = await loadZiweiData(caseData.birthData);
      initializeChat(realZiweiData, selectedPersona, '全盘 · 本命全盘');
      setHasBirthData(true);
      setCurrentPage('chart');
      alert('命例加载成功');
    } catch (err) {
      console.error('加载命例失败:', err);
      alert('加载命例失败，请重试');
    }
  };

  const handleDeleteSavedCase = (caseId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (window.confirm('确定要删除这个命例吗？')) {
      deleteCase(caseId);
      alert('命例删除成功');
    }
  };

  const handleTestAIPrompt = (savedCase: any) => {
    setBirthData(savedCase.birthData);
    setSelectedDecadal(null);
    setSelectedYear(null);
    setSelectedPalace(null);
    setChartScope('natal');
    setHasBirthData(true);
    setCurrentPage('ai');
    initializeChat(savedCase.ziweiData, selectedPersona, '全盘 · 本命全盘');
    setDebugPrompt('已载入命例并同步 Prompt，可直接提问。');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(selectedModel);
    }
  };

  const coreSteps = [
    { id: 'input', number: '1', label: '出生信息' },
    { id: 'chart', number: '2', label: '命盘' },
    { id: 'ai', number: '3', label: '命理解读' },
  ] as const;
  const navigateTo = (page: (typeof coreSteps)[number]['id']) => {
    if (page !== 'input' && !hasBirthData) {
      setCurrentPage('input');
      return;
    }
    setCurrentPage(page);
  };

  return (
    <div className={`fp-app ${currentPage === 'ai' ? 'fp-app-chat' : ''}`}>
      <header className="fp-topbar">
        <a className="fp-brand" href="#top" onClick={(event) => { event.preventDefault(); setCurrentPage('input'); }}>
          <span className="fp-brand-mark">命</span><span>FatePilot<small>ZIWEI · DESTINY COMPASS</small></span>
        </a>
        <nav className="fp-step-nav" aria-label="主要流程">
          {coreSteps.map((step, index) => (
            <div className="fp-step-wrap" key={step.id}>
              <button
                className={`fp-step ${currentPage === step.id ? 'active' : ''} ${hasBirthData && index < coreSteps.findIndex((item) => item.id === currentPage) ? 'complete' : ''}`}
                onClick={() => navigateTo(step.id)}
                aria-current={currentPage === step.id ? 'step' : undefined}
                aria-disabled={step.id !== 'input' && !hasBirthData}
              >
                <span className="fp-step-number">{hasBirthData && index === 0 ? '✓' : step.number}</span>{step.label}
              </button>
              {index < coreSteps.length - 1 && <span className="fp-step-divider" />}
            </div>
          ))}
        </nav>
        <div className="fp-top-tools">
          <button className="fp-top-link" onClick={() => setSavedCasesOpen(true)}>我的命例</button>
          <details className="fp-tools-menu" ref={toolsMenuRef}>
            <summary>工具</summary>
            <div className="fp-tools-popover">
              <button onClick={(event) => { setCurrentPage('model-test'); event.currentTarget.closest('details')?.removeAttribute('open'); }}>模型延迟测试</button>
              <button onClick={(event) => { setCurrentPage('rag'); event.currentTarget.closest('details')?.removeAttribute('open'); }}>知识库测试</button>
              {currentPage === 'ai' && <button onClick={(event) => { setShowDebug(true); event.currentTarget.closest('details')?.removeAttribute('open'); }}>调试提示词</button>}
            </div>
          </details>
          <button className="fp-theme-toggle" onClick={toggleDarkMode} aria-label={darkMode ? '切换到浅色模式' : '切换到深色模式'}>
            {darkMode ? '浅色' : '深色'}
          </button>
        </div>
      </header>

      <main className={`fp-main ${currentPage === 'ai' ? 'fp-main-ai' : ''}`}>
        {error && <div className="fp-error" role="alert">{error}</div>}

        {currentPage === 'input' && (
          <section className="fp-input-page">
            <div className="fp-eyebrow">START WITH YOUR BIRTH MOMENT</div>
            <h1>先从出生时刻，认识自己的节律</h1>
            <p className="fp-page-lead">完成排盘后，你可以查看十二宫位、选择人生阶段，再带着当前关注进入命理解读。</p>
            <div className="fp-input-layout">
              <section className="fp-input-card">
                <div className="fp-input-card-head"><strong>出生信息</strong><span>出生地用于真太阳时校正</span></div>
                <div className="fp-birth-form"><BirthForm onDataLoaded={handleDataLoaded} /></div>
                {isLoadingChart && <div className="fp-loading-note">正在生成命盘与运限信息…</div>}
              </section>
              <aside className="fp-flow-card">
                <h2>接下来会发生什么</h2>
                <p>整段体验围绕同一张命盘展开。</p>
                <div className="fp-flow-item"><i>1</i><div><strong>输入出生时刻</strong><small>选择历法、出生时间、地点与性别。</small></div></div>
                <div className="fp-flow-item"><i>2</i><div><strong>查看十二宫命盘</strong><small>点选宫位查看星曜与宫位主题。</small></div></div>
                <div className="fp-flow-item"><i>3</i><div><strong>选大限 / 流年，再开始解读</strong><small>AI 会收到你当前查看的运限与宫位。</small></div></div>
                <div className="fp-flow-note">命盘页负责看结构与选时间；命理解读页负责围绕当前上下文继续对话。</div>
              </aside>
            </div>
          </section>
        )}

        {currentPage === 'chart' && (
          <ChartView
            ziweiData={ziweiData}
            birthData={birthData}
            selectedDecadal={selectedDecadal}
            setSelectedDecadal={setSelectedDecadal}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            savedCases={savedCases}
            showSavedCases={showSavedCases}
            setShowSavedCases={setShowSavedCases}
            onSaveCase={handleSaveCurrentCase}
            onLoadCase={handleLoadSavedCase}
            onDeleteCase={handleDeleteSavedCase}
            onYearChange={handleHoroscopeYearChange}
            onTestAIPrompt={handleTestAIPrompt}
            horoscopeYear={horoscopeYear}
            isRefreshingData={isRefreshingData}
            selectedPalace={selectedPalace}
            setSelectedPalace={setSelectedPalace}
            onStartReading={() => setCurrentPage('ai')}
            scope={chartScope}
            setScope={setChartScope}
          />
        )}

        {currentPage === 'ai' && (
          <AIFortuneTeller
            messages={messages}
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            isLoading={isLoading}
            loadingStage={loadingStage}
            contextStatus={contextStatus}
            debugPrompt={debugPrompt}
            showDebug={showDebug}
            setShowDebug={setShowDebug}
            selectedModel={selectedModel}
            hasBirthData={hasBirthData}
            birthData={birthData}
            messagesEndRef={messagesEndRef}
            messagesContainerRef={messagesContainerRef}
            onSendMessage={() => sendMessage(selectedModel)}
            onKeyPress={handleKeyPress}
            selectedPersona={selectedPersona}
            onPersonaChange={setSelectedPersona}
            ziweiData={ziweiData}
            initializeChat={initializeChat}
            stopGeneration={stopGeneration}
            readingContext={readingContext}
            onBackToChart={() => setCurrentPage('chart')}
            onSelectedModelChange={setSelectedModel}
          />
        )}

        {currentPage === 'rag' && <RagTest onBack={() => setCurrentPage('ai')} />}
        {currentPage === 'model-test' && <div className="fp-utility-page"><button className="fp-secondary-button" onClick={() => setCurrentPage('ai')}>← 返回命理解读</button><ModelLatencyTest /></div>}
      </main>

      {savedCasesOpen && (
        <div className="fp-modal-backdrop" onClick={() => setSavedCasesOpen(false)}>
          <section className="fp-saved-modal" role="dialog" aria-modal="true" aria-labelledby="saved-cases-title" onClick={(event) => event.stopPropagation()}>
            <div className="fp-modal-heading"><div><div className="fp-eyebrow">YOUR SAVED CHARTS</div><h2 id="saved-cases-title">我的命例</h2></div><button className="fp-modal-close" onClick={() => setSavedCasesOpen(false)} aria-label="关闭">×</button></div>
            {savedCases.length === 0 ? <p className="fp-empty-cases">还没有保存的命例。排盘后可以在命盘页保存。</p> : (
              <div className="fp-saved-list">
                {savedCases.map((savedCase) => (
                  <div className="fp-saved-item" key={savedCase.id}>
                    <div><div className="fp-saved-name">{savedCase.name}</div><div className="fp-saved-meta">{savedCase.birthData.birthday} · {savedCase.birthData.gender === 'male' ? '男' : '女'}</div></div>
                    <div className="fp-saved-actions">
                      <button className="fp-primary-button" onClick={() => { setSavedCasesOpen(false); void handleLoadSavedCase(savedCase); }}>载入命例</button>
                      <button className="fp-danger-button" onClick={(event) => handleDeleteSavedCase(savedCase.id, event)}>删除</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {saveCaseOpen && (
        <div className="fp-modal-backdrop" onClick={() => setSaveCaseOpen(false)}>
          <section className="fp-saved-modal fp-save-case-modal" role="dialog" aria-modal="true" aria-labelledby="save-case-title" onClick={(event) => event.stopPropagation()}>
            <div className="fp-modal-heading">
              <div><div className="fp-eyebrow">SAVE YOUR CHART</div><h2 id="save-case-title">保存命例</h2></div>
              <button className="fp-modal-close" onClick={() => setSaveCaseOpen(false)} aria-label="关闭">×</button>
            </div>
            <p className="fp-save-case-hint">为这张命盘起一个容易辨认的名称。</p>
            <form onSubmit={confirmSaveCurrentCase}>
              <label className="fp-save-case-label" htmlFor="saved-case-name">命例名称</label>
              <input
                autoFocus
                id="saved-case-name"
                className="fp-save-case-input"
                value={caseName}
                onChange={(event) => setCaseName(event.target.value)}
                placeholder="例如：自己、家人或客户"
                maxLength={40}
                required
              />
              <div className="fp-save-case-actions">
                <button type="button" className="fp-secondary-button" onClick={() => setSaveCaseOpen(false)}>取消</button>
                <button type="submit" className="fp-primary-button">保存命例</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
