// src/components/portfolio/AssetTable.jsx
import Card from '@/components/ui/Card.jsx';
import { Trash2 } from 'lucide-react';
import { deleteAssetAPI } from '@/api/portfolio.js';

const formatNumber = (value) => {
  return Number(value || 0).toLocaleString();
};

const formatMoney = (value, currency = 'KRW') => {
  const number = Number(value || 0);

  if (currency === 'USD') {
    return `$${number.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })}`;
  }

  return `₩${number.toLocaleString()}`;
};

export default function AssetTable({ assets = [], onAssetChanged }) {
  const handleDelete = async (id) => {
    const confirmed = window.confirm('이 자산을 삭제하시겠습니까?');

    if (!confirmed) {
      return;
    }

    try {
      await deleteAssetAPI(id);

      if (typeof onAssetChanged === 'function') {
        await onAssetChanged();
      }
    } catch (error) {
      console.error('Asset Delete Error:', error);

      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        '자산 삭제에 실패했습니다.';

      alert(message);
    }
  };

  return (
    <Card className="mb-8 overflow-hidden bg-white dark:bg-[#0b1324] border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none transition-colors duration-300">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-300 mb-4">
        보유 자산 상세 내역
      </h3>

      {assets.length === 0 ? (
        <div className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
          등록된 자산이 없습니다. 상단 입력창에서 자산을 추가해 주세요.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold tracking-wider transition-colors duration-300">
                <th className="pb-3 pl-2">자산명</th>
                <th className="pb-3">티커</th>
                <th className="pb-3">분류</th>
                <th className="pb-3">통화</th>
                <th className="pb-3 text-right">보유 수량</th>
                <th className="pb-3 text-right">평균 단가</th>
                <th className="pb-3 text-right pr-2">평가 금액</th>
                <th className="pb-3 text-center">관리</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50 text-sm text-slate-700 dark:text-slate-300 transition-colors duration-300">
              {assets.map((asset) => (
                <tr
                  key={asset.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group"
                >
                  <td className="py-4 pl-2 font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {asset.name}
                  </td>

                  <td className="py-4 text-xs text-slate-500 dark:text-slate-400">
                    {asset.ticker || '-'}
                  </td>

                  <td className="py-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="bg-slate-100 dark:bg-[#0d172a] px-2 py-1 rounded-md border border-slate-200 dark:border-slate-800 transition-colors duration-300">
                      {asset.type}
                    </span>
                  </td>

                  <td className="py-4 text-xs text-slate-500 dark:text-slate-400">
                    {asset.currency || 'KRW'}
                  </td>

                  <td className="py-4 text-right font-medium">
                    {formatNumber(asset.quantity)}
                  </td>

                  <td className="py-4 text-right font-medium text-slate-500 dark:text-slate-400">
                    {formatMoney(asset.price, asset.currency)}
                  </td>

                  <td className="py-4 text-right font-bold text-slate-900 dark:text-white pr-2">
                    {formatMoney(asset.total, asset.currency)}
                  </td>

                  <td className="py-4 text-center">
                    <button
                      onClick={() => handleDelete(asset.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}