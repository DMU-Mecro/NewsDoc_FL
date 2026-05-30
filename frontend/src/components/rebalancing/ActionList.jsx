import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function ActionList({ actions }) {
  const safeActions = Array.isArray(actions) ? actions : [];

  return (
    <div className="bg-white dark:bg-[#0b1324] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none lg:col-span-2 flex flex-col justify-between transition-colors duration-300">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-300">즉시 실행 액션 리스트</h3>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">백엔드 계산 기반 조정 가이드</span>
        </div>

        <div className="space-y-3">
          {safeActions.length > 0 ? (
            safeActions.map((action) => (
              <div
                key={action.id}
                className={`p-4 rounded-xl border ${action.color} flex items-center justify-between transition-all hover:scale-[1.01]`}
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{action.title}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{action.description}</p>
                  </div>
                </div>
                <span className="text-[10px] font-black tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 transition-colors duration-300">
                  {action.priority}
                </span>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center text-sm text-slate-500 dark:text-slate-400">
              표시할 리밸런싱 액션이 없습니다.
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        className="w-full mt-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-600/10 flex items-center justify-center gap-1 opacity-90 cursor-default"
      >
        실제 매매 실행은 제공하지 않고 계산 가이드만 제공합니다 <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}