from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from ....core.database import get_db
from ....schemas import UserResponse
from ....api.v1.auth.router import get_current_user
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/transactions", tags=["交易管理"])


class WalletResponse(BaseModel):
    total_asset: float
    cash: float
    frozen: float
    market_value: float
    today_profit: float
    total_profit: float


class BillResponse(BaseModel):
    id: int
    time: str
    symbol: str
    name: str
    type: str
    amount: int
    price: float
    fee: float
    status: str


class ProfitResponse(BaseModel):
    date: str
    profit: float
    profit_rate: float


@router.get("/wallet", response_model=WalletResponse)
def get_wallet(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return WalletResponse(
        total_asset=1125840.50,
        cash=953810.50,
        frozen=0,
        market_value=172030,
        today_profit=12580.30,
        total_profit=85600.00
    )


@router.get("/bills", response_model=List[BillResponse])
def get_bills(
    symbol: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    bills = [
        BillResponse(id=1, time="2026-04-13 14:30:15", symbol="600519", name="贵州茅台", type="买入", amount=100, price=1720.00, fee=51.60, status="已完成"),
        BillResponse(id=2, time="2026-04-13 10:25:32", symbol="000858", name="五粮液", type="卖出", amount=200, price=145.00, fee=43.50, status="已完成"),
        BillResponse(id=3, time="2026-04-12 15:00:00", symbol="601318", name="中国平安", type="买入", amount=500, price=42.80, fee=21.40, status="已完成"),
        BillResponse(id=4, time="2026-04-12 09:35:20", symbol="600036", name="招商银行", type="买入", amount=1000, price=35.50, fee=35.50, status="已完成"),
        BillResponse(id=5, time="2026-04-11 14:20:10", symbol="000002", name="万科A", type="卖出", amount=500, price=8.50, fee=17.00, status="已完成"),
    ]
    if symbol:
        bills = [b for b in bills if b.symbol == symbol]
    return bills


@router.get("/profit", response_model=List[ProfitResponse])
def get_profit(
    days: int = 30,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profits = [
        ProfitResponse(date="2026-04-07", profit=1250.30, profit_rate=0.0011),
        ProfitResponse(date="2026-04-08", profit=-580.00, profit_rate=-0.0005),
        ProfitResponse(date="2026-04-09", profit=2100.50, profit_rate=0.0019),
        ProfitResponse(date="2026-04-10", profit=890.20, profit_rate=0.0008),
        ProfitResponse(date="2026-04-11", profit=-320.80, profit_rate=-0.0003),
        ProfitResponse(date="2026-04-12", profit=1580.00, profit_rate=0.0014),
        ProfitResponse(date="2026-04-13", profit=12580.30, profit_rate=0.0113),
    ]
    return profits[:days]