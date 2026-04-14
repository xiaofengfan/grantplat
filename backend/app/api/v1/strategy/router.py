from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from ....core.database import get_db
from ....schemas import StrategyCreate, StrategyUpdate, StrategyResponse, BacktestCreate, BacktestResponse
from ....services import strategy_service, backtest_service
from ....api.v1.auth.router import get_current_user
from ....schemas import UserResponse

router = APIRouter(prefix="/strategies", tags=["策略管理"])


@router.get("")
def get_strategies(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    status: Optional[str] = None,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    skip = (page - 1) * page_size
    strategies, total = strategy_service.get_strategies(
        db, current_user.id, skip, page_size, status
    )
    return {
        "items": [StrategyResponse.model_validate(s) for s in strategies],
        "total": total,
        "page": page,
        "page_size": page_size
    }


@router.get("/{strategy_id}", response_model=StrategyResponse)
def get_strategy(
    strategy_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    strategy = strategy_service.get_strategy(db, strategy_id, current_user.id)
    if not strategy:
        raise HTTPException(status_code=404, detail="策略不存在")
    return StrategyResponse.model_validate(strategy)


@router.post("", response_model=StrategyResponse)
def create_strategy(
    strategy: StrategyCreate,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_strategy = strategy_service.create_strategy(db, current_user.id, strategy)
    return StrategyResponse.model_validate(db_strategy)


@router.put("/{strategy_id}", response_model=StrategyResponse)
def update_strategy(
    strategy_id: int,
    strategy_update: StrategyUpdate,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_strategy = strategy_service.update_strategy(db, strategy_id, current_user.id, strategy_update)
    if not db_strategy:
        raise HTTPException(status_code=404, detail="策略不存在")
    return StrategyResponse.model_validate(db_strategy)


@router.delete("/{strategy_id}")
def delete_strategy(
    strategy_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    success = strategy_service.delete_strategy(db, strategy_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="策略不存在")
    return {"message": "删除成功"}


@router.post("/{strategy_id}/backtest", response_model=BacktestResponse)
def start_backtest(
    strategy_id: int,
    backtest_params: BacktestCreate,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_backtest = backtest_service.create_backtest(
        db, strategy_id, current_user.id, backtest_params
    )
    if not db_backtest:
        raise HTTPException(status_code=404, detail="策略不存在")
    return BacktestResponse.model_validate(db_backtest)


@router.post("/{strategy_id}/simulate")
def start_simulate(
    strategy_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    strategy = strategy_service.get_strategy(db, strategy_id, current_user.id)
    if not strategy:
        raise HTTPException(status_code=404, detail="策略不存在")
    return {"message": "模拟交易已启动"}


@router.post("/{strategy_id}/deploy")
def deploy_strategy(
    strategy_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    strategy = strategy_service.get_strategy(db, strategy_id, current_user.id)
    if not strategy:
        raise HTTPException(status_code=404, detail="策略不存在")
    return {"message": "策略已部署"}
