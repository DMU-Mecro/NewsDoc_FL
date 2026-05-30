import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Sparkles } from 'lucide-react';

const formatCurrency = (value) => {
  const amount = Number(value || 0);

  if (amount >= 100000000) {
    const uk = Math.floor(amount / 100000000);
    const man = Math.round((amount % 100000000) / 10000);
    return `₩${uk}억${man > 0 ? ` ${man.toLocaleString()}만` : ''}`;
  }

  if (amount >= 10000) {
    return `₩${Math.round(amount / 10000).toLocaleString()}만`;
  }

  return `₩${amount.toLocaleString()}`;
};

const getScenarioStyle = (scenario) => {
  if (scenario === 'best') {
    return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20';
  }

  if (scenario === 'worst') {
    return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/5 border-rose-200 dark:border-rose-500/20';
  }

  return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/5 border-blue-200 dark:border-blue-500/20';
};

export default function ProjectionChart({
  scenario,
  simulationData,
  results,
  initialPV,
  goalAmount,
  isLoading,
}) {
  const finalResults = Array.isArray(results) ? results : [];
  const hasData = Array.isArray(simulationData) && simulationData.length > 0;

  const chartData = hasData
    ? simulationData.map((item) => ({
        ...item,
        bestManwon: Math.round(Number(item.best || 0) / 10000),
        baseManwon: Math.round(Number(item.base || 0) / 10000),
        worstManwon: Math.round(Number(item.worst || 0) / 10000),
        goalManwon: Math.round(Number(goalAmount || 0) / 10000),
      }))
    : [];

  return (
    <div className="bg-white dark:bg-[#0b1324] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none mb-8 transition-colors duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-300">
            시나리오별 자산 변동 예측 궤적
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            초기 자산 {formatCurrency(initialPV)} 기준으로 최선·기본·최악 경로를 계산합니다.
          </p>
        </div>
        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-500/20 flex items-center gap-1 transition-colors duration-300">
          <Sparkles className="w-3 h-3" /> {isLoading ? '계산 중' : 'FastAPI 연동'}
        </span>
      </div>

      <div className="h-72 mt-4">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-[#1e293b]" vertical={false} />
              <XAxis dataKey="year" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} unit="만원" />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value || 0) * 10000)}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#fff',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)',
                }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <ReferenceLine
                y={Math.round(Number(goalAmount || 0) / 10000)}
                label="목표"
                stroke="#94a3b8"
                strokeDasharray="4 4"
              />
              <Line
                type="monotone"
                name="최선"
                dataKey="bestManwon"
                stroke="#10b981"
                strokeWidth={scenario === 'best' ? 3.5 : 1.5}
                dot={scenario === 'best'}
                opacity={scenario === 'best' ? 1 : 0.4}
              />
              <Line
                type="monotone"
                name="기본"
                dataKey="baseManwon"
                stroke="#3b82f6"
                strokeWidth={scenario === 'base' ? 3.5 : 1.5}
                dot={scenario === 'base'}
                opacity={scenario === 'base' ? 1 : 0.4}
              />
              <Line
                type="monotone"
                name="최악"
                dataKey="worstManwon"
                stroke="#ef4444"
                strokeWidth={scenario === 'worst' ? 3.5 : 1.5}
                dot={scenario === 'worst'}
                opacity={scenario === 'worst' ? 1 : 0.4}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400">
            시뮬레이션 데이터를 불러오는 중입니다.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {finalResults.map((item) => (
          <div
            key={item.scenario}
            className={`p-4 rounded-xl border text-center transition-colors duration-300 ${getScenarioStyle(item.scenario)}`}
          >
            <span className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold block">
              {item.label} 결과, 연 {(Number(item.annual_return_rate || 0) * 100).toFixed(1)}%
            </span>
            <span className="text-lg font-black mt-1 block">
              {formatCurrency(item.final_amount)}
            </span>
            <span className="text-[11px] font-bold mt-1 block">
              {item.goal_achieved
                ? `목표 초과 ${formatCurrency(item.goal_gap)}`
                : `목표 부족 ${formatCurrency(Math.abs(Number(item.goal_gap || 0)))}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}