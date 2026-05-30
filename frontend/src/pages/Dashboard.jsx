// src/pages/Dashboard/Dashboard.jsx
import { useEffect, useRef, useState } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { RefreshCw, Activity, AlertCircle } from 'lucide-react';

import SummaryCards from '@/components/dashboard/SummaryCards.jsx';
import MarketIndicators from '@/components/dashboard/MarketIndicators.jsx';
import MarketEchoChart from '@/components/dashboard/MarketEchoChart.jsx';
import EmergencySignal from '@/components/dashboard/EmergencySignal.jsx';

import {
  getMarketIndicatorsAPI,
  getMarketEchoAPI,
} from '@/api/dashboard.js';

export default function Dashboard() {
  const {
    period,
    indicators,
    marketEchoData,
    updateMarketEchoData,
    updateIndicatorValue,
  } = useSettingsStore();

  const { getTotalBalance, getRiskScore } = usePortfolioStore();

  const didFetchInitialData = useRef(false);

  const [isIndicatorsLoading, setIsIndicatorsLoading] = useState(false);
  const [isEchoLoading, setIsEchoLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchIndicators = async () => {
    try {
      setIsIndicatorsLoading(true);
      setErrorMessage('');

      const data = await getMarketIndicatorsAPI();

      if (Array.isArray(data) && data.length > 0) {
        data.forEach((indicator) => {
          updateIndicatorValue(indicator.id, indicator);
        });
      }
    } catch (error) {
      console.error('Failed to fetch indicators:', error);

      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        '마켓 인디케이터 데이터를 불러오지 못했습니다.';

      setErrorMessage(message);
    } finally {
      setIsIndicatorsLoading(false);
    }
  };

  const fetchMarketEchoData = async ({ forceRefresh = false } = {}) => {
    try {
      setIsEchoLoading(true);
      setErrorMessage('');

      const data = await getMarketEchoAPI(period, { forceRefresh });

      if (Array.isArray(data) && data.length > 0) {
        updateMarketEchoData(data);
      }
    } catch (error) {
      console.error('Failed to fetch market echo data:', error);

      if (error.code === 'ECONNABORTED') {
        setErrorMessage(
          'MarketEcho Index API 응답 시간이 너무 길어 요청이 취소되었습니다. 프론트 timeout 또는 백엔드 처리 시간을 확인해야 합니다.'
        );
        return;
      }

      if (error.message === 'canceled' || error.name === 'CanceledError') {
        setErrorMessage(
          'MarketEcho Index 요청이 취소되었습니다. 중복 요청 또는 페이지 전환 여부를 확인해야 합니다.'
        );
        return;
      }

      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        'MarketEcho Index 데이터를 불러오지 못했습니다.';

      setErrorMessage(message);
    } finally {
      setIsEchoLoading(false);
    }
  };

  useEffect(() => {
    if (didFetchInitialData.current) {
      return;
    }

    didFetchInitialData.current = true;

    fetchIndicators();
    fetchMarketEchoData();
  }, []);

  useEffect(() => {
    if (!didFetchInitialData.current) {
      return;
    }

    fetchMarketEchoData();
  }, [period]);

  const handleUpdateChart = async () => {
    await fetchMarketEchoData({ forceRefresh: true });
  };

  const isLoading = isIndicatorsLoading || isEchoLoading;

  return (
    <div className="p-8 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            자산 보호 대시보드
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            기본 조회 기준 타임프레임:{' '}
            <span className="text-blue-600 dark:text-blue-400 font-bold">
              {period}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleUpdateChart}
            disabled={isEchoLoading}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-colors shadow-md shadow-blue-600/10"
          >
            <Activity className="w-3.5 h-3.5" />
            {isEchoLoading ? '차트 갱신 중' : '차트 갱신 테스트'}
          </button>

          <div className="flex items-center gap-2 bg-white dark:bg-[#0e172a] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 shadow-sm dark:shadow-none transition-colors duration-300">
            <RefreshCw
              className={`w-3.5 h-3.5 text-blue-600 dark:text-blue-500 ${
                isLoading ? 'animate-spin' : ''
              }`}
            />
            {isLoading ? '데이터 불러오는 중' : '전역 스토어 필터링 가동 중'}
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 flex items-start gap-2 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold">데이터 요청 오류</p>
            <p className="mt-1">{errorMessage}</p>
          </div>
        </div>
      )}

      <SummaryCards
        riskScore={getRiskScore()}
        totalBalance={getTotalBalance()}
      />

      <MarketIndicators indicators={indicators} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <MarketEchoChart data={marketEchoData || []} />
        <EmergencySignal message="미 국채 금리 임계치 돌파 위험 감지" />
      </div>
    </div>
  );
}