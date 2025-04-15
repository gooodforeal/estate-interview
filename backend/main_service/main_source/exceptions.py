from fastapi import status, HTTPException


UserAlreadyExistsException = HTTPException(
    status_code=status.HTTP_409_CONFLICT,
    detail='Such user already exists!'
)

IncorrectEmailOrPasswordException = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail='Invalid email or password!'
)

PasswordsMissMatchException = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail='Passwords do not match!'
)

TokenExpiredException = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail='Token expired!'
)

TokenNotFoundException = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail='Token not found!'
)

NoJwtException = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail='Invalid token!'
)

UserNotFoundException = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail='User not found!'
)


ScreeningNotFoundException = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail='Screening not found!'
)


DealNotFoundException = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail='Deal not found!'
)


NewNotFoundException = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail='New not found!'
)


ObjectNotFoundException = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail='Object not found!'
)

UserNotVerifiedException = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail='Please verify your email address'
)

MissingUserIdException = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail='Missing user id!'
)

NotAdminException = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail='Not enough rights!'
)

EmailSendException = HTTPException(
    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    detail='There was an error sending email!'
)

InvalidVerificationCodeException = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail='Invalid verification code or account already verified!'
)

