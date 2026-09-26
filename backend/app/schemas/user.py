from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    preferred_language: Optional[str] = "EN"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    phone: Optional[str] = None
    role: str
    is_admin: bool = False
    onboarding_completed: bool = False
    tour_status: str = "NOT_STARTED"
    preferred_language: str
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdateOnboarding(BaseModel):
    onboarding_completed: Optional[bool] = None
    tour_status: Optional[str] = None
    preferred_language: Optional[str] = None


class UserLanguageUpdate(BaseModel):
    preferred_language: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
