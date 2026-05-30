import { useEffect, useState } from 'react';
import { Scale, Loader2, RefreshCw } from 'lucide-react';
import GapAnalysisChart from '@/components/rebalancing/GapAnalysisChart.jsx';
import ActionList from '@/components/rebalancing/ActionList.jsx';
import DecisionLogic from '@/components/rebalancing/DecisionLogic.jsx';
import { usePortfolioStore } from '@/store/usePortfolioStore.js';
import { getAssetsAPI } from '@/api/portfolio.js';
import { getRebalancingRecommendationAPI } from '@/api/rebalancing.js';

export default function Rebalancing() {
  const assets = usePortfolioStore((state) => state.assets);
  const setAssets = usePortfolioStore((state) => state.setAssets);

  const [marketRegime, setMarketRegime] = useState('risk_off');
  const [isLoading, setIsLoading] = useState(false);
  const [isAssetLoading, setIsAssetLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPortfolioAssets = async () => {
      if (assets.length > 0) {
        return;
      }

      setIsAssetLoading(true);

      try {
        const loadedAssets = await getAssetsAPI();
        setAssets(loadedAssets);
      } catch (error) {
        console.error('포트폴리오 자산을 불러오지 못했습니다.', error);
      } finally {
        setIsAssetLoading(false);
      }
    };

    loadPortfolioAssets();
  }, [assets.length, setAssets]);

  useEffect(() => {
    const fetchRecommendation = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getRebalancingRecommendationAPI(assets, marketRegime);
        setRecommendation(data);
      } catch (error) {
        const message =
          error.response?.data?.detail ||
          error.message ||
          '리밸런싱 추천 계산 중 오류가 발생했습니다.';

        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendation();
  }, [assets, marketRegime]);

  const isBusy = isLoading || isAssetLoading;
  const gapData = recommendation?.gapData || [];
  const actions = recommendation?.actions || [];
  const logicList = recommendation?.logicList || [];
  const summary = recommendation?.summary || null;

  return (
    <div className="p-8 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Scale className="text-blue-500 w-6 h-6" /> 리스크 분석 & 액티브 리밸런싱
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            현재 포트폴리오 비중과 목표 비중의 차이를 계산하고 실행 가능한 조정 금액을 제안합니다.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1324] p-2">
          <span className="px-2 text-xs font-bold text-slate-500 dark:text-slate-400">시장 국면</span>
          <select
            value={marketRegime}
            onChange={(event) => setMarketRegime(event.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0d172a] px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="risk_off">Risk-Off</option>
            <option value="neutral">Neutral</option>
            <option value="risk_on">Risk-On</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-8 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          {String(error)}
        </div>
      )}

      {isBusy ? (
        <div className="flex justify-center items-center py-12 text-blue-600 dark:text-blue-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <>
          <GapAnalysisChart data={gapData} summary={summary} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ActionList actions={actions} />
            <DecisionLogic logicList={logicList} summary={summary} />
          </div>

          <div className="mt-6 flex items-center justify-center text-[11px] text-slate-500 dark:text-slate-400">
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            포트폴리오 자산 또는 시장 국면을 바꾸면 백엔드에서 추천 비중을 다시 계산합니다.
          </div>
        </>
      )}
    </div>
  );
}