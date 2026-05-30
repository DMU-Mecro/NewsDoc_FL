import { Flame, Newspaper } from 'lucide-react';

export default function BriefingReport({ report }) {
  const title = report?.title || '뉴스 데이터 갱신 후 브리핑을 확인해 주세요.';
  const summary =
    report?.summary ||
    '아직 AI 뉴스 브리핑 데이터가 없습니다. 우측 상단의 [뉴스 데이터 갱신] 버튼을 누르면 뉴스 수집, 시장 데이터 수집, 벡터 DB 업데이트가 진행됩니다.';

  const impacts = report?.impacts?.length
    ? report.impacts
    : [
        '뉴스 수집 후 주요 매크로 영향 요인이 표시됩니다.',
        'MarketEcho Index 계산 후 금리, 달러, 원자재, 시장 심리 요인이 표시됩니다.',
      ];

  const recommendation =
    report?.recommendation ||
    '시스템 가이드: 먼저 뉴스 데이터 갱신을 실행한 뒤 인사이트를 도출해 주세요.';

  const indexScore = report?.indexScore;

  return (
    <div className="bg-white dark:bg-[#0b1324] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none mb-8 relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 dark:bg-purple-600/5 blur-[80px] rounded-full"></div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-4 relative z-10">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-300 flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          매크로 이슈 Decision Logic 브리핑
        </h3>

        <div className="flex items-center gap-2">
          {typeof indexScore === 'number' && (
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
              MarketEcho {indexScore.toFixed(4)}
            </span>
          )}

          <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-500/20 transition-colors">
            Gemini 3 Flash 연동
          </span>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-[#0d172a] p-5 rounded-xl border border-purple-200 dark:border-purple-900/30 relative pl-5 before:absolute before:top-0 before:left-0 before:w-1 before:h-full before:bg-purple-500 before:rounded-l-xl transition-colors duration-300">
        <p className="text-sm font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-amber-500" />
          최근 핵심 이슈: {title}
        </p>

        <div className="text-xs text-slate-700 dark:text-slate-300 mt-3 leading-relaxed whitespace-pre-line">
          {summary}
        </div>

        <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400 pl-1">
          {impacts.map((impact, idx) => (
            <li key={`${impact}-${idx}`} className="flex items-start gap-2">
              <span className="w-1 h-1 rounded-full bg-purple-400 mt-1.5 shrink-0"></span>
              <span>{impact}</span>
            </li>
          ))}
        </ul>

        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-4 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-500/5 px-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-500/10 w-fit transition-colors">
          {recommendation}
        </p>
      </div>
    </div>
  );
}