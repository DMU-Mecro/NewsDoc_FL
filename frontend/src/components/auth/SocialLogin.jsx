export default function SocialLogin() {
  return (
    <div className="text-center mt-6 pt-6 border-t border-slate-200 dark:border-slate-800/60 transition-colors duration-300">
      <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-4">또는 외부 연동 인증</p>
      <div className="grid grid-cols-2 gap-3">
        <button 
          type="button"
          className="py-2.5 bg-slate-50 dark:bg-[#0d172a] hover:bg-slate-100 dark:hover:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors duration-300 flex items-center justify-center gap-1.5"
        >
          🌐 Google 로그인
        </button>
        <button 
          type="button"
          className="py-2.5 bg-slate-50 dark:bg-[#0d172a] hover:bg-slate-100 dark:hover:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors duration-300 flex items-center justify-center gap-1.5"
        >
          💚 Naver 로그인
        </button>
      </div>
    </div>
  );
}