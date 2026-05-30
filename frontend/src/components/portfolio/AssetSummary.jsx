// src/components/portfolio/AssetSummary.jsx
import Card from '@/components/ui/Card.jsx';
import { usePortfolioStore } from '@/store/usePortfolioStore.js';
import { convertToKRW, formatKRW } from '@/utils/currency.js';

export default function AssetSummary() {
  const {
    assets,
    getTotalBalance,
    getDisplayTotalBalance,
    getDisplayTotalBalanceByCurrency,
  } = usePortfolioStore();

  const totalBalance = getTotalBalance();
  const displayTotalBalance = getDisplayTotalBalance();
  const currencyLabels = getDisplayTotalBalanceByCurrency();

  const stockTotal = assets
    .filter((asset) => asset.type === '주식')
    .reduce((sum, asset) => {
      return sum + convertToKRW(asset.total, asset.currency);
    }, 0);

  const depositTotal = assets
    .filter((asset) => asset.type === '예적금')
    .reduce((sum, asset) => {
      return sum + convertToKRW(asset.total, asset.currency);
    }, 0);

  const cashTotal = assets
    .filter((asset) => asset.type === '현금')
    .reduce((sum, asset) => {
      return sum + convertToKRW(asset.total, asset.currency);
    }, 0);

  const getRatio = (value) => {
    if (totalBalance === 0) {
      return '0.0%';
    }

    return `${((Number(value || 0) / totalBalance) * 100).toFixed(1)}%`;
  };

  return (
    <Card className="bg-white dark:bg-[#0b1324] border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none transition-colors duration-300">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-300 mb-4">
        자산 요약
      </h3>

      <div className="space-y-5">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
            원화 환산 평가 총액
          </p>

          <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {displayTotalBalance}
          </p>

          {currencyLabels.length > 0 && (
            <div className="mt-2 space-y-1">
              {currencyLabels.map((item) => (
                <p
                  key={item.currency}
                  className="text-xs text-slate-500 dark:text-slate-400"
                >
                  {item.label}
                </p>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-slate-50 dark:bg-[#0d172a] border border-slate-200 dark:border-slate-800 p-3 transition-colors duration-300">
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1">
              주식
            </p>
            <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {getRatio(stockTotal)}
            </p>
            <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
              {formatKRW(stockTotal)}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 dark:bg-[#0d172a] border border-slate-200 dark:border-slate-800 p-3 transition-colors duration-300">
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1">
              예적금
            </p>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {getRatio(depositTotal)}
            </p>
            <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
              {formatKRW(depositTotal)}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 dark:bg-[#0d172a] border border-slate-200 dark:border-slate-800 p-3 transition-colors duration-300">
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1">
              현금
            </p>
            <p className="text-sm font-bold text-amber-600 dark:text-amber-400">
              {getRatio(cashTotal)}
            </p>
            <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
              {formatKRW(cashTotal)}
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          전체 자산, 비중, 위험도는 원화 환산 금액을 기준으로 계산됩니다.
          통화별 원금은 별도로 표시됩니다.
        </p>
      </div>
    </Card>
  );
}