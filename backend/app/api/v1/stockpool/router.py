from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from ....core.database import get_db
from ....schemas import StockPoolCreate, StockPoolUpdate, StockPoolResponse, StockAlertCreate, StockAlertResponse
from ....services import stockpool_service
from ....api.v1.auth.router import get_current_user
from ....schemas import UserResponse

router = APIRouter(prefix="/stockpool", tags=["股票池"])


@router.get("", response_model=List[StockPoolResponse])
def get_stocks(
    group: Optional[str] = None,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    stocks = stockpool_service.get_stocks(db, current_user.id, group)
    return [StockPoolResponse.model_validate(s) for s in stocks]


@router.post("", response_model=StockPoolResponse)
def add_stock(
    stock: StockPoolCreate,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_stock = stockpool_service.add_stock(db, current_user.id, stock)
    return StockPoolResponse.model_validate(db_stock)


@router.put("/{stock_id}", response_model=StockPoolResponse)
def update_stock(
    stock_id: int,
    stock_update: StockPoolUpdate,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_stock = stockpool_service.update_stock(db, stock_id, current_user.id, stock_update)
    if not db_stock:
        raise HTTPException(status_code=404, detail="股票不存在")
    return StockPoolResponse.model_validate(db_stock)


@router.delete("/{stock_id}")
def delete_stock(
    stock_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    success = stockpool_service.delete_stock(db, stock_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="股票不存在")
    return {"message": "删除成功"}


@router.get("/quotes")
def get_quotes(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    stocks = stockpool_service.get_stocks(db, current_user.id)
    symbols = [s.symbol for s in stocks]

    quotes = []
    for symbol in symbols:
        import random
        base_price = 100.0 + random.uniform(-50, 50)
        change = random.uniform(-5, 5)
        quotes.append({
            "symbol": symbol,
            "name": f"股票{symbol}",
            "price": round(base_price, 2),
            "change": round(change, 2),
            "change_pct": round(change / base_price * 100, 2),
            "volume": int(random.uniform(1000000, 10000000)),
            "amount": round(random.uniform(100000000, 1000000000), 2),
            "high": round(base_price * 1.02, 2),
            "low": round(base_price * 0.98, 2),
            "open": round(base_price * 0.99, 2),
            "prev_close": round(base_price * 0.98, 2),
            "timestamp": "2026-04-13 10:30:00"
        })

    return quotes


@router.get("/alerts", response_model=List[StockAlertResponse])
def get_alerts(
    symbol: Optional[str] = None,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    alerts = stockpool_service.get_alerts(db, current_user.id, symbol)
    return [StockAlertResponse.model_validate(a) for a in alerts]


@router.post("/alerts", response_model=StockAlertResponse)
def create_alert(
    alert: StockAlertCreate,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_alert = stockpool_service.create_alert(db, current_user.id, alert)
    return StockAlertResponse.model_validate(db_alert)


@router.delete("/alerts/{alert_id}")
def delete_alert(
    alert_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    success = stockpool_service.delete_alert(db, alert_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="提醒不存在")
    return {"message": "删除成功"}


@router.put("/alerts/{alert_id}/toggle")
def toggle_alert(
    alert_id: int,
    enabled: bool,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    alert = stockpool_service.toggle_alert(db, alert_id, current_user.id, enabled)
    if not alert:
        raise HTTPException(status_code=404, detail="提醒不存在")
    return {"message": "更新成功", "enabled": enabled}
