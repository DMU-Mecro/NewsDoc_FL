import { ShieldCheck, AlertCircle } from 'lucide-react';

export default function DecisionLogic({ logicList, summary }) {
  const safeLogicList = Array.isArray(logicList) ? logicList : [];

  return (
    <div className="bg-white dark:bg-[#0b1324] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none flex flex-col justify-between transition-colors duration-300">
      <div>
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-300 flex items-center gap-2 mb-4">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
          Decision Logic (알고리즘 근거)
        </h3>

        <div className="space-y-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          {safeLogicList.length > 0 ? (
            safeLogicList.map((text, idx) => (
              <div key={idx} className="flex gap-2.5">
                <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p>{text}</p>
              </div>
            ))
          ) : (
            <div className="flex gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p>리밸런싱 근거를 불러오는 중입니다.</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-500 text-center transition-colors duration-300">
        백엔드 리밸런싱 엔진 v0.2 · {summary?.market_regime_label || 'Risk-Off'} · 위험도 {summary?.risk_level || '낮음'}
      </div>
    </div>
  );
}