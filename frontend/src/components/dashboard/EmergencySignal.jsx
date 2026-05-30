import Card from '@/components/ui/Card.jsx';

export default function EmergencySignal({ message }) {
  return (
    <Card className="flex flex-col justify-between bg-white dark:bg-[#0b1324] border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none transition-colors duration-300">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-300">Emergency Signal</h3>
      <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900/40 text-xs text-red-600 dark:text-red-400 transition-colors duration-300">{message}</div>
      <button className="w-full mt-4 py-3 bg-blue-600 text-white text-xs font-bold rounded-xl transition-colors hover:bg-blue-700 shadow-md shadow-blue-600/10">대응전략 읽기</button>
    </Card>
  );
}