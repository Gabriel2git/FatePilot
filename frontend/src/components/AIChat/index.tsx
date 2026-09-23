import { useEffect, useMemo, useState } from 'react';
import { Message } from '@/lib/ai';
import type { ContextStatus } from '@/types';

interface BirthData {
  birthday: string;
  birthTime: number;
  birthMinute: number;
  birthdayType: 'solar' | 'lunar';
  gender: 'male' | 'female';
  longitude: number;
}

interface AIChatProps {
  messages: Message[];
  inputMessage: string;
  setInputMessage: (message: string) => void;
  isLoading: boolean;
  loadingStage: 'context' | 'model';
  contextStatus: ContextStatus;
  debugPrompt: string;
  showDebug: boolean;
  setShowDebug: (show: boolean) => void;
  selectedModel: string;
  hasBirthData: boolean;
  birthData: BirthData | null;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  messagesContainerRef: React.RefObject<HTMLDivElement>;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  stopGeneration: () => void;
}

const LOADING_TEXTS = ['正在排布宫位星曜', '正在推演大限流年', '正在整合命盘建议', '正在润色可执行结论'];

export default function AIChat({
  messages,
  inputMessage,
  setInputMessage,
  isLoading,
  loadingStage,
  contextStatus,
  debugPrompt,
  showDebug,
  setShowDebug,
  hasBirthData,
  messagesEndRef,
  messagesContainerRef,
  onSendMessage,
  onKeyPress,
  stopGeneration,
}: AIChatProps) {
  const [autoFollow, setAutoFollow] = useState(true);
  const [showJumpToBottom, setShowJumpToBottom] = useState(false);
  const [waitingSeconds, setWaitingSeconds] = useState(0);

  const loadingText = useMemo(() => {
    if (loadingStage === 'context') {
      return '正在准备完整命盘上下文';
    }
    return LOADING_TEXTS[waitingSeconds % LOADING_TEXTS.length];
  }, [loadingStage, waitingSeconds]);

  const scrollToBottom = () => {
    if (!messagesContainerRef.current) return;
    const container = messagesContainerRef.current;
    container.scrollTop = container.scrollHeight;
  };

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const container = messagesContainerRef.current;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    const nearBottom = distanceFromBottom < 120;

    if (nearBottom) {
      setAutoFollow(true);
      setShowJumpToBottom(false);
    } else {
      setAutoFollow(false);
      setShowJumpToBottom(true);
    }
  };

  useEffect(() => {
    if (autoFollow) {
      scrollToBottom();
    }
  }, [messages, autoFollow]);

  useEffect(() => {
    if (!isLoading) {
      setWaitingSeconds(0);
      return;
    }

    const timer = window.setInterval(() => {
      setWaitingSeconds((prev) => prev + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isLoading]);

  return (
    <div className="fp-chat-panel h-full min-h-0 flex flex-col relative">
      <div className="fp-chat-heading flex justify-between items-center mb-2 sm:mb-4">
        <h2 className="text-sm sm:text-xl font-bold text-gray-900 dark:text-gray-100">AI 命理师</h2>
        <div className="flex gap-2 items-center">
          <span
            className={`hidden sm:inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${
              contextStatus === 'ready'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                : contextStatus === 'loading'
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                  : contextStatus === 'error'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            {contextStatus === 'ready'
              ? 'AI上下文已就绪'
              : contextStatus === 'loading'
                ? 'AI上下文预热中'
                : contextStatus === 'error'
                  ? 'AI上下文加载失败'
                  : '等待命盘数据'}
          </span>

          {isLoading && (
            <button
              onClick={stopGeneration}
              className="px-2 py-0.5 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors flex items-center gap-1"
            >
              <span>⏹️</span>
              <span>终止</span>
            </button>
          )}
        </div>
      </div>

      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="fp-chat-transcript flex-1 min-h-0 overflow-y-auto overscroll-contain show-scrollbar mb-2 sm:mb-4 relative"
      >
        {messages.length === 0 ? (
          <div className="fp-chat-empty flex items-center justify-center h-full">
            <p>先完成出生信息并排盘，再围绕当前命盘开始对话。</p>
          </div>
        ) : (
          <div className="fp-chat-thread space-y-4">
            {messages
              .filter((message) => message.role !== 'system')
              .map((message, index) => (
                <div key={index} className={`fp-chat-row ${message.role === 'user' ? 'is-user' : 'is-assistant'}`}>
                  {message.role !== 'user' && <span className="fp-chat-avatar" aria-hidden="true">解</span>}
                  <article className={`fp-chat-bubble ${message.role === 'user' ? 'fp-chat-bubble-user' : 'fp-chat-bubble-assistant'}`}>
                    {message.role !== 'user' && <div className="fp-chat-speaker">命盘解读</div>}
                    <div className="fp-chat-message whitespace-pre-wrap">{message.content}</div>
                  </article>
                  {message.role === 'user' && <span className="fp-chat-user-mark" aria-hidden="true">我</span>}
                </div>
              ))}

            {messages.filter((message) => message.role !== 'system').length === 1 && !isLoading && (
              <div className="fp-chat-starters" aria-label="建议问题">
                {[
                  '先整体看看我的命盘特点',
                  '我当前的大限最值得关注什么？',
                  '结合本命和流年，给我一个行动建议',
                ].map((question) => (
                  <button key={question} onClick={() => setInputMessage(question)}>{question}</button>
                ))}
              </div>
            )}

            {isLoading && (
              <div className="fp-chat-row is-assistant">
                <span className="fp-chat-avatar" aria-hidden="true">解</span>
                <div className="fp-chat-loading p-3 sm:p-4 min-w-[180px]">
                  <div className="flex items-center gap-3">
                    <div className="relative w-6 h-6">
                      <div className="fp-chat-spinner-track absolute inset-0 rounded-full border-2" />
                      <div className="fp-chat-spinner absolute inset-0 rounded-full border-2 border-transparent animate-spin" />
                      <div className="fp-chat-spinner-core absolute inset-1 rounded-full animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <div className="fp-chat-loading-title text-xs sm:text-sm font-semibold">{loadingText}</div>
                      <div className="fp-chat-loading-time text-[11px] mt-1">已等待 {waitingSeconds}s</div>
                    </div>
                  </div>
                  <div className="flex gap-1 mt-3">
                    <div className="fp-chat-loading-dot w-1.5 h-1.5 rounded-full animate-bounce" />
                    <div className="fp-chat-loading-dot w-1.5 h-1.5 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="fp-chat-loading-dot w-1.5 h-1.5 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {showJumpToBottom && (
          <button
            onClick={() => {
              setAutoFollow(true);
              setShowJumpToBottom(false);
              scrollToBottom();
            }}
            className="fp-chat-jump absolute bottom-3 right-3 px-3 py-1.5 text-xs rounded-full transition-colors"
          >
            回到底部
          </button>
        )}
      </div>

      <div className="fp-chat-composer p-2 sm:p-3">
        <div className="flex gap-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={onKeyPress}
            placeholder="请输入您的问题..."
            disabled={isLoading || !hasBirthData}
            className="fp-chat-input flex-1 p-2 resize-none text-sm focus:outline-none disabled:cursor-not-allowed"
            rows={2}
          />
          <button
            onClick={onSendMessage}
            disabled={isLoading || !inputMessage.trim() || !hasBirthData}
            className="fp-chat-send px-3 py-2 text-sm font-medium disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? '生成中...' : '发送'}
          </button>
        </div>
        {!hasBirthData && (
            <p className="fp-chat-hint text-xs mt-2 text-center">请先完成出生信息并排盘</p>
        )}
      </div>

      {showDebug && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 text-green-400 rounded-lg text-xs font-mono max-w-4xl w-full max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="font-bold">系统提示词</h3>
              <button onClick={() => setShowDebug(false)} className="text-gray-400 hover:text-white">
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <pre>{debugPrompt}</pre>
            </div>
            <div className="p-4 border-t border-gray-700 flex justify-end">
              <button
                onClick={() => setShowDebug(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
