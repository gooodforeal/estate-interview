from typing import Optional
from passlib.context import CryptContext
from pydantic import EmailStr
from jose import jwt
from datetime import datetime, timedelta, timezone

from main_source.users.repository import UsersRepository
from main_source.users.models import UsersORM
from main_source.config import get_auth_data


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=300)
    to_encode.update({"exp": expire})
    auth_data = get_auth_data()
    encode_jwt = jwt.encode(to_encode, auth_data['secret_key'], algorithm=auth_data['algorithm'])
    return encode_jwt


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


async def authenticate_user(email: EmailStr, password: str) -> Optional[UsersORM]:
    user_orm = await UsersRepository.find_one_or_none(email=email)
    if not user_orm or verify_password(plain_password=password, hashed_password=user_orm.password) is False:
        return None
    return user_orm
