import { CheckCircle, ExternalLink, ShieldCheck } from 'lucide-react';

export default function AnalysisResult({ result, sourceArticles = [] }) {
  const summary = result?.summary || '분석 결과가 없습니다.';
  const factors = result?.factors?.length ? result.factors : [];
  const confidenceScore = result?.confidenceScore || 50;
  const retrievedCount = result?.retrievedCount || sourceArticles.length || 0;

  const confidenceLabel =
    confidenceScore >= 80 ? 'HIGH CONFIDENCE' : confidenceScore >= 60 ? 'MEDIUM CONFIDENCE' : 'LOW CONFIDENCE';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white dark:bg-[#0b1324] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none lg:col-span-2 transition-colors duration-300">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-300 mb-4 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
          RAG 검색 증강 컨텍스트 분석 결과
        </h3>

        <div className="p-4 bg-slate-50 dark:bg-[#0d172a] rounded-xl border border-cyan-100 dark:border-[#0e2938] relative pl-4 before:absolute before:top-0 before:left-0 before:w-1 before:h-full before:bg-cyan-500 before:rounded-l-xl transition-colors duration-300">
          <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 block tracking-wide">
            GEMINI 3 FLASH RAG ANALYSIS
          </span>

          <div className="text-xs text-slate-800 dark:text-slate-200 mt-2 leading-relaxed whitespace-pre-line">
            {summary}
          </div>

          {factors.length > 0 && (
            <ul className="text-xs text-slate-600 dark:text-slate-400 mt-4 leading-relaxed pl-2 space-y-1">
              {factors.map((factor, idx) => (
                <li key={`${factor}-${idx}`}>- {factor}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6">
          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3">
            의사결정 추론 기반 지식 베이스
          </h4>

          {sourceArticles.length === 0 ? (
            <div className="p-4 bg-slate-50 dark:bg-[#0d172a] rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
              참고 뉴스 문맥이 없습니다. 먼저 [뉴스 데이터 갱신]을 실행한 뒤 다시 분석해 주세요.
            </div>
          ) : (
            <div className="space-y-2.5">
              {sourceArticles.map((article, index) => (
                <div
                  key={article.id || `${article.title}-${index}`}
                  className="flex justify-between items-center p-3 bg-slate-50 dark:bg-[#0d172a] rounded-xl border border-slate-200 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-950 text-slate-600 dark:text-slate-400 shrink-0">
                      {article.media || article.source || 'NEWS'}
                    </span>

                    <p className="text-xs text-slate-700 dark:text-slate-300 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {article.title}
                    </p>
                  </div>

                  {article.url && (
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 p-1 shrink-0 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-[#0b1324] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none flex flex-col justify-between items-center text-center transition-colors duration-300">
        <div className="w-full">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-300 flex items-center justify-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            리포트 정합성 검증
          </h3>

          <p className="text-[11px] text-slate-500">
            ChromaDB 벡터 검색 기반 신뢰 점수
          </p>
        </div>

        <div className="my-6 relative flex items-center justify-center">
          <div className="w-32 h-32 rounded-full border-4 border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center relative transition-colors duration-300">
            <div className="absolute inset-0 rounded-full border-4 border-t-emerald-500 border-r-emerald-500 border-b-transparent border-l-transparent animate-pulse"></div>
            <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter">
              {confidenceScore}%
            </span>
            <span className="text-[10px] text-slate-500 font-bold mt-0.5">
              {confidenceLabel}
            </span>
          </div>
        </div>

        <div className="w-full p-3.5 bg-emerald-50 dark:bg-emerald-500/5 rounded-xl border border-emerald-200 dark:border-emerald-500/10 text-xs text-slate-600 dark:text-slate-400 leading-relaxed transition-colors duration-300">
          본 답변은 검색된{' '}
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
            {retrievedCount}개의 뉴스 문맥
          </span>
          을 기반으로 생성된 분석 리포트입니다. 투자 판단을 단정하는 자료가 아니라 참고용 분석 결과입니다.
        </div>
      </div>
    </div>
  );
}