from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from ....core.database import get_db
from ....schemas import (
    AIConfigCreate, AIConfigUpdate, AIConfigResponse,
    AIChatRequest, AIChatResponse,
    AIConversationResponse, AIAnalyzeRequest, AISignalResponse
)
from ....services import ai_service
from ....api.v1.auth.router import get_current_user
from ....schemas import UserResponse

router = APIRouter(prefix="/ai", tags=["AI分析"])


@router.get("/config", response_model=Optional[AIConfigResponse])
def get_config(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    config = ai_service.get_config(db, current_user.id)
    if config:
        return AIConfigResponse.model_validate(config)
    return None


@router.post("/config", response_model=AIConfigResponse)
def save_config(
    config: AIConfigCreate,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_config = ai_service.save_config(db, current_user.id, config)
    return AIConfigResponse.model_validate(db_config)


@router.delete("/config")
def delete_config(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    success = ai_service.delete_config(db, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="配置不存在")
    return {"message": "删除成功"}


@router.post("/chat", response_model=AIChatResponse)
async def chat(
    request: AIChatRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    response = await ai_service.chat(db, current_user.id, request)
    return AIChatResponse(message=response)


@router.get("/conversations", response_model=List[AIConversationResponse])
def get_conversations(
    limit: int = 50,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conversations = ai_service.get_conversations(db, current_user.id, limit)
    return [AIConversationResponse.model_validate(c) for c in conversations]


@router.delete("/conversations")
def clear_conversations(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ai_service.clear_conversations(db, current_user.id)
    return {"message": "清除成功"}


@router.post("/analyze")
async def analyze_stock(
    request: AIAnalyzeRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analysis = await ai_service.analyze_stock(db, current_user.id, request)
    return {"analysis": analysis}


@router.get("/signals", response_model=List[AISignalResponse])
def get_signals(
    symbol: Optional[str] = None,
    limit: int = 20,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    signals = ai_service.get_signals(db, current_user.id, symbol, limit)
    return [AISignalResponse.model_validate(s) for s in signals]
