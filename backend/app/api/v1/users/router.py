from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ....core.database import get_db
from ....schemas import UserCreate, UserUpdate, UserResponse
from ....services import user_service
from ....api.v1.auth.router import get_current_user
from ....models import User

router = APIRouter(prefix="/users", tags=["用户管理"])


@router.get("", response_model=List[UserResponse])
def list_users(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="需要管理员权限")
    users = user_service.get_all_users(db)
    return [UserResponse.model_validate(u) for u in users]


@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = user_service.get_user(db, current_user.id)
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    return UserResponse.model_validate(user)


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.user_type != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="权限不足")
    user = user_service.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    return UserResponse.model_validate(user)


@router.post("", response_model=UserResponse)
def create_user(
    user_data: UserCreate,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="需要管理员权限")
    try:
        user = user_service.create_user(db, user_data)
        return UserResponse.model_validate(user)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_data: UserUpdate,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.user_type != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="权限不足")
    user = user_service.update_user(db, user_id, user_data)
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    return UserResponse.model_validate(user)


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="需要管理员权限")
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="不能删除自己")
    success = user_service.delete_user(db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="用户不存在")
    return {"message": "删除成功"}