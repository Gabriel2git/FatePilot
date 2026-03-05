import { useState, useRef } from 'react';

interface RagTestProps {
  onBack: () => void;
}

interface SearchResult {
  text: string;
  relevance_score: number;
  document: {
    fileName: string;
    category: string;
    filePath: string;
  };
  chunk: string;
}

interface RagTestResponse {
  results: SearchResult[];
  context: string;
  prompt: string;
}

export default function RagTest({ onBack }: RagTestProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [context, setContext] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('请输入查询内容');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/rag/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          topK: 3,
        }),
      });

      if (!response.ok) {
        throw new Error('API调用失败');
      }

      const data: RagTestResponse = await response.json();
      setResults(data.results);
      setContext(data.context);
      setPrompt(data.prompt);
    } catch (err) {
      setError('查询失败，请稍后重试');
      console.error('RAG测试失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors mr-4"
          >
            ← 返回
          </button>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">🔍 RAG 测试窗口</h2>
        </div>
      </div>

      {/* 输入区 */}
      <div className="bg-white dark:bg-[#1a2a2a] rounded-2xl shadow-2xl p-4 mb-4">
        <div className="flex gap-2">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="请输入您的问题..."
            disabled={isLoading}
            className="flex-1 p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none resize-none text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
            rows={3}
          />
          <button
            onClick={handleSearch}
            disabled={isLoading || !query.trim()}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-bold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '查询中...' : '查询'}
          </button>
        </div>
        {error && (
          <p className="text-xs text-red-500 mt-2 text-center">
            {error}
          </p>
        )}
      </div>

      {/* 结果展示区 */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-[#1a2a2a] rounded-2xl shadow-2xl p-6">
        {results.length > 0 ? (
          <div className="space-y-6">
            {/* 检索结果 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">检索结果</h3>
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {result.document.fileName}
                      </h4>
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                        相关性: {result.relevance_score?.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                      {result.text.substring(0, 200)}...
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 上下文 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">生成的上下文</h3>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                <pre className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                  {context}
                </pre>
              </div>
            </div>

            {/* 生成的Prompt */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">生成的Prompt</h3>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                <pre className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                  {prompt}
                </pre>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <p>请输入问题并点击查询按钮</p>
          </div>
        )}
      </div>
    </div>
  );
}
