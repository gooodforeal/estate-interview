from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr


class SUser(BaseModel):
    id: int
    fio: str
    email: EmailStr
    password: str
    avatar_link: Optional[str]

    verified: bool
    verification_code: Optional[str]

    is_admin: bool

    created_at: datetime
    updated_at: datetime

    objects_count: Optional[int] = None
    deals_count: Optional[int] = None
    screenings_count: Optional[int] = None


class SUserWithStats(BaseModel):
    id: int
    fio: str
    email: EmailStr
    avatar_link: Optional[str]
    is_admin: bool
    created_at: datetime
    objects_count: int
    deals_count: int
    screenings_count: int


class SUserStats(BaseModel):
    id: int
    objects_count: int
    deals_count: int
    screenings_count: int


class SBaseResponse(BaseModel):
    status: str
    message: str


class SUserLogin(BaseModel):
    email: EmailStr = Field(..., description="Users email")
    password: str = Field(..., min_length=8, max_length=16, description="Users password")


class SUserLoginResponse(SBaseResponse):
    access_token: str
    refresh_token: Optional[str]
    user: SUser


class SUserRegister(SUserLogin):
    fio: str = Field(..., min_length=10, max_length=50, description="Users FCs")
    password_repeat: str = Field(..., min_length=8, max_length=16, description="Users password repeat")


class SGetUserResponse(SBaseResponse):
    data: SUserWithStats


class SUserRegisterResponse(SBaseResponse):
    pass


class SUserVerifyResponse(SBaseResponse):
    pass


class SUserMeResponse(SBaseResponse):
    data: SUser


class SUserMeStatsResponse(SBaseResponse):
    data: SUserStats


class SUserLogoutResponse(SBaseResponse):
    pass


class SAllUsersResponse(SBaseResponse):
    data: list[SUser]


class SNotification(BaseModel):
    fio: str
    email: EmailStr = Field(..., description="Users email")
    verification_url: str


class SUploadAvatarResponse(SBaseResponse):
    data: str
