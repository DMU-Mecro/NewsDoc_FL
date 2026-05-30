from datetime import datetime

import google.generativeai as genai
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.report import Report
from app.repositories.news_repository import get_saved_news_by_user_id
from app.repositories.report_repository import (
    create_report,
    delete_report,
    get_report_by_id,
    get_reports_by_user_id,
)
from app.schemas.report import ReportGenerateRequest
from app.services.analyzer_service import analyze_news_impact
from app.services.index_service import calculate_marketecho_index
from app.services.market_service import get_current_price_for_ticker, normalize_yahoo_ticker
from app.services.portfolio_service import get_my_portfolio_summary
from app.services.rag_service import NewsRagService
from app.services.scraper_service import load_market_prices, load_raw_news


PRO_MACRO_REPORT_TYPES = {
    "pro_marketecho_report",
    "marketecho_report",
    "macro_report",
    "ai_news_insight_report",
}

MAX_RAG_CONTEXT_CHARS = 4500
MAX_PORTFOLIO_ITEMS_IN_REPORT = 20
MAX_SAVED_NEWS_IN_REPORT = 5


def _format_float(value: float | None) -> str:
    if value is None:
        return "N/A"

    return f"{value:.4f}"


def _safe_upper_text(value: str | None) -> str | None:
    if value is None:
        return None

    cleaned = str(value).upper().strip()

    if not cleaned:
        return None

    return cleaned


def _is_macro_pro_report(request: ReportGenerateRequest) -> bool:
    report_type = (request.report_type or "").strip().lower()

    return report_type in PRO_MACRO_REPORT_TYPES


def _truncate_text(
    text: str,
    max_chars: int,
    suffix: str = "\n\n...내용이 길어 일부를 생략했습니다.",
) -> str:
    if len(text) <= max_chars:
        return text

    return text[:max_chars].rstrip() + suffix


def _build_portfolio_context(
    db: Session,
    user_id: int,
    enabled: bool,
) -> str:
    if not enabled:
        return "포트폴리오 요약은 이번 리포트에서 제외되었습니다."

    try:
        summary = get_my_portfolio_summary(
            db=db,
            user_id=user_id,
        )

    except Exception as exc:
        return f"포트폴리오 요약 생성 중 오류가 발생하여 제외했습니다: {exc}"

    if not summary.items:
        return "등록된 포트폴리오가 없습니다."

    lines: list[str] = [
        f"총 매입금액: {summary.total_invested_amount}",
        f"총 평가금액: {summary.total_current_value}",
        f"총 평가손익: {summary.total_profit_loss}",
        f"총 수익률: {summary.total_profit_loss_rate}",
        "",
        "보유 종목:",
    ]

    for item in summary.items[:MAX_PORTFOLIO_ITEMS_IN_REPORT]:
        lines.append(
            (
                f"- {item.ticker} | 기업명: {item.company_name or 'N/A'} | "
                f"수량: {item.quantity} | 평균단가: {item.average_price} | "
                f"현재가: {item.current_price} | 평가손익: {item.profit_loss} | "
                f"수익률: {item.profit_loss_rate}%"
            )
        )

    if len(summary.items) > MAX_PORTFOLIO_ITEMS_IN_REPORT:
        lines.append(
            f"...보유 종목이 많아 {MAX_PORTFOLIO_ITEMS_IN_REPORT}개까지만 리포트 문맥에 포함했습니다."
        )

    return "\n".join(lines)


def _build_saved_news_context(
    db: Session,
    user_id: int,
    limit: int,
    ticker: str | None,
    enabled: bool,
) -> str:
    if not enabled:
        return "저장 뉴스는 이번 리포트에서 제외되었습니다."

    try:
        saved_news = get_saved_news_by_user_id(
            db=db,
            user_id=user_id,
        )

    except Exception as exc:
        return f"저장 뉴스 조회 중 오류가 발생하여 제외했습니다: {exc}"

    if ticker:
        ticker_upper = ticker.upper()
        saved_news = [
            news
            for news in saved_news
            if news.ticker and news.ticker.upper() == ticker_upper
        ]

    safe_limit = max(
        1,
        min(
            limit or MAX_SAVED_NEWS_IN_REPORT,
            MAX_SAVED_NEWS_IN_REPORT,
        ),
    )

    selected_news = saved_news[:safe_limit]

    if not selected_news:
        return "저장된 뉴스가 없습니다."

    lines: list[str] = []

    for index, news in enumerate(selected_news, start=1):
        lines.append(
            "\n".join(
                [
                    f"{index}. 제목: {news.title}",
                    f"   출처: {news.source or '알 수 없음'}",
                    f"   티커: {news.ticker or '없음'}",
                    f"   발행일: {news.published_at or '알 수 없음'}",
                    f"   요약: {news.summary or '요약 없음'}",
                    f"   URL: {news.url}",
                ]
            )
        )

    return "\n\n".join(lines)


def _build_market_context(
    ticker: str | None,
) -> str:
    if not ticker:
        return "별도 지정 티커가 없습니다. 이번 리포트는 특정 종목이 아니라 매크로 주제 중심으로 작성됩니다."

    normalized_symbol = normalize_yahoo_ticker(ticker)

    if not normalized_symbol:
        return "유효한 티커가 지정되지 않았습니다."

    current_price = get_current_price_for_ticker(normalized_symbol)

    if current_price is None:
        return f"{normalized_symbol} 현재가를 조회하지 못했습니다. 리포트 생성은 가격 데이터 없이 계속 진행합니다."

    return f"{normalized_symbol} 현재가: {current_price}"


def _calculate_current_marketecho_index() -> float | None:
    try:
        news_df = load_raw_news()
        market_df = load_market_prices()

        if news_df is None or news_df.empty:
            return None

        news_impact_response = analyze_news_impact(
            news_df=news_df,
            max_items=5,
        )

        index_response = calculate_marketecho_index(
            news_impact_response=news_impact_response,
            market_df=market_df,
        )

        return index_response.index_score

    except Exception:
        return None


def _build_rag_context(
    topic: str,
    index_score: float | None,
    enabled: bool,
) -> str:
    if not enabled:
        return "RAG 문맥은 이번 리포트에서 제외되었습니다."

    try:
        rag_service = NewsRagService()

        rag_response = rag_service.generate_rag_analysis(
            topic=topic,
            index_score=index_score,
        )

        content = rag_response.content or "RAG 문맥이 비어 있습니다."

        return _truncate_text(
            text=content,
            max_chars=MAX_RAG_CONTEXT_CHARS,
        )

    except Exception as exc:
        return f"RAG 문맥 생성 중 오류가 발생했습니다: {exc}"


def _build_final_report_prompt(
    request: ReportGenerateRequest,
    portfolio_context: str,
    saved_news_context: str,
    market_context: str,
    rag_context: str,
    marketecho_index: float | None,
) -> str:
    ticker_text = request.ticker.upper() if request.ticker else "전체 매크로 주제"
    index_text = _format_float(marketecho_index)

    return f"""
당신은 개인 투자자를 위한 글로벌 매크로/포트폴리오 분석 리포트를 작성하는 AI 애널리스트입니다.

이 리포트는 내부적으로 아래 구조를 사용합니다.

- 뉴스 기사 분석 및 RAG 문맥 생성: Gemini Flash
- 최종 리포트 작성: Gemini Pro
- 지수 계산 공식: Index = Sigma(Weight_i * impact_score_i)

[리포트 주제]
{request.topic}

[분석 대상]
{ticker_text}

[현재 MarketEcho Index]
{index_text}

[시장 데이터]
{market_context}

[포트폴리오 요약]
{portfolio_context}

[저장 뉴스]
{saved_news_context}

[RAG 기반 문맥]
{rag_context}

아래 형식으로 한국어 리포트를 작성하세요.

# 1. 핵심 요약
- 현재 시장, 뉴스, 매크로 환경을 3~5줄로 요약하세요.

# 2. MarketEcho Index 해석
- Index = Sigma(Weight_i * impact_score_i) 구조를 바탕으로 현재 지수가 어떤 방향성을 의미하는지 설명하세요.
- 양수면 위험선호, 인플레이션, 성장, 긴축 압력 중 어떤 성격인지 구분하세요.
- 음수면 완화, 침체, 위험회피 중 어떤 성격인지 구분하세요.
- 지수가 N/A라면 뉴스와 시장 문맥 중심으로 설명하세요.

# 3. 포트폴리오 또는 산업 영향
- 포트폴리오 정보가 있다면 보유 종목과 평가손익 관점에서 해석하세요.
- 포트폴리오 정보가 제외된 경우 관련 산업과 자산군 관점에서 설명하세요.
- 특정 티커가 입력된 경우 해당 티커 중심으로 설명하세요.

# 4. 뉴스 및 RAG 기반 해석
- 저장 뉴스와 RAG 문맥에서 반복되는 신호를 정리하세요.
- 단순 요약이 아니라 투자 환경에 미치는 영향을 설명하세요.

# 5. 주요 리스크
- 금리, 환율, 원자재, 실적, 수요 둔화, 밸류에이션, 정책 리스크 중 관련 있는 내용을 정리하세요.

# 6. 다음에 확인할 지표
- 사용자가 이후 확인해야 할 지표를 5개 이내로 제안하세요.

주의사항:
- 매수/매도 추천을 단정하지 마세요.
- 투자 조언이 아니라 분석 참고용 문서로 작성하세요.
- 과도한 확정 표현을 피하고 가능성 중심으로 설명하세요.
- 사용자에게 존댓말로 작성하세요.
""".strip()


def _generate_fallback_report(
    request: ReportGenerateRequest,
    portfolio_context: str,
    saved_news_context: str,
    market_context: str,
    rag_context: str,
    marketecho_index: float | None,
    error_message: str | None = None,
) -> str:
    ticker_text = request.ticker.upper() if request.ticker else "전체 매크로 주제"
    index_text = _format_float(marketecho_index)

    error_text = (
        f"\n\n오류 내용: {error_message}"
        if error_message
        else ""
    )

    return f"""
# {ticker_text} 분석 리포트

## 1. 생성 상태
Gemini Pro 호출에 실패했거나 응답이 비어 있어 기본 템플릿 리포트로 생성되었습니다.{error_text}

## 2. MarketEcho Index
현재 MarketEcho Index: {index_text}

공식:
Index = Sigma(Weight_i * impact_score_i)

## 3. 시장 데이터
{market_context}

## 4. 포트폴리오 요약
{portfolio_context}

## 5. 저장 뉴스
{saved_news_context}

## 6. RAG 기반 문맥
{rag_context}

## 7. 다음에 확인할 지표
- 미국 10년물 국채금리
- 달러 인덱스
- 금/구리/원유 가격
- 관련 기업 실적 발표
- 인플레이션 및 고용 지표

본 리포트는 투자 참고용이며, 매수 또는 매도 판단을 대신하지 않습니다.
""".strip()


def _generate_report_with_pro_model(
    prompt: str,
    fallback_content: str,
) -> str:
    api_key = settings.active_gemini_api_key

    if not api_key:
        return fallback_content

    try:
        genai.configure(api_key=api_key)

        model = genai.GenerativeModel(
            model_name=settings.GEMINI_REPORT_MODEL,
        )

        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.4,
                "max_output_tokens": 4096,
            },
        )

        text = getattr(response, "text", None)

        if not text:
            return fallback_content

        return text.strip()

    except Exception as exc:
        return f"{fallback_content}\n\nGemini Pro 호출 오류: {exc}"


def generate_report(
    db: Session,
    user_id: int,
    request: ReportGenerateRequest,
) -> Report:
    ticker = _safe_upper_text(request.ticker)

    is_macro_report = _is_macro_pro_report(request)

    marketecho_index = _calculate_current_marketecho_index()

    include_portfolio_summary = request.include_portfolio_summary

    if is_macro_report and ticker is None:
        include_portfolio_summary = False

    portfolio_context = _build_portfolio_context(
        db=db,
        user_id=user_id,
        enabled=include_portfolio_summary,
    )

    saved_news_context = _build_saved_news_context(
        db=db,
        user_id=user_id,
        limit=request.saved_news_limit,
        ticker=ticker,
        enabled=request.include_saved_news,
    )

    market_context = _build_market_context(
        ticker=ticker,
    )

    rag_context = _build_rag_context(
        topic=request.topic,
        index_score=marketecho_index,
        enabled=request.include_rag_context,
    )

    prompt = _build_final_report_prompt(
        request=request,
        portfolio_context=portfolio_context,
        saved_news_context=saved_news_context,
        market_context=market_context,
        rag_context=rag_context,
        marketecho_index=marketecho_index,
    )

    fallback_content = _generate_fallback_report(
        request=request,
        portfolio_context=portfolio_context,
        saved_news_context=saved_news_context,
        market_context=market_context,
        rag_context=rag_context,
        marketecho_index=marketecho_index,
    )

    content = _generate_report_with_pro_model(
        prompt=prompt,
        fallback_content=fallback_content,
    )

    if request.title:
        title = request.title
    else:
        now_text = datetime.now().strftime("%Y-%m-%d %H:%M")
        target = ticker if ticker else request.topic
        title = f"{target} AI 리포트 - {now_text}"

    return create_report(
        db=db,
        user_id=user_id,
        title=title,
        report_type=request.report_type,
        source_ticker=ticker,
        topic=request.topic,
        marketecho_index=marketecho_index,
        content=content,
        status="completed",
    )


def get_my_reports(
    db: Session,
    user_id: int,
) -> list[Report]:
    return get_reports_by_user_id(
        db=db,
        user_id=user_id,
    )


def get_my_report_detail(
    db: Session,
    user_id: int,
    report_id: int,
) -> Report:
    report = get_report_by_id(
        db=db,
        report_id=report_id,
    )

    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="리포트를 찾을 수 없습니다.",
        )

    if report.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="해당 리포트에 접근할 권한이 없습니다.",
        )

    return report


def delete_my_report(
    db: Session,
    user_id: int,
    report_id: int,
) -> None:
    report = get_my_report_detail(
        db=db,
        user_id=user_id,
        report_id=report_id,
    )

    delete_report(
        db=db,
        report=report,
    )