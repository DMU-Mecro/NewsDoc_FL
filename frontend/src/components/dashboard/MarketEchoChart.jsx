import Card from '@/components/ui/Card.jsx';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function MarketEchoChart({ data }) {
  return (
    <Card className="xl:col-span-2 bg-white dark:bg-[#0b1324] border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none transition-colors duration-300">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-300">MarketEcho Index</h3>
      <div className="h-64 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-[#1e293b]" vertical={false} />
            <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }}
              itemStyle={{ color: '#ef4444', fontWeight: 'bold' }}
              labelStyle={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}
              cursor={{ stroke: '#1e293b', strokeWidth: 2, strokeDasharray: '4 4' }}
            />
            <Area type="monotone" dataKey="지수" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}