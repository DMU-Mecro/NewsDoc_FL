// src/pages/Settings.jsx
import { useSettingsStore } from '@/store/useSettingsStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { Sliders } from 'lucide-react';
import ThemeSettings from '@/components/settings/ThemeSettings.jsx';
import PersonalizationSettings from '@/components/settings/PersonalizationSettings.jsx';
import SessionManagement from '@/components/settings/SessionManagement.jsx';

export default function Settings() {
  const {
    theme,
    period,
    indicators,
    setTheme,
    setPeriod,
    toggleIndicator,
  } = useSettingsStore();

  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    alert('로그아웃되었습니다.');
    navigate('/auth');
  };

  const currentUser = user || {
    email: '사용자 정보를 불러오지 못했습니다.',
    nickname: '사용자',
  };

  return (
    <div className="p-8 min-h-screen text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sliders className="text-blue-500 w-6 h-6" /> 관제 시스템 설정
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          대시보드 개인화 필터 및 전역 UI 설정 환경
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-6">
          <ThemeSettings theme={theme} setTheme={setTheme} />

          <PersonalizationSettings
            indicators={indicators}
            toggleIndicator={toggleIndicator}
            period={period}
            setPeriod={setPeriod}
          />
        </div>

        <SessionManagement
          currentUser={currentUser}
          handleLogout={handleLogout}
        />
      </div>
    </div>
  );
}