import { Shield } from 'lucide-react';

export default function ScenarioSelector({ scenario, setScenario }) {
  return (
    <div className="bg-white dark:bg-[#0b1324] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none mb-8 transition-colors duration-300">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-300 mb-4 flex items-center gap-2">
        <Shield className="w-4 h-4 text-blue-500" /> 국면별 거시경제 시나리오 선택
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* 최선 시나리오 */}
        <div
          onClick={() => setScenario('best')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            scenario === 'best' 
              ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-md dark:shadow-emerald-950/20' 
              : 'bg-slate-50 dark:bg-[#0d172a] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            🟢 최선 시나리오
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">금리 인하 사이클 진입, 글로벌 경기 회복 및 자산 가격 강세</p>
        </div>

        {/* 기본 시나리오 */}
        <div
          onClick={() => setScenario('base')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            scenario === 'base' 
              ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400 shadow-md dark:shadow-blue-950/20' 
              : 'bg-slate-50 dark:bg-[#0d172a] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-sm">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            🟡 기본 시나리오
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">현재 거시경제 추세 지속, 시장 변동성 평균 수치 유지</p>
        </div>

        {/* 최악 시나리오 */}
        <div
          onClick={() => setScenario('worst')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            scenario === 'worst' 
              ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400 shadow-md dark:shadow-rose-950/20' 
              : 'bg-slate-50 dark:bg-[#0d172a] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-sm">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            🔴 최악 시나리오
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">미 금리 추가 고공행진, 스태그플레이션 우려 및 성장주 하방 압력</p>
        </div>

      </div>
    </div>
  );
}