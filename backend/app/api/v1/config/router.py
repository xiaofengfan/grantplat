from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from ....core.database import get_db
from ....schemas import UserResponse
from ....api.v1.auth.router import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/config", tags=["系统配置"])


class ApiConfigCreate(BaseModel):
    name: str
    api_type: str
    endpoint: str
    api_key: Optional[str] = None
    api_secret: Optional[str] = None
    enabled: bool = True


class ApiConfigUpdate(BaseModel):
    name: Optional[str] = None
    api_type: Optional[str] = None
    endpoint: Optional[str] = None
    api_key: Optional[str] = None
    api_secret: Optional[str] = None
    enabled: Optional[bool] = None


class ApiConfigResponse(BaseModel):
    id: int
    name: str
    api_type: str
    endpoint: Optional[str] = None
    enabled: bool

    class Config:
        from_attributes = True


class ParamUpdate(BaseModel):
    key: str
    value: str


_in_memory_api_configs = [
    {"id": 1, "name": "新浪行情API", "api_type": "stock_quote", "endpoint": "https://hq.sinajs.cn/list=", "enabled": True},
    {"id": 2, "name": "腾讯证券API", "api_type": "stock_quote", "endpoint": "https://qt.gtimg.cn/q=", "enabled": True},
    {"id": 3, "name": "东方财富API", "api_type": "stock_quote", "endpoint": "https://push2.eastmoney.com/api/qt/stock/get", "enabled": True},
    {"id": 4, "name": "DeepSeek AI", "api_type": "ai", "endpoint": "https://api.deepseek.com/v1", "enabled": False},
]

_in_memory_params: Dict[str, str] = {
    "max_strategies": "50",
    "max_backtest_days": "365",
    "tick_data_retention": "30",
    "default_margin_ratio": "0.5",
    "max_position_per_stock": "0.1",
    "daily_loss_limit": "0.05",
}


@router.get("/apis", response_model=List[ApiConfigResponse])
def list_apis(
    current_user: UserResponse = Depends(get_current_user),
):
    return [ApiConfigResponse(**c) for c in _in_memory_api_configs]


@router.post("/apis", response_model=ApiConfigResponse)
def create_api(
    config: ApiConfigCreate,
    current_user: UserResponse = Depends(get_current_user),
):
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="需要管理员权限")
    new_id = max(c["id"] for c in _in_memory_api_configs) + 1
    new_config = {**config.model_dump(), "id": new_id}
    _in_memory_api_configs.append(new_config)
    return ApiConfigResponse(**new_config)


@router.put("/apis/{api_id}", response_model=ApiConfigResponse)
def update_api(
    api_id: int,
    config: ApiConfigUpdate,
    current_user: UserResponse = Depends(get_current_user),
):
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="需要管理员权限")
    for c in _in_memory_api_configs:
        if c["id"] == api_id:
            update_data = config.model_dump(exclude_unset=True)
            c.update(update_data)
            return ApiConfigResponse(**c)
    raise HTTPException(status_code=404, detail="配置不存在")


@router.delete("/apis/{api_id}")
def delete_api(
    api_id: int,
    current_user: UserResponse = Depends(get_current_user),
):
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="需要管理员权限")
    global _in_memory_api_configs
    _in_memory_api_configs = [c for c in _in_memory_api_configs if c["id"] != api_id]
    return {"message": "删除成功"}


@router.get("/params")
def list_params(
    current_user: UserResponse = Depends(get_current_user),
):
    return _in_memory_params


@router.put("/params")
def update_param(
    param: ParamUpdate,
    current_user: UserResponse = Depends(get_current_user),
):
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="需要管理员权限")
    _in_memory_params[param.key] = param.value
    return {"message": "更新成功"}