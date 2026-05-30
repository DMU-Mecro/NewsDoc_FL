import { Sparkles } from 'lucide-react';

export default function AuthHeader() {
  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-2 tracking-tight transition-colors duration-300">
        <span className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white shadow-md shadow-blue-500/10 flex items-center justify-center">
          <Sparkles className="w-5 h-5" />
        </span>
        NewsDoc<span className="text-blue-500">2</span>
      </h1>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 transition-colors duration-300">지능형 자산 배분 의사결정 지원 시스템 관제 세션 가동</p>
    </div>
  );
}