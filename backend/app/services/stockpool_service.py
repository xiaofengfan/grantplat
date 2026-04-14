from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from ..models import StockPool, StockAlert
from ..schemas import StockPoolCreate, StockPoolUpdate, StockAlertCreate, AlertType as ModelAlertType, AlertCondition as ModelAlertCondition


class StockPoolService:
    @staticmethod
    def get_stocks(db: Session, user_id: int, group: Optional[str] = None) -> List[StockPool]:
        query = db.query(StockPool).filter(StockPool.user_id == user_id)
        if group:
            query = query.filter(StockPool.group_name == group)
        return query.order_by(desc(StockPool.created_at)).all()

    @staticmethod
    def get_stock(db: Session, stock_id: int, user_id: int) -> Optional[StockPool]:
        return db.query(StockPool).filter(
            StockPool.id == stock_id,
            StockPool.user_id == user_id
        ).first()

    @staticmethod
    def add_stock(db: Session, user_id: int, stock: StockPoolCreate) -> StockPool:
        existing = db.query(StockPool).filter(
            StockPool.user_id == user_id,
            StockPool.symbol == stock.symbol
        ).first()
        if existing:
            return existing

        db_stock = StockPool(
            user_id=user_id,
            symbol=stock.symbol,
            name=stock.name,
            market=stock.market,
            group_name=stock.group_name,
            notes=stock.notes
        )
        db.add(db_stock)
        db.commit()
        db.refresh(db_stock)
        return db_stock

    @staticmethod
    def update_stock(db: Session, stock_id: int, user_id: int, stock_update: StockPoolUpdate) -> Optional[StockPool]:
        db_stock = StockPoolService.get_stock(db, stock_id, user_id)
        if not db_stock:
            return None
        update_data = stock_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_stock, field, value)
        db.commit()
        db.refresh(db_stock)
        return db_stock

    @staticmethod
    def delete_stock(db: Session, stock_id: int, user_id: int) -> bool:
        db_stock = StockPoolService.get_stock(db, stock_id, user_id)
        if not db_stock:
            return False
        db.delete(db_stock)
        db.commit()
        return True

    @staticmethod
    def get_alerts(db: Session, user_id: int, symbol: Optional[str] = None) -> List[StockAlert]:
        query = db.query(StockAlert).filter(StockAlert.user_id == user_id)
        if symbol:
            query = query.filter(StockAlert.symbol == symbol)
        return query.order_by(desc(StockAlert.created_at)).all()

    @staticmethod
    def create_alert(db: Session, user_id: int, alert: StockAlertCreate) -> StockAlert:
        db_alert = StockAlert(
            user_id=user_id,
            symbol=alert.symbol,
            alert_type=ModelAlertType(alert.alert_type.value),
            threshold=alert.threshold,
            condition=ModelAlertCondition(alert.condition.value)
        )
        db.add(db_alert)
        db.commit()
        db.refresh(db_alert)
        return db_alert

    @staticmethod
    def delete_alert(db: Session, alert_id: int, user_id: int) -> bool:
        db_alert = db.query(StockAlert).filter(
            StockAlert.id == alert_id,
            StockAlert.user_id == user_id
        ).first()
        if not db_alert:
            return False
        db.delete(db_alert)
        db.commit()
        return True

    @staticmethod
    def toggle_alert(db: Session, alert_id: int, user_id: int, enabled: bool) -> Optional[StockAlert]:
        db_alert = db.query(StockAlert).filter(
            StockAlert.id == alert_id,
            StockAlert.user_id == user_id
        ).first()
        if not db_alert:
            return None
        db_alert.enabled = enabled
        db.commit()
        db.refresh(db_alert)
        return db_alert

    @staticmethod
    def check_alerts(db: Session, symbol: str, current_price: float, change_pct: float, volume: int) -> List[StockAlert]:
        alerts = db.query(StockAlert).filter(
            StockAlert.symbol == symbol,
            StockAlert.enabled == True,
            StockAlert.triggered_at == None
        ).all()

        triggered = []
        for alert in alerts:
            should_trigger = False
            if alert.alert_type == ModelAlertType.PRICE:
                if alert.condition == ModelAlertCondition.ABOVE and current_price > alert.threshold:
                    should_trigger = True
                elif alert.condition == ModelAlertCondition.BELOW and current_price < alert.threshold:
                    should_trigger = True
                elif alert.condition == ModelAlertCondition.EQUAL and abs(current_price - alert.threshold) < 0.01:
                    should_trigger = True
            elif alert.alert_type == ModelAlertType.CHANGE_PCT:
                if alert.condition == ModelAlertCondition.ABOVE and change_pct > alert.threshold:
                    should_trigger = True
                elif alert.condition == ModelAlertCondition.BELOW and change_pct < alert.threshold:
                    should_trigger = True
            elif alert.alert_type == ModelAlertType.VOLUME:
                if alert.threshold > 0 and volume > alert.threshold:
                    should_trigger = True

            if should_trigger:
                from datetime import datetime
                alert.triggered_at = datetime.utcnow()
                db.commit()
                triggered.append(alert)

        return triggered


stockpool_service = StockPoolService()
