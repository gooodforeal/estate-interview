from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


# Structures
class SUser(BaseModel):
    id: int
    fio: str
    avatar_link: Optional[str]

    model_config = ConfigDict(from_attributes=True)


class SNew(BaseModel):
    id: int
    title: str
    description: str
    user_id: Optional[int]
    user: SUser
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Requests
class SNewsAdd(BaseModel):
    title: str
    description: str


# Responses
class SBaseResponse(BaseModel):
    status: str
    message: str


class SNewDeleteResponse(SBaseResponse):
    pass


class SNewsAddResponse(SBaseResponse):
    data: SNew


class SNewsResponse(SBaseResponse):
    data: list[SNew]
