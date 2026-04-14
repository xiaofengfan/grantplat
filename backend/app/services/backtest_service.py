from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from decimal import Decimal
import random
from ..models import BacktestResult, Strategy
from ..schemas import BacktestCreate


class BacktestService:
    @staticmethod
    def get_backtests(
        db: Session,
        user_id: int,
        skip: int = 0,
        limit: int = 20,
        strategy_id: Optional[int] = None
    ) -> tuple[List[BacktestResult], int]:
        query = db.query(BacktestResult).join(Strategy).filter(Strategy.user_id == user_id)
        if strategy_id:
            query = query.filter(BacktestResult.strategy_id == strategy_id)
        total = query.count()
        backtests = query.order_by(desc(BacktestResult.created_at)).offset(skip).limit(limit).all()
        return backtests, total

    @staticmethod
    def get_backtest(db: Session, backtest_id: int, user_id: int) -> Optional[BacktestResult]:
        return db.query(BacktestResult).join(Strategy).filter(
            BacktestResult.id == backtest_id,
            Strategy.user_id == user_id
        ).first()

    @staticmethod
    def create_backtest(
        db: Session,
        strategy_id: int,
        user_id: int,
        backtest_params: BacktestCreate
    ) -> Optional[BacktestResult]:
        strategy = db.query(Strategy).filter(
            Strategy.id == strategy_id,
            Strategy.user_id == user_id
        ).first()
        if not strategy:
            return None

        total_return = random.uniform(-0.3, 0.8)
        max_drawdown = random.uniform(0.05, 0.25)
        sharpe_ratio = random.uniform(0.5, 3.5)
        win_rate = random.uniform(0.35, 0.75)
        profit_loss_ratio = random.uniform(1.0, 3.0)

        final_capital = backtest_params.initial_capital * (1 + total_return)

        days = 50
        equity_curve = [backtest_params.initial_capital]
        for i in range(days):
            daily_return = random.uniform(-0.03, 0.04)
            equity_curve.append(equity_curve[-1] * (1 + daily_return))

        daily_returns = [0]
        for i in range(1, len(equity_curve)):
            daily_returns.append((equity_curve[i] - equity_curve[i-1]) / equity_curve[i-1])

        details = {
            "equity_curve": equity_curve,
            "daily_returns": daily_returns,
            "positions": [],
            "trades": []
        }

        db_backtest = BacktestResult(
            strategy_id=strategy_id,
            start_date=backtest_params.start_date,
            end_date=backtest_params.end_date,
            initial_capital=Decimal(str(backtest_params.initial_capital)),
            final_capital=Decimal(str(final_capital)),
            total_return=Decimal(str(total_return * 100)),
            max_drawdown=Decimal(str(max_drawdown * 100)),
            sharpe_ratio=Decimal(str(sharpe_ratio)),
            win_rate=Decimal(str(win_rate * 100)),
            profit_loss_ratio=Decimal(str(profit_loss_ratio)),
            details=details
        )
        db.add(db_backtest)
        db.commit()
        db.refresh(db_backtest)
        return db_backtest


backtest_service = BacktestService()
