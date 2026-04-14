from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from ..models import Strategy, StrategyStatus
from ..schemas import StrategyCreate, StrategyUpdate


class StrategyService:
    @staticmethod
    def get_strategies(
        db: Session,
        user_id: int,
        skip: int = 0,
        limit: int = 20,
        status: Optional[str] = None
    ) -> tuple[List[Strategy], int]:
        query = db.query(Strategy).filter(Strategy.user_id == user_id)
        if status:
            query = query.filter(Strategy.status == status)
        total = query.count()
        strategies = query.order_by(desc(Strategy.updated_at)).offset(skip).limit(limit).all()
        return strategies, total

    @staticmethod
    def get_strategy(db: Session, strategy_id: int, user_id: int) -> Optional[Strategy]:
        return db.query(Strategy).filter(
            Strategy.id == strategy_id,
            Strategy.user_id == user_id
        ).first()

    @staticmethod
    def create_strategy(db: Session, user_id: int, strategy: StrategyCreate) -> Strategy:
        db_strategy = Strategy(
            user_id=user_id,
            name=strategy.name,
            description=strategy.description,
            code=strategy.code,
            strategy_type=strategy.strategy_type,
            market_type=strategy.market_type,
            config=strategy.config
        )
        db.add(db_strategy)
        db.commit()
        db.refresh(db_strategy)
        return db_strategy

    @staticmethod
    def update_strategy(
        db: Session,
        strategy_id: int,
        user_id: int,
        strategy_update: StrategyUpdate
    ) -> Optional[Strategy]:
        db_strategy = StrategyService.get_strategy(db, strategy_id, user_id)
        if not db_strategy:
            return None
        update_data = strategy_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_strategy, field, value)
        db.commit()
        db.refresh(db_strategy)
        return db_strategy

    @staticmethod
    def delete_strategy(db: Session, strategy_id: int, user_id: int) -> bool:
        db_strategy = StrategyService.get_strategy(db, strategy_id, user_id)
        if not db_strategy:
            return False
        db.delete(db_strategy)
        db.commit()
        return True

    @staticmethod
    def update_status(
        db: Session,
        strategy_id: int,
        user_id: int,
        status: StrategyStatus
    ) -> Optional[Strategy]:
        db_strategy = StrategyService.get_strategy(db, strategy_id, user_id)
        if not db_strategy:
            return None
        db_strategy.status = status
        db.commit()
        db.refresh(db_strategy)
        return db_strategy


strategy_service = StrategyService()
