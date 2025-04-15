import datetime
import hashlib
from random import randbytes
from fastapi import APIRouter, Response, Depends, Request, File, UploadFile

from main_source.config import settings
from main_source.users.auth import get_password_hash, authenticate_user, create_access_token
from main_source.rabbit_client import get_rabbit_client, RabbitClient
from main_source.users.repository import UsersRepository
from main_source.users.deps import get_current_user, get_current_admin_user
from main_source.users.models import UsersORM
from main_source.s3client import get_s3_client, S3Client

from main_source.exceptions import (
    UserAlreadyExistsException,
    PasswordsMissMatchException,
    IncorrectEmailOrPasswordException,
    EmailSendException,
    UserNotVerifiedException,
    InvalidVerificationCodeException,
    UserNotFoundException
)

from main_source.users.schemas import (
    SUserLogin,
    SUserRegister,
    SUserLoginResponse,
    SUserRegisterResponse,
    SUserVerifyResponse,
    SUserMeResponse,
    SUserLogoutResponse,
    SAllUsersResponse,
    SUser,
    SNotification,
    SUploadAvatarResponse,
    SUserMeStatsResponse,
    SUserStats,
    SUserWithStats,
    SGetUserResponse
)


router = APIRouter(prefix='/users', tags=['Users'])


@router.post("/register/")
async def register_user(
        request: Request, user_data: SUserRegister,
        rabbit_client: RabbitClient = Depends(get_rabbit_client)
) -> SUserRegisterResponse:
    user: UsersORM = await UsersRepository.find_one_or_none(email=user_data.email)
    # Check if user already exist
    if user:
        raise UserAlreadyExistsException
    # Compare password and password_repeat
    if user_data.password != user_data.password_repeat:
        raise PasswordsMissMatchException
    # Get dictionary from schema
    user_dict: dict = user_data.dict()
    del user_dict["password_repeat"]
    user_dict['password'] = get_password_hash(user_data.password)
    new_user: UsersORM = await UsersRepository.add(**user_dict)
    # Generate verification code
    try:
        # Handle token
        token = randbytes(6)
        hashed_code = hashlib.sha256()
        hashed_code.update(token)
        verification_code: str = hashed_code.hexdigest()
        # Update verification_code in database
        await UsersRepository.update(
            filter_by={"id": new_user.id},
            verification_code=verification_code
        )
        # Send to notification service
        url: str = f"{request.url.scheme}://{request.client.host}:{request.url.port}/users/verify-email/{token.hex()}"
        notification_dto: SNotification = SNotification(
            fio=new_user.fio,
            email=new_user.email,
            verification_url=url
        )
        rabbit_client.send_message(notification_dto.dict())
    except Exception as error:
        print(error)
        await UsersRepository.update(
            filter_by={"id": new_user.id},
            verification_code=None
        )
        raise EmailSendException
    return SUserRegisterResponse(
        status="ok",
        message="Verification token successfully sent to email!"
    )


@router.post("/login/")
async def auth_user(response: Response, user_data: SUserLogin) -> SUserLoginResponse:
    current_user_orm: UsersORM = await authenticate_user(email=user_data.email, password=user_data.password)
    # Check if user is found
    if current_user_orm is None:
        raise IncorrectEmailOrPasswordException
    # Check if user is verified
    if not current_user_orm.verified:
        raise UserNotVerifiedException
    # Create jwt token and set cookie
    access_token: str = create_access_token({"sub": str(current_user_orm.id)})
    response.set_cookie(key="users_access_token", value=access_token, httponly=True)
    current_user_schema: SUser = SUser.model_validate(current_user_orm.to_dict())
    return SUserLoginResponse(
        status="ok",
        message="Successful authorization!",
        access_token=access_token,
        refresh_token=None,
        user=current_user_schema
    )


@router.get('/verify_email/{token}')
async def verify_me(token: str) -> SUserVerifyResponse:
    # Handle token
    hashed_code = hashlib.sha256()
    hashed_code.update(bytes.fromhex(token))
    verification_code = hashed_code.hexdigest()
    # Update verification code in database
    check: int = await UsersRepository.update(
        filter_by={"verification_code": verification_code},
        verification_code=None,
        verified=True
    )
    if not check:
        raise InvalidVerificationCodeException
    return SUserVerifyResponse(
        status="ok",
        message="Successful verification!"
    )


@router.post("/logout/")
async def logout_user(response: Response) -> SUserLogoutResponse:
    response.delete_cookie(key="users_access_token")
    return SUserLogoutResponse(
        status="ok",
        message="Successful logout!"
    )


@router.get("/me")
async def get_me(user_data: UsersORM = Depends(get_current_user)) -> SUserMeResponse:
    user_orm = await UsersRepository.find_stats(id=user_data.id)
    user_schema = SUser(
        id=user_orm.id,
        fio=user_orm.fio,
        email=user_orm.email,
        password=user_orm.password,
        avatar_link=user_orm.avatar_link,
        verified=user_orm.verified,
        verification_code=user_orm.verification_code,
        is_admin=user_orm.is_admin,
        created_at=user_orm.created_at,
        updated_at=user_orm.updated_at,
        objects_count=len(user_orm.objects),
        deals_count=len(user_orm.deals),
        screenings_count=len(user_orm.screenings)
    )
    return SUserMeResponse(
        status="ok",
        message="Successful request!",
        data=user_schema
    )


@router.get("/me/stats")
async def get_me_stats(user_data: UsersORM = Depends(get_current_user)) -> SUserMeStatsResponse:
    current_user_data = await UsersRepository.find_stats(id=user_data.id)
    current_user_dict = {
        "id": current_user_data.id,
        "objects_count": len(current_user_data.objects),
        "deals_count": len(current_user_data.deals),
        "screenings_count": len(current_user_data.screenings)
    }
    return SUserMeStatsResponse(
        status="ok",
        message="Successful request!",
        data=SUserStats.model_validate(current_user_dict)
    )


@router.get("/all_users/")
async def get_all_users(user_data: UsersORM = Depends(get_current_admin_user)) -> SAllUsersResponse:
    # get all users from database
    all_users_orm: list[UsersORM] = await UsersRepository.find_stats_all()
    # Convert orm to pydantic schema
    all_users_schema: list[SUser] = []
    for user_orm in all_users_orm:
        user_schema = SUser(
            id=user_orm.id,
            fio=user_orm.fio,
            email=user_orm.email,
            password=user_orm.password,
            avatar_link=user_orm.avatar_link,
            verified=user_orm.verified,
            verification_code=user_orm.verification_code,
            is_admin=user_orm.is_admin,
            created_at=user_orm.created_at,
            updated_at=user_orm.updated_at,
            objects_count=len(user_orm.objects),
            deals_count=len(user_orm.deals),
            screenings_count=len(user_orm.screenings)
        )
        all_users_schema.append(user_schema)
    return SAllUsersResponse(
        status="ok",
        message="Successful request!",
        data=all_users_schema
    )


@router.post("/upload-avatar")
async def upload_file_bytes(
        file: UploadFile = File(...),
        s3_client: S3Client = Depends(get_s3_client),
        user_data: UsersORM = Depends(get_current_user)
) -> SUploadAvatarResponse:
    # Creating file name
    file_name: str = f"user_{user_data.id}_{datetime.datetime.now()}.jpg"
    # Uploading file to S3 storage
    await s3_client.upload_file(
        file=file.file.read(),
        object_name=file_name
    )
    # Saving file link in db
    await UsersRepository.update(
        filter_by={"id": user_data.id},
        avatar_link=f"{settings.S3_DOM}/{file_name}"
    )
    return SUploadAvatarResponse(
        status="ok",
        message="Successful request!",
        data=str(file.file.read())
    )


@router.get("/user/{user_id}")
async def get_user(user_id: int) -> SGetUserResponse:
    user_orm = await UsersRepository.find_stats(id=user_id)
    if user_orm is None:
        raise UserNotFoundException
    user_dict = {
        "id": user_orm.id,
        "fio": user_orm.fio,
        "email": user_orm.email,
        "created_at": user_orm.created_at,
        "avatar_link": user_orm.avatar_link,
        "is_admin": user_orm.is_admin,
        "objects_count": len(user_orm.objects),
        "deals_count": len(user_orm.deals),
        "screenings_count": len(user_orm.screenings)
    }
    return SGetUserResponse(
        status="ok",
        message="Successful request!",
        data=SUserWithStats.model_validate(user_dict)
    )