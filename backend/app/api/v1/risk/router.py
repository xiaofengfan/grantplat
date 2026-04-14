from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ....core.database import get_db
from ....schemas import RiskRuleCreate, RiskRuleUpdate, RiskRuleResponse, RiskMetrics
from ....services import risk_service
from ....api.v1.auth.router import get_current_user
from ....schemas import UserResponse

router = APIRouter(prefix="/risk", tags=["风控"])


@router.get("/rules", response_model=list[RiskRuleResponse])
def get_rules(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rules = risk_service.get_rules(db, current_user.id)
    return [RiskRuleResponse.model_validate(r) for r in rules]


@router.post("/rules", response_model=RiskRuleResponse)
def create_rule(
    rule: RiskRuleCreate,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_rule = risk_service.create_rule(db, current_user.id, rule)
    return RiskRuleResponse.model_validate(db_rule)


@router.put("/rules/{rule_id}", response_model=RiskRuleResponse)
def update_rule(
    rule_id: int,
    rule_update: RiskRuleUpdate,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_rule = risk_service.update_rule(db, rule_id, current_user.id, rule_update)
    if not db_rule:
        raise HTTPException(status_code=404, detail="规则不存在")
    return RiskRuleResponse.model_validate(db_rule)


@router.delete("/rules/{rule_id}")
def delete_rule(
    rule_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    success = risk_service.delete_rule(db, rule_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="规则不存在")
    return {"message": "删除成功"}


@router.get("/monitor", response_model=RiskMetrics)
def get_monitor(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    metrics = risk_service.get_risk_metrics(db, current_user.id)
    return metrics
