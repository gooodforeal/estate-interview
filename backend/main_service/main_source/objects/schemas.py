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
    user: SUser

    model_config = ConfigDict(from_attributes=True)


# Requests
class SAddObjectM(BaseModel):
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


class SAddObject(BaseModel):
    pass


class SEditObject(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    price: Optional[int] = None
    description: Optional[str] = None


class SPres(BaseModel):
    object1_id: int
    object2_id: int


# Responses
class SBaseResponse(BaseModel):
    status: str
    message: str


class SAddObjectMResponse(SBaseResponse):
    pass


class SAddObjectResponse(SBaseResponse):
    pass


class SEditObjectResponse(SBaseResponse):
    pass


class SDeleteObjectResponse(SBaseResponse):
    pass


class SGetObjectResponse(SBaseResponse):
    data: SObject


class SGetAllObjectsResponse(SBaseResponse):
    data: list[SObject]


class SSetPhotoResponse(SBaseResponse):
    data: str



