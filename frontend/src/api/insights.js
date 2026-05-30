import api from './index';

const splitContentToFactors = (content) => {
  if (!content) return [];

  return content
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^#+\s*/, '').replace(/^[-*]\s*/, ''))
    .filter((line) => line.length >= 8)
    .slice(0, 5);
};

export const updateInsightDataAPI = async () => {
  const response = await api.post('/api/v1/analysis/update-data');

  return {
    newsCount: response.data.news_count,
    marketRows: response.data.market_rows,
    vectorizedNewsCount: response.data.vectorized_news_count,
    message: response.data.message,
    raw: response.data,
  };
};

export const getBriefingReportAPI = async () => {
  const response = await api.get('/api/v1/analysis/briefing', {
    params: {
      max_items: 5,
      force_refresh: false,
    },
  });

  return {
    title: response.data.title,
    summary: response.data.summary,
    impacts: response.data.impacts || splitContentToFactors(response.data.summary),
    recommendation: response.data.recommendation,
    confidenceScore: response.data.confidence_score || 50,
    sourceArticles: response.data.source_articles || [],
    indexScore: response.data.index_score,
    raw: response.data,
  };
};

export const analyzeQueryAPI = async (query) => {
  const response = await api.post('/api/v1/analysis/rag-report', {
    topic: query,
    index_score: null,
  });

  return {
    summary: response.data.content,
    factors: response.data.factors || splitContentToFactors(response.data.content),
    confidenceScore: response.data.confidence_score || 50,
    sourceArticles: response.data.source_articles || [],
    retrievedCount: response.data.retrieved_count || 0,
    indexScore: response.data.index_score,
    raw: response.data,
  };
};

export const generateProReportAPI = async (query) => {
  const response = await api.post('/api/v1/reports/generate', {
    title: `${query} Pro 리포트`,
    report_type: 'pro_marketecho_report',
    topic: query,
    // ticker: null,
    saved_news_limit: 5,
    include_rag_context: true,
    include_portfolio_summary: false, // 포트폴리오 요약을 포함하면 백엔드가 보유 종목들의 가격 데이터를 조회하면서 005930 같은 티커 문제를 일으킬 수 있습니다.
    include_saved_news: true,
  });

  return {
    id: response.data.id,
    title: response.data.title,
    reportType: response.data.report_type,
    topic: response.data.topic,
    marketechoIndex: response.data.marketecho_index,
    content: response.data.content,
    status: response.data.status,
    createdAt: response.data.created_at,
    raw: response.data,
  };
};