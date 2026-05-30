// src/pages/Insights.jsx
import { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

import BriefingReport from '@/components/insights/BriefingReport.jsx';
import InsightSearchForm from '@/components/insights/InsightSearchForm.jsx';
import AnalysisResult from '@/components/insights/AnalysisResult.jsx';

import {
  analyzeQueryAPI,
  generateProReportAPI,
  getBriefingReportAPI,
  updateInsightDataAPI,
} from '@/api/insights.js';

export default function Insights() {
  const [query, setQuery] = useState('');
  const [briefing, setBriefing] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [proReport, setProReport] = useState(null);

  const [showReport, setShowReport] = useState(false);
  const [isBriefingLoading, setIsBriefingLoading] = useState(true);
  const [isUpdatingData, setIsUpdatingData] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingProReport, setIsGeneratingProReport] = useState(false);

  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const isBusy =
    isBriefingLoading ||
    isUpdatingData ||
    isAnalyzing ||
    isGeneratingProReport;

  const fetchBriefing = async () => {
    setIsBriefingLoading(true);
    setErrorMessage('');

    try {
      const data = await getBriefingReportAPI();

      setBriefing(data);
    } catch (error) {
      console.error('Failed to fetch briefing report:', error);

      setErrorMessage(
        '브리핑을 불러오지 못했습니다. 백엔드 서버와 로그인 토큰을 확인해 주세요.'
      );
    } finally {
      setIsBriefingLoading(false);
    }
  };

  useEffect(() => {
    let isActive = true;

    const loadInitialBriefing = async () => {
      try {
        const data = await getBriefingReportAPI();

        if (!isActive) {
          return;
        }

        setBriefing(data);
      } catch (error) {
        console.error('Failed to fetch briefing report:', error);

        if (!isActive) {
          return;
        }

        setErrorMessage(
          '브리핑을 불러오지 못했습니다. 백엔드 서버와 로그인 토큰을 확인해 주세요.'
        );
      } finally {
        if (isActive) {
          setIsBriefingLoading(false);
        }
      }
    };

    loadInitialBriefing();

    return () => {
      isActive = false;
    };
  }, []);

  const handleUpdateData = async () => {
    setIsUpdatingData(true);
    setStatusMessage('');
    setErrorMessage('');

    try {
      const data = await updateInsightDataAPI();

      setStatusMessage(
        `뉴스 ${data.newsCount}건, 시장 데이터 ${data.marketRows}행, 벡터화 ${data.vectorizedNewsCount}건 업데이트 완료`
      );

      await fetchBriefing();
    } catch (error) {
      console.error('Failed to update insight data:', error);

      setErrorMessage(
        '뉴스 데이터 갱신에 실패했습니다. Gemini API 키, 인터넷 연결, 백엔드 로그를 확인해 주세요.'
      );
    } finally {
      setIsUpdatingData(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!query.trim()) {
      setErrorMessage('분석할 질문을 입력해 주세요.');
      return;
    }

    setIsAnalyzing(true);
    setShowReport(false);
    setStatusMessage('');
    setErrorMessage('');
    setProReport(null);

    try {
      const data = await analyzeQueryAPI(query);

      setAnalysisResult(data);
      setShowReport(true);
    } catch (error) {
      console.error('Failed to analyze query:', error);

      setErrorMessage(
        '인사이트 도출에 실패했습니다. 백엔드의 /api/v1/analysis/rag-report 응답을 확인해 주세요.'
      );

      setShowReport(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateProReport = async () => {
    if (!query.trim()) {
      setErrorMessage('Gemini 3 Pro 리포트를 생성할 주제를 먼저 입력해 주세요.');
      return;
    }

    setIsGeneratingProReport(true);
    setStatusMessage('');
    setErrorMessage('');

    try {
      const data = await generateProReportAPI(query);

      setProReport(data);
      setStatusMessage('Gemini 3 Pro 최종 리포트 생성이 완료되었습니다.');
    } catch (error) {
      console.error('Failed to generate Pro report:', error);

      setErrorMessage(
        'Gemini 3 Pro 리포트 생성에 실패했습니다. 백엔드의 /api/v1/reports/generate 응답과 report_service.py를 확인해 주세요.'
      );
    } finally {
      setIsGeneratingProReport(false);
    }
  };

  return (
    <div className="p-8 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="text-purple-500 w-6 h-6" />
            AI 뉴스 인사이트
          </h1>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gemini 3 Flash RAG 분석과 Gemini 3 Pro 최종 리포트 생성
          </p>
        </div>

        <button
          type="button"
          onClick={handleUpdateData}
          disabled={isBusy}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-500 dark:bg-purple-600 dark:hover:bg-purple-700 dark:disabled:bg-purple-900 text-white text-sm font-bold transition-all shadow-md shrink-0"
        >
          {isUpdatingData ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              뉴스 데이터 갱신 중
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              뉴스 데이터 갱신
            </>
          )}
        </button>
      </div>

      {statusMessage && (
        <div className="mb-5 flex items-start gap-2 rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/5 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <p>{statusMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="mb-5 flex items-start gap-2 rounded-xl border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/5 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}

      {isBriefingLoading ? (
        <div className="bg-white dark:bg-[#0b1324] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none mb-8 flex items-center gap-3 text-slate-500 dark:text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
          <span className="text-sm">AI 뉴스 브리핑을 불러오는 중입니다.</span>
        </div>
      ) : (
        <BriefingReport report={briefing} />
      )}

      <InsightSearchForm
        query={query}
        setQuery={setQuery}
        onSearch={handleSearch}
        isLoading={isAnalyzing}
        isDisabled={isUpdatingData || isGeneratingProReport}
      />

      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between rounded-2xl border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-500/5 p-5">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Gemini 3 Pro 최종 리포트 생성
          </h3>

          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            위 질문 입력창의 주제를 기반으로 장문 리포트를 생성합니다. RAG 인사이트는 Flash,
            최종 리포트 작성은 Pro 모델을 사용합니다.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGenerateProReport}
          disabled={isBusy || !query.trim()}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900/50 disabled:cursor-not-allowed text-white text-sm font-bold transition-all shadow-md shrink-0"
        >
          {isGeneratingProReport ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Pro 리포트 생성 중
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              Gemini 3 Pro 리포트 생성
            </>
          )}
        </button>
      </div>

      {isAnalyzing && (
        <div className="flex justify-center items-center py-12 text-purple-600 dark:text-purple-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      )}

      {!isAnalyzing && showReport && (
        <AnalysisResult
          result={analysisResult}
          sourceArticles={analysisResult?.sourceArticles || []}
        />
      )}

      {proReport && (
        <div className="mt-8 bg-white dark:bg-[#0b1324] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none transition-colors duration-300">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-300 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Gemini 3 Pro 최종 리포트
              </h3>

              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                /api/v1/reports/generate 기반 장문 분석 결과
              </p>
            </div>

            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-500/20 w-fit">
              GEMINI 3 PRO REPORT
            </span>
          </div>

          <div className="mb-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0d172a] p-4">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              리포트 제목
            </p>

            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              {proReport.title || `${query} Pro 리포트`}
            </h4>
          </div>

          {typeof proReport.marketechoIndex === 'number' && (
            <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                MarketEcho Index
              </span>

              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                {proReport.marketechoIndex.toFixed(4)}
              </span>
            </div>
          )}

          <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line rounded-xl border border-indigo-100 dark:border-indigo-500/10 bg-indigo-50/40 dark:bg-indigo-500/5 p-5">
            {proReport.content || '리포트 내용이 비어 있습니다.'}
          </div>
        </div>
      )}
    </div>
  );
}