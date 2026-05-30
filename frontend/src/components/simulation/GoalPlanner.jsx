import {
  Calculator,
  Calendar,
  Coins,
  ArrowUpRight,
  CheckCircle2,
  WalletCards,
} from 'lucide-react';

const formatCurrency = (value) => {
  return `₩${Number(value || 0).toLocaleString()}`;
};

export default function GoalPlanner({
  goalAmount,
  setGoalAmount,
  goalYear,
  setGoalYear,
  monthlyContribution,
  setMonthlyContribution,
  initialPV,
  setInitialPV,
  simulationResult,
  isLoading,
}) {
  const safeYear = Math.max(1, Number(goalYear || 1));
  const metrics = simulationResult?.metrics;

  const requiredReturnRate = metrics?.required_annual_return_rate ?? 0;
  const requiredMonthlySavings =
    metrics?.required_monthly_contribution_at_base_rate ?? 0;
  const baseRate = metrics?.base_rate ?? 0.065;

  const roundedRequiredMonthlySavings =
    Math.ceil(Number(requiredMonthlySavings || 0) / 10000) * 10000;

  return (
    <div className="bg-white dark:bg-[#0b1324] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none transition-colors duration-300 mb-8">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-300 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-500" /> 생애 주기별 재무 목표 플래너
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            입력값이 바뀌면 FastAPI 시뮬레이션 엔진에서 다시 계산합니다.
          </p>
        </div>
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
          {isLoading ? '계산 중...' : '계산 완료'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="relative">
          <label className="text-xs text-slate-600 dark:text-slate-400 font-bold mb-2 flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-slate-500" /> 현재 초기 자산
          </label>
          <input
            type="number"
            value={initialPV}
            onChange={(e) => setInitialPV(e.target.value)}
            className="w-full p-3 bg-slate-50 dark:bg-[#0d172a] border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors duration-300"
          />
        </div>

        <div className="relative">
          <label className="text-xs text-slate-600 dark:text-slate-400 font-bold mb-2 flex items-center gap-1">
            <WalletCards className="w-3.5 h-3.5 text-slate-500" /> 매월 추가 투자금
          </label>
          <input
            type="number"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(e.target.value)}
            className="w-full p-3 bg-slate-50 dark:bg-[#0d172a] border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors duration-300"
          />
        </div>

        <div className="relative">
          <label className="text-xs text-slate-600 dark:text-slate-400 font-bold mb-2 flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-slate-500" /> 총 목표 금액
          </label>
          <input
            type="number"
            value={goalAmount}
            onChange={(e) => setGoalAmount(e.target.value)}
            className="w-full p-3 bg-slate-50 dark:bg-[#0d172a] border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors duration-300"
          />
        </div>

        <div className="relative">
          <label className="text-xs text-slate-600 dark:text-slate-400 font-bold mb-2 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-500" /> 목표 달성 기한
          </label>
          <input
            type="number"
            min="1"
            max="50"
            value={goalYear}
            onChange={(e) => setGoalYear(e.target.value)}
            className="w-full p-3 bg-slate-50 dark:bg-[#0d172a] border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors duration-300"
          />
        </div>
      </div>

      <div className="p-5 bg-gradient-to-r from-slate-50 via-slate-100 to-slate-50 dark:from-slate-900 dark:via-[#0d172a] dark:to-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors duration-300">
        <div className="space-y-1">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tracking-wide block">
            기대 수익률 역산 가이드 리포트
          </span>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            초기 자산 <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(initialPV)}</span>,
            월 투자금 <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(monthlyContribution)}</span> 기준으로
            목표액 <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(goalAmount)}</span>을
            <span className="font-bold text-slate-900 dark:text-white"> {safeYear}년</span> 안에 달성하는 계획입니다.
          </p>
        </div>

        <div className="flex gap-6 w-full md:w-auto shrink-0 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-4 md:pt-0 md:pl-6 transition-colors duration-300">
          <div className="flex-1 md:flex-none">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">
              필요 연수익률, 단순 거치
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-0.5">
              {requiredReturnRate > 0 ? `약 ${requiredReturnRate.toFixed(2)}%` : '0.00%'}
              {requiredReturnRate > 0 && <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />}
            </span>
          </div>

          <div className="flex-1 md:flex-none">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">
              필요 월 투자금, 연 {(baseRate * 100).toFixed(1)}% 가정
            </span>
            <span className={`text-xl font-black mt-1 flex items-center gap-1 ${roundedRequiredMonthlySavings > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {roundedRequiredMonthlySavings > 0 ? (
                formatCurrency(roundedRequiredMonthlySavings)
              ) : (
                <><CheckCircle2 className="w-5 h-5" /> 달성 안정권</>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}