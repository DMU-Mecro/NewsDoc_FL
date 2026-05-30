import { Sun, Moon } from 'lucide-react';

export default function ThemeSettings({ theme, setTheme }) {
  return (
    <div className="bg-white dark:bg-[#0b1324] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 transition-colors duration-300 shadow-sm dark:shadow-none">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-300 mb-4 flex items-center gap-2">
        {theme === 'dark' ? <Moon className="w-4 h-4 text-purple-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
        디스플레이 테마 스위치 (현재: {theme.toUpperCase()})
      </h3>
      <div className="flex gap-4">
        <button
          onClick={() => setTheme('light')}
          className={`flex-1 p-4 rounded-xl border text-center font-medium text-sm transition-all flex items-center justify-center gap-2 ${
            theme === 'light' ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-500 font-bold shadow-sm' : 'bg-slate-50 dark:bg-[#0d172a] border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <Sun className="w-4 h-4" /> 라이트 모드
        </button>
        <button
          onClick={() => setTheme('dark')}
          className={`flex-1 p-4 rounded-xl border text-center font-medium text-sm transition-all flex items-center justify-center gap-2 ${
            theme === 'dark' ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400 font-bold shadow-sm' : 'bg-slate-50 dark:bg-[#0d172a] border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <Moon className="w-4 h-4" /> 다크 모드
        </button>
      </div>
    </div>
  );
}