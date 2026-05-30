// src/store/useSimulationStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { runSimulationAPI } from '@/api/simulation.js';

export const useSimulationStore = create(
  persist(
    (set, get) => ({
      scenario: 'base',
      goalAmount: 100000000,
      goalYear: 10,
      monthlyContribution: 300000,
      initialPV: null,
      simulationResult: null,
      isLoading: false,
      error: null,

      setScenario: (scenario) => set({ scenario }),
      setGoalAmount: (goalAmount) => set({ goalAmount: Number(goalAmount || 0) }),
      setGoalYear: (goalYear) => set({ goalYear: Number(goalYear || 1) }),
      setMonthlyContribution: (monthlyContribution) =>
        set({ monthlyContribution: Number(monthlyContribution || 0) }),
      setInitialPV: (initialPV) => set({ initialPV: Number(initialPV || 0) }),
      clearSimulationResult: () => set({ simulationResult: null, error: null }),

      runSimulation: async () => {
        const { initialPV, goalAmount, goalYear, monthlyContribution } = get();

        set({ isLoading: true, error: null });

        try {
          const result = await runSimulationAPI({
            initialAmount: initialPV || 0,
            goalAmount,
            goalYear,
            monthlyContribution,
          });

          set({ simulationResult: result, isLoading: false });
          return result;
        } catch (error) {
          const message =
            error.response?.data?.detail ||
            error.message ||
            '투자 시뮬레이션 계산 중 오류가 발생했습니다.';

          set({ error: message, isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'simulation-storage',
      partialize: (state) => ({
        scenario: state.scenario,
        goalAmount: state.goalAmount,
        goalYear: state.goalYear,
        monthlyContribution: state.monthlyContribution,
        initialPV: state.initialPV,
      }),
    }
  )
);