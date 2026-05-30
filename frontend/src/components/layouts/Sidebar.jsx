// src/components/layouts/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore.js';
import {
  LayoutDashboard,
  PieChart,
  FileText,
  Shield,
  Newspaper,
  Settings,
} from 'lucide-react';

export default function Sidebar() {
  const menuItems = [
    { path: '/', name: '대시보드', icon: LayoutDashboard },
    { path: '/portfolio', name: '포트폴리오 상세', icon: PieChart },
    { path: '/simulation', name: '투자 시뮬레이터', icon: FileText },
    { path: '/rebalancing', name: '리스크 분석', icon: Shield },
    { path: '/insights', name: 'AI 뉴스 인사이트', icon: Newspaper },
  ];

  const { user } = useAuthStore();

  const nickname = user?.nickname || user?.email || '사용자';
  const email = user?.email || '';
  const avatarText = nickname.slice(0, 2).toUpperCase();

  return (
    <aside className="w-64 bg-white dark:bg-[#0b1324] text-slate-500 dark:text-slate-400 h-screen sticky top-0 shrink-0 flex flex-col justify-between p-4 border-r border-slate-200 dark:border-slate-900 select-none transition-colors duration-300">
      <div>
        <div className="flex items-center gap-3 px-2 py-4 mb-6">
          <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-600/20 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1">
            NewsDoc<span className="text-blue-500">2</span>
          </h1>
        </div>

        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 font-medium text-[15px] group ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200'
                  }`
                }
              >
                <Icon className="w-5 h-5 transition-transform group-hover:scale-105" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-900 pt-4 flex items-center justify-between px-2 mb-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-md shadow-purple-600/10 shrink-0">
            {avatarText}
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 tracking-wide truncate">
              {nickname}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium truncate">
              {email || '로그인 사용자'}
            </span>
          </div>
        </div>

        <NavLink
          to="/settings"
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
        >
          <Settings className="w-5 h-5" />
        </NavLink>
      </div>
    </aside>
  );
}