import math

import pandas as pd

from app.core.config import settings
from app.schemas.analysis import (
    MarketEchoFactor,
    MarketEchoIndexResponse,
    NewsImpactResponse,
)


def _safe_mean(values: list[float]) -> float:
    valid_values = [
        float(value)
        for value in values
        if value is not None and not math.isnan(float(value))
    ]

    if not valid_values:
        return 0.0

    return sum(valid_values) / len(valid_values)


def _clip_score(value: float) -> float:
    return max(-1.0, min(1.0, float(value)))


def _market_change_score(
    market_df: pd.DataFrame,
    column_name: str,
    scale: float = 10.0,
) -> float:
    if market_df is None or market_df.empty:
        return 0.0

    if column_name not in market_df.columns:
        return 0.0

    series = market_df[column_name].dropna()

    if len(series) < 2:
        return 0.0

    first_value = float(series.iloc[0])
    last_value = float(series.iloc[-1])

    if first_value == 0:
        return 0.0

    percent_change = ((last_value - first_value) / first_value) * 100

    return _clip_score(percent_change / scale)


def calculate_marketecho_index(
    news_impact_response: NewsImpactResponse,
    market_df: pd.DataFrame,
) -> MarketEchoIndexResponse:
    weights = settings.marketecho_weights

    news_items = news_impact_response.items

    sentiment_scores = [
        item.impact_score
        for item in news_items
        if item.impact_factor == "sentiment"
    ]

    bond_scores = [
        item.impact_score
        for item in news_items
        if item.impact_factor == "bond"
    ]

    gold_scores = [
        item.impact_score
        for item in news_items
        if item.impact_factor == "gold"
    ]

    copper_scores = [
        item.impact_score
        for item in news_items
        if item.impact_factor == "copper"
    ]

    usd_scores = [
        item.impact_score
        for item in news_items
        if item.impact_factor == "usd"
    ]

    energy_scores = [
        item.impact_score
        for item in news_items
        if item.impact_factor == "energy"
    ]

    factor_scores = {
        "sentiment": _safe_mean(sentiment_scores)
        if sentiment_scores
        else _safe_mean([item.impact_score for item in news_items]),
        "bond": _safe_mean(bond_scores)
        if bond_scores
        else _market_change_score(market_df, "10Y_Bond"),
        "gold": _safe_mean(gold_scores)
        if gold_scores
        else _market_change_score(market_df, "Gold"),
        "copper": _safe_mean(copper_scores)
        if copper_scores
        else _market_change_score(market_df, "Copper"),
        "usd": _safe_mean(usd_scores)
        if usd_scores
        else _market_change_score(market_df, "USD_Index"),
        "energy": _safe_mean(energy_scores)
        if energy_scores
        else _market_change_score(market_df, "Oil"),
    }

    factors: list[MarketEchoFactor] = []

    index_score = settings.MARKETECHO_INDEX_BASE

    for factor_name, weight in weights.items():
        impact_score = _clip_score(factor_scores.get(factor_name, 0.0))
        weighted_score = weight * impact_score

        index_score += weighted_score

        factors.append(
            MarketEchoFactor(
                name=factor_name,
                weight=round(weight, 4),
                impact_score=round(impact_score, 4),
                weighted_score=round(weighted_score, 4),
            )
        )

    return MarketEchoIndexResponse(
        index_score=round(index_score, 4),
        factors=factors,
    )