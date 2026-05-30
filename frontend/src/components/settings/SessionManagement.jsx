import { User, ShieldCheck, LogOut } from 'lucide-react';

export default function SessionManagement({ currentUser, handleLogout }) {
  return (
    <div className="bg-white dark:bg-[#0b1324] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 h-fit shadow-sm dark:shadow-none transition-colors duration-300">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-300 mb-4 flex items-center gap-2">
        <User className="w-4 h-4 text-red-500 dark:text-red-400" /> 세션 보안 관리
      </h3>
      <div className="p-4 bg-slate-50 dark:bg-[#0d172a] rounded-xl border border-slate-200 dark:border-slate-800 mb-6 flex justify-between items-center transition-colors duration-300">
        <div>
          <span className="text-[11px] text-slate-500 dark:text-slate-500 block">현재 인증 세션</span>
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-200 mt-1 block">{currentUser.email}</span>
        </div>
        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-0.5 transition-colors duration-300">
          <ShieldCheck className="w-3 h-3" /> JWT 세션 활성
        </span>
      </div>
      <button
        onClick={handleLogout}
        className="w-full py-3 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl transition-colors duration-300 border border-red-200 dark:border-red-900/30 flex items-center justify-center gap-1.5 shadow-sm dark:shadow-none"
      >
        <LogOut className="w-3.5 h-3.5" /> 세션 로그아웃
      </button>
    </div>
  );
}