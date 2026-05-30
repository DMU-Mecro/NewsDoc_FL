import { Eye } from 'lucide-react';

export default function PersonalizationSettings({ indicators, toggleIndicator, period, setPeriod }) {
  return (
    <div className="bg-white dark:bg-[#0b1324] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none transition-colors duration-300">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-300 mb-4 flex items-center gap-2">
        <Eye className="w-4 h-4 text-blue-500 dark:text-blue-400" /> 대시보드 개인화 표출 세팅
      </h3>
      
      <div className="mb-6">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3">표시 거시경제 마켓 자산 필터</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {indicators.map((ind) => (
            <div
              key={ind.id}
              onClick={() => toggleIndicator(ind.id)}
              className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-colors duration-300 select-none ${
                ind.enabled ? 'bg-blue-50 dark:bg-blue-500/5 border-blue-500/40 text-slate-900 dark:text-slate-200 shadow-sm dark:shadow-none' : 'bg-slate-50 dark:bg-[#0d172a] border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 opacity-60 hover:opacity-100 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <span className="text-xs font-semibold">{ind.name}</span>
              <input type="checkbox" checked={ind.enabled} readOnly className="w-4 h-4 rounded accent-blue-500" />
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3">기본 조회 기간 타임프레임</p>
        <div className="flex bg-slate-100 dark:bg-[#0d172a] p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 gap-1 transition-colors duration-300">
          {['1D', '1W', '1M', '1Y'].map((p) => (
            <button key={p} onClick={() => setPeriod(p)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${period === p ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>{p}</button>
          ))}
        </div>
      </div>
    </div>
  );
}