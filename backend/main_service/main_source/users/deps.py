from datetime import datetime, timezone
from typing import Annotated, Union

from fastapi import Request, Depends
from jose import jwt, JWTError

from main_source.users.repository import UsersRepository
from main_source.users.models import UsersORM

from main_source.config import get_auth_data
from main_source.exceptions import TokenExpiredException
from main_source.exceptions import NoJwtException
from main_source.exceptions import UserNotFoundException
from main_source.exceptions import NotAdminException
from main_source.exceptions import MissingUserIdException
from main_source.exceptions import TokenNotFoundException


def get_token(request: Request) -> str:
    token = request.cookies.get('users_access_token')
    if not token:
        raise TokenNotFoundException
    return token


async def get_current_user(token: str = Depends(get_token)) -> UsersORM:
    # Decode jwt token
    try:
        auth_data = get_auth_data()
        payload = jwt.decode(token, auth_data['secret_key'], algorithms=auth_data['algorithm'])
    except JWTError:
        raise NoJwtException
    # Extract expire time from jwt token
    expire: str = payload.get('exp')
    expire_time = datetime.fromtimestamp(int(expire), tz=timezone.utc)
    if (not expire) or (expire_time < datetime.now(timezone.utc)):
        raise TokenExpiredException
    # Extract user id from jwt token
    user_id: str = payload.get('sub')
    if not user_id:
        raise MissingUserIdException
    # Find user in database
    user: UsersORM = await UsersRepository.find_one_or_none_by_id(int(user_id))
    if not user:
        raise UserNotFoundException
    return user


async def get_current_admin_user(current_user: UsersORM = Depends(get_current_user)) -> UsersORM:
    if current_user.is_admin:
        return current_user
    raise NotAdminException


CurrentUser = Annotated[UsersORM, Depends(get_current_user)]
CurrentAdminUser = Annotated[UsersORM, Depends(get_current_admin_user)]
