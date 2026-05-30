// src/components/portfolio/AssetAllocationChart.jsx
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import { formatKRW } from '@/utils/currency.js';

import Card from '@/components/ui/Card.jsx';

const DEFAULT_COLORS = {
  주식: '#3b82f6',
  예적금: '#10b981',
  현금: '#f59e0b',
};

export default function AssetAllocationChart({ data = [] }) {
  const total = data.reduce((sum, item) => sum + Number(item.value || 0), 0);

  const chartData = data.map((item) => ({
    ...item,
    color: item.color || DEFAULT_COLORS[item.name] || '#64748b',
    ratio:
      total > 0 ? Number(((Number(item.value || 0) / total) * 100).toFixed(1)) : 0,
  }));

  return (
    <Card className="bg-white dark:bg-[#0b1324] border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none transition-colors duration-300">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-300 mb-4">
        자산군별 비중
      </h3>

      {chartData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-sm text-slate-500 dark:text-slate-400">
          등록된 자산이 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value, name) => [
                    formatKRW(value),
                    `${name} 원화 환산`,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {chartData.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-[#0d172a] border border-slate-200 dark:border-slate-800 px-4 py-3 transition-colors duration-300"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {item.name}
                  </span>
                </div>

                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {item.ratio.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}