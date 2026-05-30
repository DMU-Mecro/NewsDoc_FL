import concurrent.futures
import json
import re

import google.generativeai as genai
import pandas as pd

from app.core.config import settings
from app.schemas.analysis import NewsImpactItem, NewsImpactResponse


def _extract_json_object(text: str) -> dict | None:
    cleaned = text.strip()
    cleaned = cleaned.replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    match = re.search(r"\{.*\}", cleaned, re.DOTALL)

    if not match:
        return None

    try:
        return json.loads(match.group(0))
    except json.JSONDecodeError:
        return None


def _clip_score(value: float) -> float:
    return max(-1.0, min(1.0, float(value)))


class NewsImpactAnalyzer:
    def __init__(self) -> None:
        api_key = settings.active_gemini_api_key

        if not api_key:
            raise ValueError("Gemini API 키가 설정되지 않았습니다.")

        genai.configure(api_key=api_key)

        self.model = genai.GenerativeModel(
            model_name=settings.GEMINI_NEWS_ANALYSIS_MODEL
        )

    def analyze_single_news(
        self,
        title: str,
        source: str | None = None,
        published_at: str | None = None,
    ) -> dict | None:
        prompt = f"""
당신은 글로벌 매크로 전략가입니다.

아래 뉴스 제목을 읽고 금융시장에 미치는 영향을 JSON으로 평가하세요.

[뉴스 제목]
{title}

[출처]
{source or "Unknown"}

[발행 시각]
{published_at or "Unknown"}

평가 기준:
- sentiment_score: 시장 심리 점수입니다. -1.0에서 1.0 사이입니다.
- impact_score: MarketEcho Index에 반영할 충격 점수입니다. -1.0에서 1.0 사이입니다.
- impact_factor: sentiment, bond, gold, copper, usd, energy 중 가장 관련 높은 항목 하나입니다.
- analysis: 한 줄 이유입니다.

해석 기준:
- 금리 상승, 달러 강세, 인플레이션 재가속, 에너지 가격 상승은 긴축/비용 압력으로 해석합니다.
- 금리 하락, 달러 약세, 인플레이션 둔화는 완화적 신호로 해석합니다.
- 구리 상승은 성장 기대 또는 산업 수요 신호로 해석합니다.
- 금 상승은 안전자산 선호 또는 인플레이션 헤지 신호로 해석합니다.

반드시 아래 JSON 형식으로만 답변하세요.

{{
  "sentiment_score": 0.0,
  "impact_score": 0.0,
  "impact_factor": "sentiment",
  "analysis": "한 줄 이유"
}}
""".strip()

        try:
            response = self.model.generate_content(prompt)
            data = _extract_json_object(response.text)

            if not data:
                return None

            sentiment_score = _clip_score(
                float(data.get("sentiment_score", 0.0))
            )
            impact_score = _clip_score(
                float(data.get("impact_score", 0.0))
            )

            impact_factor = str(
                data.get("impact_factor", "sentiment")
            ).lower()

            allowed_factors = {
                "sentiment",
                "bond",
                "gold",
                "copper",
                "usd",
                "energy",
            }

            if impact_factor not in allowed_factors:
                impact_factor = "sentiment"

            analysis = str(data.get("analysis", "")).strip()

            return {
                "sentiment_score": sentiment_score,
                "impact_score": impact_score,
                "impact_factor": impact_factor,
                "analysis": analysis or "분석 사유가 제공되지 않았습니다.",
            }

        except Exception:
            return None


def analyze_news_impact(
    news_df: pd.DataFrame,
    max_items: int = 20,
    max_workers: int = 5,
) -> NewsImpactResponse:
    if news_df is None or news_df.empty:
        return NewsImpactResponse(
            count=0,
            items=[],
        )

    selected_df = news_df.head(max_items).copy()

    analyzer = NewsImpactAnalyzer()
    results: list[NewsImpactItem] = []

    def process_row(row: pd.Series) -> NewsImpactItem | None:
        title = str(row.get("title", "")).strip()

        if not title:
            return None

        source = row.get("source")
        published_at = row.get("published_at")
        url = row.get("url")

        analysis_result = analyzer.analyze_single_news(
            title=title,
            source=str(source) if source is not None else None,
            published_at=str(published_at) if published_at is not None else None,
        )

        if not analysis_result:
            return None

        return NewsImpactItem(
            title=title,
            url=str(url) if url is not None else None,
            published_at=str(published_at) if published_at is not None else None,
            source=str(source) if source is not None else None,
            sentiment_score=analysis_result["sentiment_score"],
            impact_score=analysis_result["impact_score"],
            impact_factor=analysis_result["impact_factor"],
            analysis=analysis_result["analysis"],
        )

    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = [
            executor.submit(process_row, row)
            for _, row in selected_df.iterrows()
        ]

        for future in concurrent.futures.as_completed(futures):
            item = future.result()

            if item:
                results.append(item)

    return NewsImpactResponse(
        count=len(results),
        items=results,
    )