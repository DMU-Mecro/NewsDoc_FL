from fastapi import HTTPException, status
import yfinance as yf

from app.schemas.market import MarketQuoteResponse


def _to_float(value) -> float | None:
    if value is None:
        return None

    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def normalize_yahoo_ticker(ticker: str | None) -> str | None:
    """
    Yahoo Finance용 티커 정규화 함수입니다.

    예:
    - AAPL -> AAPL
    - MSFT -> MSFT
    - 005930 -> 005930.KS
    - 035720 -> 035720.KS

    한국 주식 6자리 숫자는 기본적으로 .KS를 붙입니다.
    단, 코스닥 종목은 .KQ가 필요할 수 있으므로 후보 탐색에서 .KQ도 함께 시도합니다.
    """
    if ticker is None:
        return None

    symbol = str(ticker).upper().strip()

    if not symbol:
        return None

    if symbol.isdigit() and len(symbol) == 6:
        return f"{symbol}.KS"

    return symbol


def _build_yahoo_ticker_candidates(ticker: str | None) -> list[str]:
    """
    하나의 티커 입력값에 대해 Yahoo Finance 조회 후보를 만듭니다.

    005930 입력 시:
    - 005930.KS
    - 005930.KQ
    - 005930

    AAPL 입력 시:
    - AAPL
    """
    if ticker is None:
        return []

    raw_symbol = str(ticker).upper().strip()

    if not raw_symbol:
        return []

    if raw_symbol.isdigit() and len(raw_symbol) == 6:
        return [
            f"{raw_symbol}.KS",
            f"{raw_symbol}.KQ",
            raw_symbol,
        ]

    normalized_symbol = normalize_yahoo_ticker(raw_symbol)

    if normalized_symbol is None:
        return []

    return [normalized_symbol]


def _read_fast_info_price(stock: yf.Ticker) -> float | None:
    try:
        fast_info = stock.fast_info

        possible_values = [
            getattr(fast_info, "last_price", None),
            getattr(fast_info, "regular_market_price", None),
            getattr(fast_info, "previous_close", None),
        ]

        for value in possible_values:
            price = _to_float(value)

            if price is not None and price > 0:
                return price

    except Exception:
        return None

    return None


def _read_history_price(stock: yf.Ticker) -> float | None:
    try:
        history = stock.history(
            period="5d",
            interval="1d",
            auto_adjust=False,
            timeout=10,
        )

        if history is None or history.empty:
            return None

        close_series = history.get("Close")

        if close_series is None or close_series.empty:
            return None

        latest_close = close_series.dropna().iloc[-1]

        price = _to_float(latest_close)

        if price is not None and price > 0:
            return price

    except Exception:
        return None

    return None


def _read_info_price(stock: yf.Ticker) -> tuple[float | None, dict]:
    """
    stock.info는 yfinance에서 상대적으로 느릴 수 있으므로
    마지막 후보로만 사용합니다.
    """
    try:
        info = stock.info or {}

        current_price = (
            info.get("regularMarketPrice")
            or info.get("currentPrice")
            or info.get("previousClose")
        )

        price = _to_float(current_price)

        if price is not None and price > 0:
            return price, info

        return None, info

    except Exception:
        return None, {}


def _get_price_and_info(symbol: str) -> tuple[float | None, dict]:
    stock = yf.Ticker(symbol)

    fast_price = _read_fast_info_price(stock)

    if fast_price is not None:
        return fast_price, {}

    history_price = _read_history_price(stock)

    if history_price is not None:
        return history_price, {}

    return _read_info_price(stock)


def get_market_quote(ticker: str) -> MarketQuoteResponse:
    candidates = _build_yahoo_ticker_candidates(ticker)

    if not candidates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="티커를 입력해야 합니다.",
        )

    last_error_message = ""

    for symbol in candidates:
        try:
            stock = yf.Ticker(symbol)

            fast_price = _read_fast_info_price(stock)
            history_price = None

            if fast_price is None:
                history_price = _read_history_price(stock)

            info_price = None
            info: dict = {}

            if fast_price is None and history_price is None:
                info_price, info = _read_info_price(stock)
            else:
                try:
                    info = stock.info or {}
                except Exception:
                    info = {}

            current_price = fast_price or history_price or info_price

            if current_price is None:
                last_error_message = f"{symbol} 티커의 시장 데이터를 찾을 수 없습니다."
                continue

            return MarketQuoteResponse(
                ticker=symbol,
                name=info.get("shortName") or info.get("longName"),
                currency=info.get("currency"),
                current_price=_to_float(current_price),
                previous_close=_to_float(info.get("previousClose")),
                open_price=_to_float(info.get("regularMarketOpen")),
                day_high=_to_float(info.get("dayHigh")),
                day_low=_to_float(info.get("dayLow")),
                market_cap=_to_float(info.get("marketCap")),
                fifty_two_week_high=_to_float(info.get("fiftyTwoWeekHigh")),
                fifty_two_week_low=_to_float(info.get("fiftyTwoWeekLow")),
            )

        except Exception as exc:
            last_error_message = str(exc)
            continue

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=last_error_message or f"{ticker} 티커의 시장 데이터를 찾을 수 없습니다.",
    )


def get_current_price_for_ticker(ticker: str) -> float | None:
    candidates = _build_yahoo_ticker_candidates(ticker)

    if not candidates:
        return None

    for symbol in candidates:
        try:
            price, _ = _get_price_and_info(symbol)

            if price is not None and price > 0:
                return price

        except Exception:
            continue

    return None