import time

from fastapi import APIRouter, Depends, Query

from app.api.v1.auth import get_current_user
from app.models.user import User
from app.schemas.analysis import (
    BriefingResponse,
    DataUpdateResponse,
    MarketEchoIndexResponse,
    NewsImpactResponse,
    RagAnalysisRequest,
    RagAnalysisResponse,
)
from app.services.analyzer_service import analyze_news_impact
from app.services.index_service import calculate_marketecho_index
from app.services.rag_service import NewsRagService
from app.services.scraper_service import (
    fetch_accumulated_news,
    fetch_robust_market_data,
    load_market_prices,
    load_raw_news,
)


router = APIRouter(
    prefix="/analysis",
    tags=["Analysis"],
)


_MARKETECHO_CACHE: dict[str, object] = {
    "data": None,
    "created_at": 0.0,
    "max_items": None,
}

_MARKETECHO_CACHE_TTL_SECONDS = 60


def _get_cached_marketecho_index(
    max_items: int,
) -> MarketEchoIndexResponse | None:
    cached_data = _MARKETECHO_CACHE.get("data")
    cached_at = float(_MARKETECHO_CACHE.get("created_at") or 0.0)
    cached_max_items = _MARKETECHO_CACHE.get("max_items")

    if cached_data is None:
        return None

    if cached_max_items != max_items:
        return None

    now = time.time()
    cache_age = now - cached_at

    if cache_age > _MARKETECHO_CACHE_TTL_SECONDS:
        return None

    return cached_data


def _set_cached_marketecho_index(
    max_items: int,
    data: MarketEchoIndexResponse,
) -> None:
    _MARKETECHO_CACHE["data"] = data
    _MARKETECHO_CACHE["created_at"] = time.time()
    _MARKETECHO_CACHE["max_items"] = max_items


def _clear_marketecho_cache() -> None:
    _MARKETECHO_CACHE["data"] = None
    _MARKETECHO_CACHE["created_at"] = 0.0
    _MARKETECHO_CACHE["max_items"] = None


def _load_or_fetch_news():
    news_df = load_raw_news()

    if news_df is not None and not news_df.empty:
        return news_df

    return fetch_accumulated_news()


def _load_or_fetch_market():
    market_df = load_market_prices()

    if market_df is not None and not market_df.empty:
        return market_df

    return fetch_robust_market_data()


def _calculate_or_get_cached_index(
    max_items: int = 5,
    force_refresh: bool = False,
) -> MarketEchoIndexResponse:
    if not force_refresh:
        cached_response = _get_cached_marketecho_index(
            max_items=max_items,
        )

        if cached_response is not None:
            return cached_response

    news_df = _load_or_fetch_news()
    market_df = _load_or_fetch_market()

    news_impact_response = analyze_news_impact(
        news_df=news_df,
        max_items=max_items,
    )

    index_response = calculate_marketecho_index(
        news_impact_response=news_impact_response,
        market_df=market_df,
    )

    _set_cached_marketecho_index(
        max_items=max_items,
        data=index_response,
    )

    return index_response


def _make_briefing_title(
    index_response: MarketEchoIndexResponse,
) -> str:
    if not index_response.factors:
        return "매크로 데이터 부족으로 인한 관망 국면"

    strongest_factor = max(
        index_response.factors,
        key=lambda factor: abs(factor.weighted_score),
    )

    factor_label_map = {
        "sentiment": "시장 심리",
        "bond": "미 국채 금리",
        "gold": "금 가격",
        "copper": "구리 가격",
        "usd": "달러",
        "energy": "에너지",
    }

    factor_name = factor_label_map.get(
        strongest_factor.name,
        strongest_factor.name,
    )

    if strongest_factor.weighted_score > 0:
        direction = "상방 압력"
    elif strongest_factor.weighted_score < 0:
        direction = "하방 압력"
    else:
        direction = "중립 신호"

    return f"{factor_name} 중심의 {direction} 인과관계"


def _make_briefing_impacts(
    index_response: MarketEchoIndexResponse,
) -> list[str]:
    if not index_response.factors:
        return [
            "뉴스 및 시장 데이터가 부족하여 영향 요인을 계산하지 못했습니다.",
        ]

    sorted_factors = sorted(
        index_response.factors,
        key=lambda factor: abs(factor.weighted_score),
        reverse=True,
    )

    factor_label_map = {
        "sentiment": "시장 심리",
        "bond": "채권/금리",
        "gold": "금/안전자산",
        "copper": "구리/산업수요",
        "usd": "달러/환율",
        "energy": "에너지/원유",
    }

    impacts: list[str] = []

    for factor in sorted_factors[:5]:
        factor_name = factor_label_map.get(
            factor.name,
            factor.name,
        )

        if factor.impact_score > 0:
            direction = "상방 압력 또는 위험 요인 확대"
        elif factor.impact_score < 0:
            direction = "하방 압력 또는 완화 신호"
        else:
            direction = "중립에 가까운 신호"

        impacts.append(
            (
                f"{factor_name}: impact {factor.impact_score:.4f}, "
                f"weight {factor.weight:.2f}, "
                f"weighted {factor.weighted_score:.4f}로 {direction}"
            )
        )

    return impacts


def _make_recommendation(
    index_score: float | None,
) -> str:
    if index_score is None:
        return "시스템 가이드: 데이터가 부족하므로 먼저 뉴스 데이터 갱신을 실행해 주세요."

    if index_score >= 0.25:
        return "시스템 가이드: 긴축·인플레이션·원자재 압력 가능성이 있으므로 현금, 방어주, 원자재 민감도를 함께 점검하는 것이 좋습니다."

    if index_score <= -0.25:
        return "시스템 가이드: 위험회피 또는 경기 둔화 신호 가능성이 있으므로 성장주, 채권, 달러 흐름을 함께 확인하는 것이 좋습니다."

    return "시스템 가이드: 지수가 중립권에 있으므로 단일 뉴스보다 금리, 달러, 원자재, 실적 데이터를 함께 확인하는 것이 좋습니다."


@router.post(
    "/update-data",
    response_model=DataUpdateResponse,
)
def update_analysis_data(
    current_user: User = Depends(get_current_user),
):
    news_df = fetch_accumulated_news()
    market_df = fetch_robust_market_data()

    rag_service = NewsRagService()
    vectorized_count = rag_service.add_news_to_vector_db(news_df)

    _clear_marketecho_cache()

    return DataUpdateResponse(
        news_count=len(news_df),
        market_rows=len(market_df),
        vectorized_news_count=vectorized_count,
        message="뉴스, 시장 데이터, 벡터 DB 업데이트가 완료되었습니다.",
    )


@router.post(
    "/news-impact",
    response_model=NewsImpactResponse,
)
def analyze_news_impact_api(
    max_items: int = Query(default=5, ge=1, le=50),
    current_user: User = Depends(get_current_user),
):
    news_df = _load_or_fetch_news()

    return analyze_news_impact(
        news_df=news_df,
        max_items=max_items,
    )


@router.get(
    "/marketecho-index",
    response_model=MarketEchoIndexResponse,
)
def read_marketecho_index(
    max_items: int = Query(default=5, ge=1, le=50),
    force_refresh: bool = Query(default=False),
    current_user: User = Depends(get_current_user),
):
    return _calculate_or_get_cached_index(
        max_items=max_items,
        force_refresh=force_refresh,
    )


@router.get(
    "/briefing",
    response_model=BriefingResponse,
)
def read_ai_news_briefing(
    max_items: int = Query(default=5, ge=1, le=20),
    force_refresh: bool = Query(default=False),
    current_user: User = Depends(get_current_user),
):
    index_response = _calculate_or_get_cached_index(
        max_items=max_items,
        force_refresh=force_refresh,
    )

    rag_service = NewsRagService()

    rag_response = rag_service.generate_rag_analysis(
        topic="macro economy market risk inflation interest rate",
        index_score=index_response.index_score,
    )

    title = _make_briefing_title(
        index_response=index_response,
    )

    impacts = _make_briefing_impacts(
        index_response=index_response,
    )

    recommendation = _make_recommendation(
        index_score=index_response.index_score,
    )

    return BriefingResponse(
        title=title,
        summary=rag_response.content,
        impacts=impacts,
        recommendation=recommendation,
        index_score=index_response.index_score,
        confidence_score=rag_response.confidence_score,
        source_articles=rag_response.source_articles,
    )


@router.post(
    "/rag-report",
    response_model=RagAnalysisResponse,
)
def create_rag_analysis_report(
    request: RagAnalysisRequest,
    current_user: User = Depends(get_current_user),
):
    index_score = request.index_score

    if index_score is None:
        index_response = _calculate_or_get_cached_index(
            max_items=5,
            force_refresh=False,
        )
        index_score = index_response.index_score

    rag_service = NewsRagService()

    return rag_service.generate_rag_analysis(
        topic=request.topic,
        index_score=index_score,
    )