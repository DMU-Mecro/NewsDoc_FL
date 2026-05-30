from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(
        ...,
        min_length=8,
        max_length=72,
        description="비밀번호는 8자 이상 72자 이하로 입력해야 합니다.",
    )
    nickname: str | None = Field(
        default=None,
        max_length=50,
    )


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    nickname: str | None = None
    kakao_id: str | None = None
    is_active: bool
    created_at: datetime

    model_config = {
        "from_attributes": True
    }