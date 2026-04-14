from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ....core.database import get_db
from ....schemas import Quote, KLine
from ....api.v1.auth.router import get_current_user
from ....schemas import UserResponse

router = APIRouter(prefix="/data", tags=["数据服务"])


@router.get("/quotes")
def get_quotes(
    symbols: str,
    current_user: UserResponse = Depends(get_current_user)
):
    symbol_list = symbols.split(",")
    quotes = []
    for symbol in symbol_list:
        quotes.append({
            "symbol": symbol,
            "name": f"股票{symbol}",
            "price": 100.0 + float(hash(symbol) % 1000) / 10,
            "change": 1.5,
            "change_pct": 1.52,
            "volume": 1000000,
            "amount": 100000000,
            "high": 102.0,
            "low": 98.5,
            "open": 99.0,
            "prev_close": 98.5,
            "timestamp": "2026-04-11 14:30:00"
        })
    return quotes


@router.get("/history")
def get_history_kline(
    symbol: str,
    period: str = "1d",
    start_date: str = "2025-01-01",
    end_date: str = "2026-04-10",
    current_user: UserResponse = Depends(get_current_user)
):
    klines = []
    base_price = 100.0
    import random
    for i in range(50):
        open_p = base_price + random.uniform(-2, 2)
        close_p = base_price + random.uniform(-2, 2)
        high_p = max(open_p, close_p) + random.uniform(0, 1)
        low_p = min(open_p, close_p) - random.uniform(0, 1)
        klines.append({
            "date": f"2025-{(i // 4) + 1:02d}-{(i % 30) + 1:02d}",
            "open": round(open_p, 2),
            "high": round(high_p, 2),
            "low": round(low_p, 2),
            "close": round(close_p, 2),
            "volume": int(random.uniform(1000000, 5000000)),
            "amount": random.uniform(100000000, 500000000)
        })
        base_price = close_p
    return klines


@router.get("/factors")
def get_factors(
    category: str = None,
    page: int = 1,
    page_size: int = 20,
    current_user: UserResponse = Depends(get_current_user)
):
    factors = [
        {"id": 1, "name": "MACD", "category": "趋势", "description": "指数平滑异同移动平均线", "ic": 0.65, "ir": 0.42},
        {"id": 2, "name": "RSI", "category": "摆动", "description": "相对强弱指数", "ic": 0.58, "ir": 0.38},
        {"id": 3, "name": "布林带", "category": "趋势", "description": "布林带指标", "ic": 0.52, "ir": 0.35},
        {"id": 4, "name": "KDJ", "category": "摆动", "description": "随机指标", "ic": 0.55, "ir": 0.32},
        {"id": 5, "name": "MA", "category": "趋势", "description": "移动平均线", "ic": 0.48, "ir": 0.28},
    ]
    return {"items": factors, "total": len(factors)}
