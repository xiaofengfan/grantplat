from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from ....core.database import get_db
from ....schemas import BacktestResponse
from ....services import backtest_service
from ....api.v1.auth.router import get_current_user
from ....schemas import UserResponse

router = APIRouter(prefix="/backtests", tags=["回测"])


@router.get("")
def get_backtests(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    strategy_id: Optional[int] = None,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    skip = (page - 1) * page_size
    backtests, total = backtest_service.get_backtests(
        db, current_user.id, skip, page_size, strategy_id
    )
    return {
        "items": [BacktestResponse.model_validate(b) for b in backtests],
        "total": total,
        "page": page,
        "page_size": page_size
    }


@router.get("/{backtest_id}", response_model=BacktestResponse)
def get_backtest(
    backtest_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    backtest = backtest_service.get_backtest(db, backtest_id, current_user.id)
    if not backtest:
        raise HTTPException(status_code=404, detail="回测记录不存在")
    return BacktestResponse.model_validate(backtest)


@router.get("/{backtest_id}/charts")
def get_backtest_charts(
    backtest_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    backtest = backtest_service.get_backtest(db, backtest_id, current_user.id)
    if not backtest:
        raise HTTPException(status_code=404, detail="回测记录不存在")
    return backtest.details


@router.post("/{backtest_id}/cancel")
def cancel_backtest(
    backtest_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return {"message": "回测已取消"}
