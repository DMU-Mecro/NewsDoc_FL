import { Outlet } from 'react-router-dom';

// 로그인/회원가입 등 사이드바가 필요 없는 레이아웃
export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0b1324] text-slate-900 dark:text-slate-200 transition-colors duration-300">
      <div className="w-full max-w-md p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl transition-colors duration-300">
        {/* 로그인 또는 회원가입 페이지 렌더링 위치 */}
        <Outlet />
      </div>
    </div>
  );
}