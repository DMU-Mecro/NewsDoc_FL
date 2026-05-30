// src/pages/Simulation.jsx
import { useEffect } from 'react';
import { Target } from 'lucide-react';
import ScenarioSelector from '@/components/simulation/ScenarioSelector.jsx';
import ProjectionChart from '@/components/simulation/ProjectionChart.jsx';
import GoalPlanner from '@/components/simulation/GoalPlanner.jsx';
import { useSimulationStore } from '@/store/useSimulationStore.js';
import { usePortfolioStore } from '@/store/usePortfolioStore.js';
import { getAssetsAPI } from '@/api/portfolio.js';

export default function Simulation() {
  const {
    scenario,
    setScenario,
    goalAmount,
    setGoalAmount,
    goalYear,
    setGoalYear,
    monthlyContribution,
    setMonthlyContribution,
    initialPV,
    setInitialPV,
    simulationResult,
    isLoading,
    error,
    runSimulation,
  } = useSimulationStore();

  const assets = usePortfolioStore((state) => state.assets);
  const setAssets = usePortfolioStore((state) => state.setAssets);
  const getTotalBalance = usePortfolioStore((state) => state.getTotalBalance);

  useEffect(() => {
    const loadPortfolioAssets = async () => {
      if (assets.length > 0) {
        return;
      }

      try {
        const loadedAssets = await getAssetsAPI();
        setAssets(loadedAssets);
      } catch (error) {
        console.error('포트폴리오 자산을 불러오지 못했습니다.', error);
      }
    };

    loadPortfolioAssets();
  }, [assets.length, setAssets]);

  useEffect(() => {
    if (initialPV !== null) {
      return;
    }

    const balance = getTotalBalance();
    setInitialPV(balance > 0 ? balance : 50000000);
  }, [initialPV, getTotalBalance, setInitialPV, assets.length]);

  useEffect(() => {
    if (initialPV === null) {
      return;
    }

    runSimulation().catch(() => {});
  }, [initialPV, goalAmount, goalYear, monthlyContribution, runSimulation]);

  const displayPV = initialPV !== null ? initialPV : 50000000;

  return (
    <div className="p-8 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Target className="text-blue-500 w-6 h-6" /> 목표 기반 투자 시뮬레이션
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          현재 포트폴리오 자산, 월 추가 투자금, 목표 금액을 기준으로 시나리오별 미래 자산을 계산합니다.
        </p>
      </div>

      <GoalPlanner
        goalAmount={goalAmount}
        setGoalAmount={setGoalAmount}
        goalYear={goalYear}
        setGoalYear={setGoalYear}
        monthlyContribution={monthlyContribution}
        setMonthlyContribution={setMonthlyContribution}
        initialPV={displayPV}
        setInitialPV={setInitialPV}
        simulationResult={simulationResult}
        isLoading={isLoading}
      />

      {error && (
        <div className="mb-8 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          {String(error)}
        </div>
      )}

      <ScenarioSelector scenario={scenario} setScenario={setScenario} />

      <ProjectionChart
        scenario={scenario}
        simulationData={simulationResult?.projections || []}
        results={simulationResult?.results || []}
        initialPV={displayPV}
        goalAmount={goalAmount}
        isLoading={isLoading}
      />
    </div>
  );
}