// 사이드바 기본 유저 데이터 (백엔드 연동 전)
export const defaultUser = { nickname: '김한빈', tier: 'Ultra' };

// 대시보드 - MarketEcho Index 차트 데이터
export const marketEchoData = [
  { time: '00:00', 지수: 12 },
  { time: '02:00', 지수: 8 },
  { time: '04:00', 지수: -5 },
  { time: '06:00', 지수: -15 },
  { time: '08:00', 지수: -12 },
];

export const macroIndicators = [
  { id: 'us_10y_yield', label: '미 국채 10년물 (^TNX)', value: '4.25%', change: '+0.15%', up: true, border: 'border-amber-500/20' },
  { id: 'wti_price', label: '달러 인덱스 (DX=F)', value: '104.8', change: '+0.32%', up: true },
  { id: 'sp500', label: 'S&P 500 (^GSPC)', value: '5,280.2', change: '-1.12%', up: false },
  { id: 'gold_price', label: '금 선물 (GC=F)', value: '$2,350.5', change: '+0.45%', up: true },
];

// 포트폴리오 - 자산 데이터 (총액 ₩100,000,000 기준)
export const initialAssets = [
  { id: 1, name: '삼성전자', type: '주식', quantity: 420, price: 71400, total: 30000000 },
  { id: 2, name: 'KODEX 레버리지', type: '주식', quantity: 400, price: 25000, total: 10000000 },
  { id: 3, name: '국민은행 정기예금', type: '예적금', quantity: 1, price: 40000000, total: 40000000 },
  { id: 4, name: '보유 현금', type: '현금', quantity: 1, price: 20000000, total: 20000000 },
];

// 포트폴리오 - 차트용 카테고리별 정렬 데이터
export const portfolioChartData = [
  { name: '주식', value: 40000000, color: '#3b82f6' },     // Blue
  { name: '예적금', value: 40000000, color: '#10b981' },   // Emerald
  { name: '현금', value: 20000000, color: '#f59e0b' },     // Amber
];

// 포트폴리오 - 관심 자산(Watchlist)
export const watchlistData = [
  { id: 'gold_price', label: '🥇 금 선물 (GC=F)', value: '$2,350.50', change: '+1.2%', up: true },
  { id: 'wti_price', label: '🛢️ WTI 유가 (CL=F)', value: '$82.50', change: '-0.8%', up: false },
  { id: 'nvda', label: '🚀 NVIDIA (NVDA)', value: '$925.50', change: '+2.3%', up: true },
  { id: 'sp500', label: '📈 S&P 500 (^GSPC)', value: '5,280.20', change: '+1.1%', up: true },
];

// 리밸런싱 - 기획서 반영: 현재 보유 비중 vs AI 추천 비중 데이터 
export const gapData = [
  { name: '주식 섹터', 현재비중: 40, 추천비중: 30 },
  { name: '예적금 섹터', 현재비중: 40, 추천비중: 50 },
  { name: '안전 현금', 현재비중: 20, 추천비중: 20 },
];

// 리밸런싱 - 기획서 기반 구체적 액션 리스트
export const actionList = [
  {
    id: 1,
    title: '삼성전자 50주 매도',
    description: '약 ₩3,570,000 확보 (현재가 기준 차익 실현)',
    priority: 'HIGH',
    color: 'border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/5 text-amber-600 dark:text-amber-400',
  },
  {
    id: 2,
    title: '1년 만기 정기예금 150만 원 가입',
    description: '국민은행 연 4.5% 상품 연동 가이드',
    priority: 'MEDIUM',
    color: 'border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/5 text-blue-600 dark:text-blue-400',
  },
  {
    id: 3,
    title: 'KODEX 레버리지 30주 추가 매수',
    description: '단가 조정 및 포트폴리오 밸런스 조정 목적',
    priority: 'HIGH',
    color: 'border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/5 text-amber-600 dark:text-amber-400',
  },
];

// 인사이트 - 뉴스 데이터
export const sourceArticles = [
  { id: 1, title: '"금값 상승 배경, 달러 약세와 글로벌 불안감"', media: '로이터', date: '2026-05-20', url: '#' },
  { id: 2, title: '"인플레이션 심화로 안전자산 선호도 증가"', media: 'WSJ', date: '2026-05-18', url: '#' },
  { id: 3, title: '"중앙은행, 금 매입 강화 사이클 진입"', media: '블룸버그', date: '2026-05-15', url: '#' },
];

// 시뮬레이션 - 기획서 시나리오 기반 10년 자산 시뮬레이션 백테스트 데이터 (현재 ₩50M 기준 예측 궤적)
export const simulationData = [
  { year: '현재', 기본: 5000, 최선: 5000, 최악: 5000 },
  { year: '2년후', 기본: 5600, 최선: 6200, 최악: 5200 },
  { year: '4년후', 기본: 6400, 최선: 7800, 최악: 5500 },
  { year: '6년후', 기본: 7200, 최선: 9500, 최악: 5700 },
  { year: '8년후', 기본: 8100, 최선: 11200, 최악: 5600 },
  { year: '10년후', 기본: 8900, 최선: 12700, 최악: 5800 },
];