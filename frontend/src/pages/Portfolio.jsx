// src/pages/Portfolio.jsx
import { useEffect, useState } from 'react';

import AssetRegistrationForm from '@/components/portfolio/AssetRegistrationForm.jsx';
import AssetAllocationChart from '@/components/portfolio/AssetAllocationChart.jsx';
import AssetSummary from '@/components/portfolio/AssetSummary.jsx';
import AssetTable from '@/components/portfolio/AssetTable.jsx';
import Watchlist from '@/components/portfolio/Watchlist.jsx';

import { usePortfolioStore } from '@/store/usePortfolioStore.js';
import { useSettingsStore } from '@/store/useSettingsStore.js';
import { getAssetsAPI } from '@/api/portfolio.js';

export default function Portfolio() {
  const { assets, getChartData, setAssets } = usePortfolioStore();
  const { indicators } = useSettingsStore();

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const activeWatchlist = indicators.filter((indicator) => indicator.enabled);

  const fetchAssets = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');

      const data = await getAssetsAPI();

      setAssets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch assets:', error);

      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        '포트폴리오 데이터를 불러오지 못했습니다.';

      setErrorMessage(message);
      setAssets([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isActive = true;

    const loadInitialAssets = async () => {
      try {
        const data = await getAssetsAPI();

        if (!isActive) {
          return;
        }

        setAssets(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch assets:', error);

        if (!isActive) {
          return;
        }

        const message =
          error.response?.data?.detail ||
          error.response?.data?.message ||
          error.message ||
          '포트폴리오 데이터를 불러오지 못했습니다.';

        setErrorMessage(message);
        setAssets([]);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadInitialAssets();

    return () => {
      isActive = false;
    };
  }, [setAssets]);

  return (
    <div className="p-8 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          총괄 자산 내역
        </h1>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          백엔드에 저장된 실제 포트폴리오 데이터를 기준으로 자산 비중을 분석합니다.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {errorMessage}
        </div>
      )}

      <AssetRegistrationForm onAssetChanged={fetchAssets} />

      {isLoading ? (
        <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
          포트폴리오 데이터를 불러오는 중입니다.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <AssetAllocationChart data={getChartData()} />
            <AssetSummary />
          </div>

          <AssetTable assets={assets} onAssetChanged={fetchAssets} />

          <Watchlist watchlist={activeWatchlist} />
        </>
      )}
    </div>
  );
}