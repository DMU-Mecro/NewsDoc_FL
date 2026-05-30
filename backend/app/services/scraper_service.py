import os
import time
from datetime import datetime

import feedparser
import pandas as pd
import yfinance as yf

from app.core.config import settings


RSS_SOURCES = {
    "Yahoo_Main": "https://finance.yahoo.com/news/rss",
    "Yahoo_CentralBank": "https://finance.yahoo.com/news/category-central-banks/rss",
    "Yahoo_Economy": "https://finance.yahoo.com/news/category-economy/rss",
}


def _ensure_raw_data_path() -> None:
    os.makedirs(settings.RAW_DATA_PATH, exist_ok=True)


def is_macro_news(title: str) -> bool:
    exclude_keywords = [
        "CD rates",
        "Credit score",
        "Sallie Mae",
        "Personal Finance",
        "Tax refund",
        "Best banks",
        "HELOC",
        "Mortgage rates today",
        "Credit card",
        "Savings account",
    ]

    title_lower = title.lower()

    return not any(
        keyword.lower() in title_lower
        for keyword in exclude_keywords
    )


def fetch_accumulated_news(limit_year: str | None = None) -> pd.DataFrame:
    _ensure_raw_data_path()

    target_year = limit_year or settings.NEWS_LIMIT_YEAR
    file_path = os.path.join(settings.RAW_DATA_PATH, "raw_news.csv")

    all_news: list[dict] = []

    for source_name, url in RSS_SOURCES.items():
        feed = feedparser.parse(url)

        for entry in feed.entries:
            title = getattr(entry, "title", None)
            link = getattr(entry, "link", None)

            if not title or not link:
                continue

            if not is_macro_news(title):
                continue

            try:
                published_at = time.strftime(
                    "%Y-%m-%d %H:%M:%S",
                    entry.published_parsed,
                )
            except Exception:
                published_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            if target_year and not published_at.startswith(str(target_year)):
                continue

            all_news.append(
                {
                    "title": title,
                    "url": link,
                    "published_at": published_at,
                    "source": source_name,
                    "context_text": f"[{published_at}] {source_name}: {title}",
                }
            )

    if not all_news:
        if os.path.exists(file_path):
            return pd.read_csv(file_path)

        return pd.DataFrame(
            columns=[
                "title",
                "url",
                "published_at",
                "source",
                "context_text",
            ]
        )

    new_df = pd.DataFrame(all_news)

    if os.path.exists(file_path):
        old_df = pd.read_csv(file_path)

        if "published_at" in old_df.columns:
            old_df = old_df[
                old_df["published_at"].astype(str).str.startswith(str(target_year))
            ]

        new_only_df = new_df[~new_df["url"].isin(old_df["url"])].copy()

        final_df = (
            pd.concat([old_df, new_only_df])
            .drop_duplicates(subset=["url"], keep="first")
        )
    else:
        final_df = new_df

    final_df.sort_values(
        by="published_at",
        ascending=False,
        inplace=True,
    )

    final_df.to_csv(
        file_path,
        index=False,
        encoding="utf-8-sig",
    )

    return final_df


def fetch_robust_market_data(
    period: str | None = None,
    interval: str | None = None,
) -> pd.DataFrame:
    _ensure_raw_data_path()

    selected_period = period or settings.MARKET_DATA_PERIOD
    selected_interval = interval or settings.MARKET_DATA_INTERVAL

    tickers = {
        "10Y_Bond": "^TNX",
        "Gold": "GC=F",
        "Silver": "SI=F",
        "Copper": "HG=F",
        "USD_Index": "DX-Y.NYB",
        "Aluminum": "ALI=F",
        "Oil": "CL=F",
    }

    all_data: list[pd.DataFrame] = []

    for name, ticker in tickers.items():
        try:
            df = yf.Ticker(ticker).history(
                period=selected_period,
                interval=selected_interval,
            )

            if df.empty:
                continue

            df = df[["Close"]].rename(columns={"Close": name})
            df.index = df.index.tz_localize(None).floor("h")

            all_data.append(df)

        except Exception:
            continue

    if not all_data:
        return pd.DataFrame()

    market_df = pd.concat(all_data, axis=1)
    market_df = market_df[~market_df.index.duplicated(keep="first")]

    full_index = pd.date_range(
        start=market_df.index.min(),
        end=market_df.index.max(),
        freq="h",
    )

    market_df = market_df.reindex(full_index).ffill().bfill()

    file_path = os.path.join(settings.RAW_DATA_PATH, "market_prices.csv")
    market_df.to_csv(file_path)

    return market_df


def load_raw_news() -> pd.DataFrame:
    file_path = os.path.join(settings.RAW_DATA_PATH, "raw_news.csv")

    if not os.path.exists(file_path):
        return pd.DataFrame()

    return pd.read_csv(file_path)


def load_market_prices() -> pd.DataFrame:
    file_path = os.path.join(settings.RAW_DATA_PATH, "market_prices.csv")

    if not os.path.exists(file_path):
        return pd.DataFrame()

    df = pd.read_csv(file_path, index_col=0)
    return df