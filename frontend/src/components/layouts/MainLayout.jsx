import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from '@/components/layouts/Sidebar.jsx';
import { useAuthStore } from '@/store/useAuthStore';

export default function MainLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = useAuthStore((state) => state.token);

  if (!isAuthenticated || !token) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#070c19] text-slate-900 dark:text-slate-200 font-sans overflow-hidden transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}