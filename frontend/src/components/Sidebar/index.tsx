import BirthForm from '@/components/BirthForm';
import { AI_MODELS } from '@/lib/ai';

export type PageType = 'chart' | 'ai' | 'rag';

interface SidebarProps {
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  onDataLoaded: (data: any) => void;
}

export default function Sidebar({
  currentPage,
  setCurrentPage,
  selectedModel,
  setSelectedModel,
  darkMode,
  toggleDarkMode,
  onDataLoaded,
}: SidebarProps) {
  return (
    <aside className="w-full bg-white dark:bg-[#1a2a2a] shadow-xl p-4 lg:p-5 flex flex-col h-full overflow-y-auto">
      <div className="hidden md:flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold text-purple-700 dark:text-purple-400">AI 紫微斗数 Pro</h1>
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          aria-label={darkMode ? '切换到浅色模式' : '切换到深色模式'}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>

      <div className="mb-4 md:mb-5">
        <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-wide">菜单</h2>
      </div>

      <div className="hidden md:block mb-4 space-y-2">
        <button
          onClick={() => setCurrentPage('chart')}
          className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
            currentPage === 'chart'
              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 font-semibold'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          命盘显示
        </button>
        <button
          onClick={() => setCurrentPage('ai')}
          className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
            currentPage === 'ai'
              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 font-semibold'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          AI 命理师
        </button>
        <button
          onClick={() => setCurrentPage('rag')}
          className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
            currentPage === 'rag'
              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 font-semibold'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          RAG 测试
        </button>
      </div>

      <div className="mb-6 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 p-3 text-xs text-gray-700 dark:text-gray-200 leading-5">
        <p className="font-bold mb-1">快速上手</p>
        <p>1. 点击菜单进入设置。</p>
        <p>2. 输入出生信息并点击开始排盘。</p>
        <p>3. 在命盘页点击大限/流年观察边框变化。</p>
        <p>4. 切到 AI 命理师页面开始提问。</p>
      </div>

      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">AI 模型</h2>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="w-full p-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
        >
          {AI_MODELS.map((model) => (
            <option key={model} value={model} className="text-gray-900 dark:text-gray-100">
              {model}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto">
        <BirthForm
          onDataLoaded={(data) => {
            onDataLoaded(data);
            setCurrentPage('chart');
          }}
        />
      </div>
    </aside>
  );
}
