from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


# Structures
class SUser(BaseModel):
    id: int
    fio: str
    avatar_link: Optional[str]

    model_config = ConfigDict(from_attributes=True)


class SObject(BaseModel):
    id: int
    user_id: Optional[int] = None
    title: str
    address: str
    photo_link: Optional[str] = None
    author: str
    price: int
    total_square: float
    metro: Optional[str] = None
    floor: Optional[str] = None
    remont_type: Optional[str] = None
    description: Optional[str] = None
    cian_link: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SDeal(BaseModel):
    id: int
    user_id: int
    object_id: int
    price: int
    status: str
    created_at: datetime
    updated_at: datetime
    user: SUser
    object: SObject

    model_config = ConfigDict(from_attributes=True)


# Requests
class SAddDeal(BaseModel):
    user_id: Optional[int] = None
    object_id: Optional[int]
    price: int
    status: str


class SEditDeal(BaseModel):
    price: int
    status: str


class SDeleteDeal(BaseModel):
    pass


class SGetDeal(BaseModel):
    pass


class SGetAllDeals(BaseModel):
    pass


# Responses
class SBaseResponse(BaseModel):
    status: str
    message: str


class SAddDealResponse(SBaseResponse):
    pass


class SEditDealResponse(SBaseResponse):
    pass


class SDeleteDealResponse(SBaseResponse):
    pass


class SGetDealResponse(SBaseResponse):
    data: SDeal


class SGetAllDealsResponse(SBaseResponse):
    data: list[SDeal]

