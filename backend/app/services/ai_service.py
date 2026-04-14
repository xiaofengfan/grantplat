from sqlalchemy.orm import Session
from typing import List, Optional
import httpx
from datetime import datetime
from ..models import AIConfig, AIConversation, AISignal, AIProvider as ModelAIProvider
from ..schemas import AIConfigCreate, AIConfigUpdate, AIChatRequest, AIAnalyzeRequest, MessageRole as ModelMessageRole, ALL_AI_MODELS
from ..core.config import settings


DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"
OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"
QWEN_API_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"
KIMI_API_URL = "https://api.moonshot.cn/v1/chat/completions"

API_URLS = {
    "deepseek": DEEPSEEK_API_URL,
    "openai": OPENAI_API_URL,
    "qwen": QWEN_API_URL,
    "kimi": KIMI_API_URL,
}


class AIService:
    @staticmethod
    def get_config(db: Session, user_id: int) -> Optional[AIConfig]:
        config = db.query(AIConfig).filter(AIConfig.user_id == user_id).first()
        if config:
            return config
        if settings.DEEPSEEK_ENABLED and settings.DEEPSEEK_API_KEY:
            default_config = AIConfig(
                user_id=user_id,
                provider=ModelAIProvider.DEEPSEEK,
                api_key=settings.DEEPSEEK_API_KEY,
                model=settings.DEEPSEEK_MODEL,
                enabled=True
            )
            return default_config
        return None

    @staticmethod
    def save_config(db: Session, user_id: int, config: AIConfigCreate) -> AIConfig:
        existing = db.query(AIConfig).filter(AIConfig.user_id == user_id).first()
        if existing:
            update_data = config.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(existing, field, value)
            db.commit()
            db.refresh(existing)
            return existing
        else:
            db_config = AIConfig(user_id=user_id, **config.model_dump())
            db.add(db_config)
            db.commit()
            db.refresh(db_config)
            return db_config

    @staticmethod
    def delete_config(db: Session, user_id: int) -> bool:
        config = db.query(AIConfig).filter(AIConfig.user_id == user_id).first()
        if not config:
            return False
        db.delete(config)
        db.commit()
        return True

    @staticmethod
    async def chat(db: Session, user_id: int, request: AIChatRequest) -> str:
        config = AIService.get_config(db, user_id)
        if not config or not config.api_key:
            return "请先配置AI API密钥"

        try:
            user_message = AIConversation(
                user_id=user_id,
                symbol=request.symbol,
                role=ModelMessageRole.USER,
                content=request.message
            )
            db.add(user_message)
            db.commit()
        except Exception as e:
            db.rollback()

        messages = [
            {"role": "system", "content": "你是一个专业的股票量化交易分析师，擅长分析股票的技术面和基本面。请给出专业、简洁的投资建议。"}
        ]

        try:
            recent_messages = db.query(AIConversation).filter(
                AIConversation.user_id == user_id
            ).order_by(AIConversation.created_at.desc()).limit(10).all()

            for msg in reversed(recent_messages):
                messages.append({"role": msg.role.value, "content": msg.content})
        except Exception:
            pass

        if request.symbol:
            messages.append({"role": "user", "content": f"请重点分析股票 {request.symbol}"})

        model = request.model if request.model else (config.model if config.model else "deepseek-chat")
        api_url = config.endpoint if config.endpoint else API_URLS.get(config.provider.value, DEEPSEEK_API_URL)

        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    api_url,
                    json={"model": model, "messages": messages},
                    headers={"Authorization": f"Bearer {config.api_key}"}
                )
                response.raise_for_status()
                data = response.json()
                assistant_message = data.get("choices", [{}])[0].get("message", {}).get("content", "")

                try:
                    db_assistant_message = AIConversation(
                        user_id=user_id,
                        symbol=request.symbol,
                        role=ModelMessageRole.ASSISTANT,
                        content=assistant_message
                    )
                    db.add(db_assistant_message)
                    db.commit()
                except Exception:
                    db.rollback()

                return assistant_message
        except httpx.HTTPStatusError as e:
            return f"AI服务HTTP错误: {e.response.status_code}"
        except Exception as e:
            return f"AI服务调用失败: {str(e)}"

    @staticmethod
    def get_conversations(db: Session, user_id: int, limit: int = 50) -> List[AIConversation]:
        return db.query(AIConversation).filter(
            AIConversation.user_id == user_id
        ).order_by(AIConversation.created_at.desc()).limit(limit).all()

    @staticmethod
    async def analyze_stock(db: Session, user_id: int, request: AIAnalyzeRequest) -> str:
        config = AIService.get_config(db, user_id)
        if not config or not config.api_key:
            return "请先配置AI API密钥"

        analysis_prompt = request.message if hasattr(request, 'message') and request.message else f"""请对股票 {request.symbol} 进行{request.analysis_type}分析，包括：
1. 基本面分析（市盈率、净利润、营收增长等）
2. 技术面分析（K线形态、均线系统、技术指标等）
3. 资金面分析（主力资金流向、成交量变化等）
4. 给出综合投资建议

请用简洁专业的语言进行分析。"""

        messages = [
            {"role": "system", "content": "你是一个专业的股票量化交易分析师。"},
            {"role": "user", "content": analysis_prompt}
        ]

        model = config.model if config.model else "deepseek-chat"
        api_url = config.endpoint if config.endpoint else API_URLS.get(config.provider.value, DEEPSEEK_API_URL)

        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    api_url,
                    json={"model": model, "messages": messages},
                    headers={"Authorization": f"Bearer {config.api_key}"}
                )
                response.raise_for_status()
                data = response.json()
                analysis = data.get("choices", [{}])[0].get("message", {}).get("content", "")

                try:
                    signal = AISignal(
                        user_id=user_id,
                        symbol=request.symbol,
                        signal_type=request.analysis_type,
                        direction="hold",
                        strength=50,
                        reason=analysis[:500]
                    )
                    db.add(signal)
                    db.commit()
                except Exception:
                    db.rollback()

                return analysis
        except httpx.HTTPStatusError as e:
            return f"AI分析HTTP错误: {e.response.status_code}"
        except Exception as e:
            return f"AI分析失败: {str(e)}"

    @staticmethod
    def get_signals(db: Session, user_id: int, symbol: Optional[str] = None, limit: int = 20) -> List[AISignal]:
        query = db.query(AISignal).filter(AISignal.user_id == user_id)
        if symbol:
            query = query.filter(AISignal.symbol == symbol)
        return query.order_by(AISignal.generated_at.desc()).limit(limit).all()

    @staticmethod
    def clear_conversations(db: Session, user_id: int) -> bool:
        db.query(AIConversation).filter(AIConversation.user_id == user_id).delete()
        db.commit()
        return True


ai_service = AIService()
