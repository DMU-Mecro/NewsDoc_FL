import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null, // JWT 토큰 저장용
      isAuthenticated: false,
      
      // 로그인 성공 시 정보 저장
      setAuth: (token, userData) => set({ token, user: userData, isAuthenticated: true }),
      
      // 로그아웃 또는 세션 만료 시 초기화
      clearAuth: () => set({ token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage', // localStorage에 저장되어 새로고침해도 로그인 유지
    }
  )
);