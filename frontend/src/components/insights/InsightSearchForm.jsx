import { Loader2, MessageSquare, Search } from 'lucide-react';

export default function InsightSearchForm({
  query,
  setQuery,
  onSearch,
  isLoading = false,
  isDisabled = false,
}) {
  return (
    <div className="bg-white dark:bg-[#0b1324] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none mb-8 transition-colors duration-300">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-300 mb-3 flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-blue-500 dark:text-blue-400" />
        자연어 맞춤형 분석 요청
      </h3>

      <form onSubmit={onSearch} className="flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute top-3.5 left-4" />

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading || isDisabled}
            placeholder="예: 최근 금 가격 상승 원인을 분석해줘"
            className="w-full p-3 pl-11 bg-slate-50 dark:bg-[#0d172a] border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500 disabled:opacity-60 transition-colors duration-300"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || isDisabled}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 disabled:bg-purple-900/60 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-purple-600/10 shrink-0 inline-flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              분석 중
            </>
          ) : (
            '인사이트 도출'
          )}
        </button>
      </form>

      <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
        뉴스 데이터가 오래되었거나 결과가 부족하면 먼저 우측 상단의 [뉴스 데이터 갱신]을 실행해 주세요.
      </p>
    </div>
  );
}