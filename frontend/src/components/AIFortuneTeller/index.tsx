﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿'use client';

import React from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import AIChat from '@/components/AIChat';
import { AI_MODELS, PersonaType } from '@/lib/ai';
import type { ContextStatus } from '@/types';

interface AIFortuneTellerProps {
  messages: any[];
  inputMessage: string;
  setInputMessage: (msg: string) => void;
  isLoading: boolean;
  loadingStage: 'context' | 'model';
  contextStatus: ContextStatus;
  debugPrompt: string;
  showDebug: boolean;
  setShowDebug: (show: boolean) => void;
  selectedModel: string;
  hasBirthData: boolean;
  birthData: any;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  messagesContainerRef: React.RefObject<HTMLDivElement>;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  selectedPersona: PersonaType;
  onPersonaChange: (persona: PersonaType) => void;
  ziweiData: any;
  initializeChat: (ziweiData: any, persona?: PersonaType) => void;
  stopGeneration: () => void;
  readingContext?: string;
  onBackToChart?: () => void;
  onSelectedModelChange?: (model: string) => void;
}

function AIFortuneTellerContent({
  messages,
  inputMessage,
  setInputMessage,
  isLoading,
  loadingStage,
  contextStatus,
  debugPrompt,
  showDebug,
  setShowDebug,
  selectedModel,
  hasBirthData,
  birthData,
  messagesEndRef,
  messagesContainerRef,
  onSendMessage,
  onKeyPress,
  selectedPersona,
  onPersonaChange,
  ziweiData,
  initializeChat,
  stopGeneration,
  readingContext = '本命全盘',
  onBackToChart,
  onSelectedModelChange,
}: AIFortuneTellerProps) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <AuthGuard>{null}</AuthGuard>;
  }

  return (
    <div className="fp-ai-page">
      <div className="fp-ai-page-heading">
        <div>
          <div className="fp-eyebrow">A CONVERSATION GROUNDED IN YOUR CHART</div>
          <h1>命理解读</h1>
          <p>已带入：{readingContext}</p>
        </div>
        <div className="fp-ai-heading-actions">
          <label htmlFor="ai-model-select">解读模型</label>
          <select id="ai-model-select" value={selectedModel} onChange={(event) => onSelectedModelChange?.(event.target.value)}>
            {AI_MODELS.map((model) => <option key={model} value={model}>{model}</option>)}
          </select>
          {onBackToChart && <button className="fp-secondary-button" onClick={onBackToChart}>返回命盘</button>}
        </div>
      </div>
      <div className="fp-ai-contextbar">
        <div><span className="fp-context-seal">解</span><span><strong>你的命盘已就绪</strong><small>AI 会结合出生资料、十二宫和当前运限回答</small></span></div>
        <div className="fp-persona-control">
          <span>解读风格</span>
          {([
            ['companion', '温和陪伴'],
            ['mentor', '结构分析'],
            ['healer', '行动建议'],
          ] as const).map(([persona, label]) => (
            <button
              key={persona}
              className={selectedPersona === persona ? 'active' : ''}
              onClick={() => {
                if (selectedPersona === persona) return;
                if (messages.filter((message) => message.role !== 'system').length > 1 && !confirm('切换解读风格会重新开始当前对话，是否继续？')) return;
                onPersonaChange(persona);
                if (ziweiData) initializeChat(ziweiData, persona);
              }}
            >{label}</button>
          ))}
        </div>
      </div>
      <div className="fp-ai-chat-area">
        <AIChat
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
          onSendMessage={onSendMessage}
          onKeyPress={onKeyPress}
          stopGeneration={stopGeneration}
        />
      </div>
    </div>
  );
}

export default function AIFortuneTeller(props: AIFortuneTellerProps) {
  return (
    <AuthProvider>
      <AIFortuneTellerContent {...props} />
    </AuthProvider>
  );
}
