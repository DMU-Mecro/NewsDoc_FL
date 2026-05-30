import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { HelpCircle, ShieldAlert } from 'lucide-react';

const formatCurrency = (value) => `₩${Number(value || 0).toLocaleString()}`;

export default function GapAnalysisChart({ data, summary }) {
  const chartData = Array.isArray(data) ? data : [];

  return (
    <div className="bg-white dark:bg-[#0b1324] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none mb-8 transition-colors duration-300">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-300">전략적 갭(Gap) 분석</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            현재 내 자산 비중과 백엔드가 계산한 목표 비중을 비교합니다.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 text-xs bg-slate-50 dark:bg-[#0d172a] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 transition-colors duration-300">
            <HelpCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            데이터 기반 국면 판정:{' '}
            <span className="text-amber-600 dark:text-amber-400 font-bold">
              {summary?.market_regime_label || 'Risk-Off'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs bg-slate-50 dark:bg-[#0d172a] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 transition-colors duration-300">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
            위험 점수:{' '}
            <span className="font-bold text-slate-900 dark:text-white">
              {summary?.risk_score ?? 0}점 / {summary?.risk_level || '낮음'}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0d172a] p-3">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">총 평가 금액</span>
          <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">
            {formatCurrency(summary?.total_amount || 0)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0d172a] p-3">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">계산 신뢰도</span>
          <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">
            {Math.round(Number(summary?.confidence || 0) * 100)}%
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0d172a] p-3">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">조정 필요 여부</span>
          <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">
            {summary?.is_rebalancing_needed ? '필요' : '낮음'}
          </p>
        </div>
      </div>

      <div className="h-72 mt-2">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-[#1e293b]" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} unit="%" />
              <Tooltip
                formatter={(value, name) => [`${Number(value || 0).toFixed(2)}%`, name]}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#fff',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)',
                }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Bar dataKey="현재비중" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="추천비중" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400">
            포트폴리오 자산을 등록하면 리밸런싱 차트가 표시됩니다.
          </div>
        )}
      </div>
    </div>
  );
}