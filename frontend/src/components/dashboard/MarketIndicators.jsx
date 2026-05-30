import Card from '@/components/ui/Card.jsx';
import { Globe, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function MarketIndicators({ indicators }) {
  return (
    <Card className="mb-8 bg-white dark:bg-[#0b1324] border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none transition-colors duration-300">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-300 mb-4 flex items-center gap-2">
        <Globe className="w-4 h-4 text-blue-500" /> 커스텀 마켓 인디케이터 보드
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {indicators.map((item, idx) => {
          if (!item.enabled) return null; // OFF 된 지표는 화면에서 숨김 처리

          return (
            <div key={idx} className={`p-4 bg-slate-50 dark:bg-[#0d172a] rounded-xl border transition-colors duration-300 ${item.border || 'border-slate-200 dark:border-slate-800/60'}`}>
              <p className="text-xs text-slate-500 font-medium truncate">{item.label}</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1.5 tracking-tight">{item.value}</p>
              <span className={`text-xs font-semibold flex items-center mt-1 ${item.up ? 'text-amber-600 dark:text-amber-500' : 'text-rose-600 dark:text-rose-500'}`}>
                {item.up ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />} {item.change}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}