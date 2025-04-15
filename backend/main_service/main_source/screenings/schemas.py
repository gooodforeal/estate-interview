from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


# Structures
class SObject(BaseModel):
    id: int
    title: str
    address: str

    model_config = ConfigDict(from_attributes=True)


class SUser(BaseModel):
    id: int
    fio: str
    avatar_link: Optional[str]

    model_config = ConfigDict(from_attributes=True)


class SScreening(BaseModel):
    id: int
    user_id: Optional[int] = None
    object_id: Optional[int]
    date_time: datetime
    created_at: datetime
    updated_at: datetime
    user: SUser
    object: SObject

    model_config = ConfigDict(from_attributes=True)


# Requests
class SAddScreening(BaseModel):
    user_id: Optional[int] = None
    object_id: Optional[int]
    date_time: datetime


class SEditScreening(BaseModel):
    date_time: datetime


# Responses
class SBaseResponse(BaseModel):
    status: str
    message: str


class SAddScreeningResponse(SBaseResponse):
    pass


class SEditScreeningResponse(SBaseResponse):
    pass


class SDeleteScreeningResponse(SBaseResponse):
    pass


class SGetScreeningResponse(SBaseResponse):
    data: SScreening


class SGetAllScreeningsResponse(SBaseResponse):
    data: list[SScreening]




