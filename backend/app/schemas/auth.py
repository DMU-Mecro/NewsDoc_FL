from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(
        ...,
        min_length=8,
        max_length=72,
        description="비밀번호는 8자 이상 72자 이하로 입력해야 합니다.",
    )


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"