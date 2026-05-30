// src/components/dashboard/SummaryCards.jsx
import Card from '@/components/ui/Card.jsx';
import { formatKRW } from '@/utils/currency.js';

export default function SummaryCards({ riskScore, totalBalance }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <Card className="bg-white dark:bg-[#0b1324] border border-red-200 dark:border-red-500/30 shadow-sm dark:shadow-none transition-colors duration-300">
        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">
          포트폴리오 종합 위험도
        </h3>

        <div className="text-5xl font-black text-red-500">
          {riskScore}{' '}
          <span className="text-slate-400 dark:text-slate-500 text-lg">
            / 100 점
          </span>
        </div>
      </Card>

      <Card className="bg-white dark:bg-[#0b1324] border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none transition-colors duration-300">
        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">
          원화 환산 통합 자산 잔고
        </h3>

        <div className="text-5xl font-black text-slate-900 dark:text-white">
          {formatKRW(totalBalance)}
        </div>

        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          원화와 외화 자산을 환산 환율 기준으로 합산한 금액입니다.
        </p>
      </Card>
    </div>
  );
}