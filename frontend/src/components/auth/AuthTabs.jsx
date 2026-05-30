export default function AuthTabs({ mode, setMode }) {
  return (
    <div className="flex bg-slate-100 dark:bg-[#0d172a] p-1 rounded-xl border border-slate-200 dark:border-slate-800/60 mb-6 transition-colors duration-300">
      <button
        type="button"
        onClick={() => setMode('login')}
        className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
          mode === 'login'
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10'
            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
        }`}
      >
        로그인 인증
      </button>
      <button
        type="button"
        onClick={() => setMode('signup')}
        className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
          mode === 'signup'
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10'
            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
        }`}
      >
        신규 회원가입
      </button>
    </div>
  );
}