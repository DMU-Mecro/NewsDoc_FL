import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from '@/components/layouts/MainLayout.jsx';
import AuthLayout from '@/components/layouts/AuthLayout.jsx';
import Auth from '@/pages/Auth.jsx';
import Dashboard from '@/pages/Dashboard.jsx';
import Portfolio from '@/pages/Portfolio.jsx';
import Rebalancing from '@/pages/Rebalancing.jsx';
import Insights from '@/pages/Insights.jsx';
import Simulation from '@/pages/Simulation.jsx';
import Settings from '@/pages/Settings.jsx';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function App() {
  // 전역 설정 스토어에서 theme(테마) 상태 가져오기
  const { theme } = useSettingsStore();

  // 테마 상태가 바뀔 때마다 최상위 <html> 태그에 'dark' 클래스를 토글합니다.
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        {/* 1. 인증 및 단일 화면 라우트 (사이드바 없음) */}
        <Route element={<AuthLayout />}>
          <Route path="/auth" element={<Auth />} />
        </Route>

        {/* 2. 메인 서비스 라우트 (사이드바 포함) */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="rebalancing" element={<Rebalancing />} />
          <Route path="insights" element={<Insights />} />
          <Route path="simulation" element={<Simulation />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}