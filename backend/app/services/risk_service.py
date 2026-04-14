from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from ..models import RiskRule
from ..schemas import RiskRuleCreate, RiskRuleUpdate


class RiskService:
    @staticmethod
    def get_rules(db: Session, user_id: int) -> List[RiskRule]:
        return db.query(RiskRule).filter(RiskRule.user_id == user_id).order_by(desc(RiskRule.created_at)).all()

    @staticmethod
    def get_rule(db: Session, rule_id: int, user_id: int) -> Optional[RiskRule]:
        return db.query(RiskRule).filter(
            RiskRule.id == rule_id,
            RiskRule.user_id == user_id
        ).first()

    @staticmethod
    def create_rule(db: Session, user_id: int, rule: RiskRuleCreate) -> RiskRule:
        db_rule = RiskRule(
            user_id=user_id,
            rule_type=rule.rule_type,
            rule_name=rule.rule_name,
            rule_config=rule.rule_config,
            enabled=rule.enabled
        )
        db.add(db_rule)
        db.commit()
        db.refresh(db_rule)
        return db_rule

    @staticmethod
    def update_rule(
        db: Session,
        rule_id: int,
        user_id: int,
        rule_update: RiskRuleUpdate
    ) -> Optional[RiskRule]:
        db_rule = RiskService.get_rule(db, rule_id, user_id)
        if not db_rule:
            return None
        update_data = rule_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_rule, field, value)
        db.commit()
        db.refresh(db_rule)
        return db_rule

    @staticmethod
    def delete_rule(db: Session, rule_id: int, user_id: int) -> bool:
        db_rule = RiskService.get_rule(db, rule_id, user_id)
        if not db_rule:
            return False
        db.delete(db_rule)
        db.commit()
        return True

    @staticmethod
    def get_risk_metrics(db: Session, user_id: int) -> dict:
        return {
            "total_value": 1125840.50,
            "cash": 953810.50,
            "positions_value": 172030.00,
            "today_pnl": 12580.30,
            "total_pnl": 125840.50,
            "max_drawdown": 8.5,
            "risk_exposure": 15.28,
            "var": 22516.81,
            "order_frequency": 12,
            "cancel_rate": 15.2
        }


risk_service = RiskService()
