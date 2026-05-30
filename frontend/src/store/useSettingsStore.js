// src/store/useSettingsStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSettingsStore = create(
  persist(
    (set) => ({
      theme: 'dark',
      period: '1M',

      marketEchoData: [],

      indicators: [],

      setTheme: (theme) => set({ theme }),

      setPeriod: (period) => set({ period }),

      setIndicators: (indicators) =>
        set({
          indicators: Array.isArray(indicators) ? indicators : [],
        }),

      toggleIndicator: (id) =>
        set((state) => ({
          indicators: state.indicators.map((indicator) =>
            indicator.id === id
              ? { ...indicator, enabled: !indicator.enabled }
              : indicator
          ),
        })),

      updateIndicatorValue: (id, newData) =>
        set((state) => {
          const exists = state.indicators.some(
            (indicator) => indicator.id === id
          );

          if (!exists) {
            return {
              indicators: [
                ...state.indicators,
                {
                  ...newData,
                  id,
                  enabled: newData.enabled ?? true,
                },
              ],
            };
          }

          return {
            indicators: state.indicators.map((indicator) =>
              indicator.id === id
                ? { ...indicator, ...newData }
                : indicator
            ),
          };
        }),

      updateMarketEchoData: (newData) =>
        set({
          marketEchoData: Array.isArray(newData) ? newData : [],
        }),

      clearDashboardData: () =>
        set({
          marketEchoData: [],
          indicators: [],
        }),
    }),
    {
      name: 'settings-storage',
    }
  )
);