import { Star, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Card from '@/components/ui/Card.jsx';

export default function Watchlist({ watchlist }) {
  return (
    <Card className="bg-white dark:bg-[#0b1324] border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none transition-colors duration-300">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-300 mb-4 flex items-center gap-2">
        <Star className="w-4 h-4 text-amber-500 fill-amber-500/20" /> 관심 자산 실시간 지표 (Watchlist)
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {watchlist.map((item) => (
          <div key={item.id} className="p-4 bg-slate-50 dark:bg-[#0d172a] rounded-xl border border-slate-200 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 transition-colors duration-300">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold truncate">{item.label}</p>
            <div className="flex justify-between items-baseline mt-2">
              <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{item.value}</span>
              <span className={`text-xs font-bold flex items-center ${item.up ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-600 dark:text-rose-500'}`}>
                {item.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />} {item.change}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}